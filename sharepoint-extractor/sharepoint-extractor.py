import logging
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    StaleElementReferenceException,
    NoSuchElementException,
    TimeoutException,
)
from webdriver_manager.chrome import ChromeDriverManager
from colorama import Fore, Style


download_dir = "./"  # Set your desired download directory here
log_file_base_name = "sharepoint-extractor"  # Set your log file name here
file_extension = ".zip"  # Set the file extension to download here
# Set the SharePoint URL to extract files from
sharepoint_url = "https://stuconestogacon.sharepoint.com.mcas.ms/sites/VARLab/Shared%20Documents/Forms/AllItems.aspx?view=7&q=%2Ezip"


# Custom formatter for console with selective coloring
class ColoredFormatter(logging.Formatter):
    def format(self, record):
        log_colors = {
            "DEBUG": Fore.CYAN,
            "INFO": Fore.GREEN,
            "WARNING": Fore.YELLOW,
            "ERROR": Fore.RED,
            "CRITICAL": Fore.MAGENTA,
        }
        log_color = log_colors.get(record.levelname, Fore.WHITE)

        # Custom string formatting with color for the log level
        levelname_colored = f"{log_color}{record.levelname}{Style.RESET_ALL}"
        
        formatted_message = f"{self.formatTime(record)} - {levelname_colored} - {record.message}"
        return formatted_message


# # Set up logging to file
log_file_name = f".{log_file_base_name}.log"
log_file_path = os.path.join(download_dir, log_file_name)

# Create a file handler that appends to a file in real time
file_handler = logging.FileHandler(log_file_path, mode='a')
file_handler.setLevel(logging.INFO)
file_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(file_formatter)

# Console handler with colored formatting
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = ColoredFormatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(console_formatter)

# Add both handlers to the root logger
logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(file_handler)
logging.getLogger().addHandler(console_handler)

# # Set up the Chrome driver
options = webdriver.ChromeOptions()

# Set up chrome download preferences
prefs = {
    "download.default_directory": download_dir,
    "download.prompt_for_download": False,  # Auto-download without a popup
    "download.directory_upgrade": True,
    "safebrowsing.enabled": True,  # Prevents Chrome's download protection from blocking the download
}
options.add_experimental_option("prefs", prefs)

options.add_argument("--log-level=3")  # Disable Chrome logging errors
options.add_argument("--disable-logging")

# Use Service to avoid deprecation warning
service = Service(ChromeDriverManager().install())

# # Initialize driver
driver = webdriver.Chrome(service=service, options=options)

# # Global variables
master_list = []


def setup_browser():
    driver.get("chrome://downloads")
    driver.execute_script(f"window.open('{sharepoint_url}');")
    driver.switch_to.window(driver.window_handles[1])


def wait_for_2fa():
    # Wait until the SharePoint main content is loaded
    try:
        wait = WebDriverWait(driver, 300)  # 5 minutes to login
        wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, '[data-automationid="DetailsRowCell"]')
            )
        )
        logging.info("Login successful! Proceeding with file checks...")
    except Exception as e:
        logging.error(f"Error during login or page load: {e}")
        driver.quit()
        exit()


def start_download_process(active_element):
    try:
        # Find the active element's element
        driver.execute_script("arguments[0].scrollIntoView(true);", active_element)
        logging.info("Scrolled to the active element.")
        
        time.sleep(2)  # Wait for the menu to appear
        
        # Wait for the download button to be present and clickable
        download_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-automationid="downloadCommand"]'))
        )
        # Click the download button
        download_button.click()
        logging.info("Clicked on the 'Download' button.")
        time.sleep(2)  # Wait for the download to start
    except TimeoutException:
        logging.error("Failed to find 'More options' or 'Download' button in time.")
    except NoSuchElementException:
        logging.error("Failed to locate DotDotDot element within the active element.")
    except Exception as e:
        logging.error(f"An error occurred while trying to download: {e}")


# Monitor the download folder for changes
def monitor_download_folder():
    logging.info("Monitoring downloads folder for new files...")
    before_files = os.listdir(download_dir)
    return before_files


# Check if a new file has started downloading
def check_download_started(before_files):
    after_files = os.listdir(download_dir)
    added_files = [file for file in after_files if file not in before_files]
    return added_files[0] if added_files else None


# Monitor the downloads and click "Resume" button if it appears
def monitor_downloads_tab(final_file_name):
    logging.info(f"Checking downloads tab for failed items related to {final_file_name}...")
    try:
        current_window = driver.current_window_handle
        driver.switch_to.window(driver.window_handles[0])  # Switch to the downloads tab
        time.sleep(10)
        try:
            # Access the shadow DOM to find the 'Resume' button for the correct file
            resume_clicked = driver.execute_script(f"""
                var downloadsManager = document.querySelector('downloads-manager');
                var downloadsList = downloadsManager.shadowRoot.getElementById('downloadsList');
                var items = downloadsList.querySelectorAll('downloads-item');
                for (var i = 0; i < items.length; i++) {{
                    var item = items[i];
                    var shadowRoot = item.shadowRoot;
                    
                    // Find the file name and match it with the final_file_name
                    var fileNameElement = shadowRoot.querySelector('a#file-link');
                    if (fileNameElement && fileNameElement.innerText.includes('{final_file_name}')) {{
                        
                        // Found the correct item, now check if there's a "More actions" button
                        var moreActionsButton = shadowRoot.querySelector('cr-icon-button[iron-icon="more-vert"]');
                        if (moreActionsButton) {{
                            moreActionsButton.click();
                        }}
                        
                        // Check if there is a resume button after clicking more actions
                        var resumeButton = shadowRoot.querySelector('#pause-or-resume');
                        if (resumeButton && resumeButton.innerText.trim() === 'Resume') {{
                            resumeButton.click();
                            return true;
                        }}
                    }}
                }}
                return false;
            """)
            if resume_clicked:
                logging.info(f"Clicked 'Resume' for {final_file_name}.")
            else:
                logging.info(f"No 'Resume' button found for {final_file_name}.")
        except Exception as e:
            logging.error(f"Error checking downloads tab: {e}")
        finally:
            driver.switch_to.window(current_window)  # Switch back to the original tab
    except Exception as e:
        logging.error(f"Error while monitoring downloads tab: {e}")


# Check if the download has completed
def check_download_completed(download_file, final_file_name):
    file_path = os.path.join(download_dir, download_file)
    final_path = os.path.join(download_dir, final_file_name)

    logging.info(f"Waiting for download of {download_file} to complete...")

    size = -1
    no_change_count = 0
    while True:
        # Check if the final file exists
        if os.path.exists(final_path):
            logging.info(f"File {final_file_name} already exists. Download complete.")
            return True  # Download is complete

        # Check if the .crdownload file exists
        if os.path.exists(file_path):
            try:
                new_size = os.path.getsize(file_path)
                if size == new_size:
                    no_change_count += 1
                    logging.info(f"File size hasn't changed for {no_change_count} checks.")
                    if no_change_count >= 3:
                        logging.info("File size hasn't changed for a while, checking for 'Resume' button...")
                        monitor_downloads_tab(final_file_name)
                        no_change_count = 0
                else:
                    size = new_size
                    logging.info(f"File {download_file} size: {size}. Still downloading...")
                    no_change_count = 0
            except FileNotFoundError:
                logging.info(f"{download_file} disappeared, possibly renamed or download interrupted.")
                # Since the file disappeared, we need to check for 'Resume' button
                monitor_downloads_tab(final_file_name)
        else:
            # The .crdownload file does not exist
            logging.info(f"{download_file} not found. Checking if final file exists...")
            if os.path.exists(final_path):
                logging.info(f"File {final_file_name} exists. Download complete.")
                return True
            else:
                # Neither file exists, perhaps download failed or was interrupted
                monitor_downloads_tab(final_file_name)
        # Wait a bit before checking again
        time.sleep(10)
        

def read_page_and_create_master_list():
    max_stuck_counter = 10  # Number of times the accessible name hasn't changed before breaking the loop
    counter = 0  # Initialize counter for tracking added items
    
    try:
        wait = WebDriverWait(driver, 10)
        seen_elements = set()  # Track added elements
        unchanged_count = 0  # Track how many times the accessible name hasn't changed
        prev_accessible_name = None  # Keep track of the previous accessible name

        while True:
            # Wait for the first button element (initial load)
            first_element = wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, '[data-automationid="FieldRenderer-name"]'))
            )

            try:
                # Re-find the active element after scrolling to avoid stale elements
                active_element = driver.switch_to.active_element

                # Extract the "accessible_name" attribute
                accessible_name = active_element.get_attribute('aria-label')  # 'aria-label' or another accessible attribute
                
                if accessible_name:
                    # Split the accessible_name to get the file name (assuming it's the first part)
                    file_name = accessible_name.split(",")[0].strip()

                    # Check if the file is a .zip file
                    if file_name.endswith(file_extension):
                        # Only add if it hasn't been seen before
                        if file_name not in seen_elements:
                            master_list.append(file_name)
                            seen_elements.add(file_name)
                            counter += 1  # Increment the counter when a new item is added
                            logging.info(f"Tracking: {file_name}")
                            # Check if the file_name exists in the download directory
                            file_path = os.path.join(download_dir, file_name)
                            if not os.path.exists(file_path):
                                logging.info(f"File not found locally. Triggering download: {file_name}")
                                # Click the element to trigger the download
                                try:
                                    before_files = monitor_download_folder()
                                    download_file = None
                                    time.sleep(0.1)  # Sleep to avoid overloading the browser
                                    start_download_process(active_element)
                                    
                                    while download_file is None:
                                        download_file = check_download_started(before_files)
                                        time.sleep(1)
                                        
                                    logging.info(f"Download started: {download_file}")
                                    
                                    active_element.click()
                                    logging.info("Returned to the active element.")
                                    check_download_completed(download_file, file_name)
                                    
                                except Exception as click_error:
                                    logging.error(f"Failed to trigger download for {file_name}: {click_error}")
                            else:
                                logging.info(f"File already exists locally: {file_name}")
                        else:
                            logging.info(f"Skipped duplicate: {file_name}")
                    else:
                        logging.info(f"Skipped non-zip file: {file_name}")

                # Check if the accessible name has changed
                if accessible_name == prev_accessible_name:
                    unchanged_count += 1
                else:
                    unchanged_count = 0  # Reset the count if accessible name changes

                # Break the loop if the accessible name hasn't changed for x iterations
                if unchanged_count >= max_stuck_counter:
                    logging.info(f"Accessible name hasn't changed for {max_stuck_counter} iterations. Exiting loop.")
                    break

                # Update the previous accessible name
                prev_accessible_name = accessible_name
                
                # Scroll down after processing each element
                ActionChains(driver).send_keys('\ue015').perform()  # Down arrow key

            except StaleElementReferenceException:
                # Catch stale element and continue to refind the active element
                logging.warning("Encountered a stale element. Refinding active element.")
            except Exception as e:
                logging.error(f"Error processing element: {e}")
                
            time.sleep(0.1)  # Sleep to avoid overloading the browser

    except TimeoutException as e:
        logging.error(f"Timed out waiting for the elements: {e}")
    
    # Log the total number of items added after the loop
    logging.info(f"Total items added: {counter}")


def process_page():
    # Remove the header elements to avoid blocking the active element
    driver.execute_script(f"""
        var element = document.querySelector('.ms-FocusZone.css-91.ms-DetailsHeader');
        if (element) {{
            element.remove();
            console.log("Element removed successfully.");
        }} else {{
            console.log("Element not found.");
        }}
    """)
    # Remove the Content header element
    driver.execute_script(f"""
        var element = document.querySelector('div.od-ItemsScopeItemContent-header.od-ItemContent-header');
        if (element) {{
            element.remove();
            console.log("Element removed successfully.");
        }} else {{
            console.log("Element not found.");
        }}
    """)

    ActionChains(driver).send_keys('\ue015').perform()  # Down arrow key
    time.sleep(0.1)
    ActionChains(driver).send_keys('\ue013').perform()  # Up arrow key
    time.sleep(0.05)
    read_page_and_create_master_list()


# # Main
try:
    setup_browser()
    wait_for_2fa()
    process_page()
except Exception as e:
    logging.error(f"Error during page processing: {e}")
finally:
    logging.info("Closing the browser...")
    driver.quit()
