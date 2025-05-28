import os
import subprocess
import json
import requests
import logging
import io
import zipfile
from colorama import Fore, Style
import cohere
import re
from dotenv import load_dotenv
import base64
import enchant
import nltk
from nltk.stem import WordNetLemmatizer

ROOT_ASSET_PATH = "A:\\VARLab FinalFinal AMB"  # Root path for assets
COHERE_API_KEY = "cohere-api-key"  # API key for Cohere
PROJECT_FOLDERS = {"LSM8.03 - Ambulance and Paramedicine"}  # Empty set means process all project folders
PROJECT_DESTINATION_NAMES = ["Ambulance"]  # Destination project tag for the assets (must already exist in the database)
API_URL = "http://localhost:3000/api/asset"  # Local endpoint for testing
#API_URL = "https://assetstore.vconestoga.com/api/asset"  # API endpoint for uploading assets
REFRESH_TOKEN = "aaa.bbb.ccc"  # Refresh token for authentication
ASSET_TEXTURE_FOLDERS = {'Textures (Compressed)', 'Texture Files'}  # Texture folders to search for image files
LOG_FILE_BASE_NAME = "upload-automation"  # Base name for log files
LOG_MODE = logging.INFO  # Logging level (DEBUG or INFO)
PREVIEW_FORMAT = "webp"  # Set your desired format (e.g., "png", "webp")
GLOBAL_ASSET_TAGS = ["3d"]  # Tags to be added to all assets (Array of strings)


def set_working_directory_and_load_env(env_dir='./3d-preview-generator/.env'):
    """
    Set the working directory to the directory where the script is located,
    load environment variables, and set them globally in the environment.

    Args:
    - env_dir (str): Path to the .env file relative to the script directory. Default is './3d-preview-generator/.env'.

    Returns:
    - None
    """
    # Set the working directory to the folder where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    try:
        # Load environment variables from the .env file and set them globally
        load_dotenv(dotenv_path=env_dir, override=True)
    except Exception as e:
        logging.error(f"Error loading environment variables: {e}")

    # Check if VITE_PGEN_PORT and SERVER_PORT exist, otherwise set default values
    vite_port = os.getenv("VITE_PGEN_PORT")
    server_port = os.getenv("VITE_SERVER_PORT")

    if vite_port is None:
        os.environ["VITE_PGEN_PORT"] = "4000"  # Default Vite port
        print("VITE_PGEN_PORT not found. Setting default: 4000")

    if server_port is None:
        os.environ["VITE_SERVER_PORT"] = "4040"  # Default Server port
        print("VITE_SERVER_PORT not found. Setting default: 4040")


class ColoredFormatter(logging.Formatter):
    """
    Custom logging formatter that adds colors to console output based on the log level.
    """
    def format(self, record):
        log_colors = {
            "DEBUG": Fore.CYAN,
            "INFO": Fore.GREEN,
            "WARNING": Fore.YELLOW,
            "ERROR": Fore.RED,
            "CRITICAL": Fore.MAGENTA,
        }
        log_color = log_colors.get(record.levelname, Fore.WHITE)
        levelname_colored = f"{log_color}{record.levelname}{Style.RESET_ALL}"
        formatted_message = f"{self.formatTime(record)} - {levelname_colored} - {record.message}"
        return formatted_message


def setup_logger():
    """
    Sets up logging configurations for the script, including file and console handlers with appropriate formatting.
    """
    log_file_name = f".{LOG_FILE_BASE_NAME}.log"
    log_file_path = os.path.join(ROOT_ASSET_PATH, log_file_name)

    # Clear existing handlers to avoid duplicates
    logger = logging.getLogger()
    if logger.hasHandlers():
        logger.handlers.clear()

    # File handler for main logs
    file_handler = logging.FileHandler(log_file_path, mode='a')
    file_handler.setLevel(LOG_MODE)
    file_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_formatter)

    # Console handler with colored output
    console_handler = logging.StreamHandler()
    console_handler.setLevel(LOG_MODE)
    console_formatter = ColoredFormatter('%(asctime)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)

    # Root logger configuration
    logger.setLevel(LOG_MODE)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    # Logger for successful asset uploads
    success_log_file_name = f".{LOG_FILE_BASE_NAME}-asset-ledger.log"
    success_log_file_path = os.path.join(ROOT_ASSET_PATH, success_log_file_name)

    success_file_handler = logging.FileHandler(success_log_file_path, mode='a')
    success_file_handler.setLevel(LOG_MODE)
    success_file_formatter = logging.Formatter('%(asctime)s - %(message)s')
    success_file_handler.setFormatter(success_file_formatter)

    success_logger = logging.getLogger('successful_assets_logger')
    if success_logger.hasHandlers():
        success_logger.handlers.clear()
    success_logger.setLevel(LOG_MODE)
    success_logger.addHandler(success_file_handler)

    # Logger for errored asset uploads
    error_log_file_name = f".{LOG_FILE_BASE_NAME}-asset-ledger-error.log"
    error_log_file_path = os.path.join(ROOT_ASSET_PATH, error_log_file_name)

    error_file_handler = logging.FileHandler(error_log_file_path, mode='a')
    error_file_handler.setLevel(LOG_MODE)
    error_file_formatter = logging.Formatter('%(asctime)s - %(message)s')
    error_file_handler.setFormatter(error_file_formatter)

    error_logger = logging.getLogger('errored_assets_logger')
    if error_logger.hasHandlers():
        error_logger.handlers.clear()
    error_logger.setLevel(LOG_MODE)
    error_logger.addHandler(error_file_handler)


def install_npm_dependencies(subdirectory):
    """
    Installs npm dependencies in the specified subdirectory if they are not already installed.

    Args:
        subdirectory (str): The subdirectory where npm dependencies should be installed.
    """
    script_directory = os.path.dirname(os.path.realpath(__file__))
    target_directory = os.path.join(script_directory, subdirectory)

    if not os.path.exists(target_directory):
        logging.error(f"Subdirectory {target_directory} does not exist.")
        return

    package_json_path = os.path.join(target_directory, 'package.json')
    if not os.path.exists(package_json_path):
        logging.error(f"package.json not found in {target_directory}. Cannot install dependencies.")
        return

    node_modules_path = os.path.join(target_directory, 'node_modules')

    if os.path.exists(node_modules_path):
        logging.info(f"Dependencies already installed in {target_directory}")
    else:
        # Check if Node.js is installed
        try:
            result = subprocess.run('node -v', shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=os.environ)
            logging.info(f"Node.js version: {result.stdout.decode('utf-8').strip()}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logging.error("Node.js is not installed or not found in the system path.")
            return

        try:
            logging.info(f"Installing dependencies in {target_directory} using npm...")
            process = subprocess.Popen('npm install', cwd=target_directory, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=os.environ, text=True)

            # Stream the output in real-time
            for line in process.stdout:
                logging.info(line.strip())  # Log each line of output as it arrives

            process.wait()
            logging.info("npm install finished.")

        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            logging.error(f"An error occurred during npm install: {e}")


def generate_description(filename, project_name, metadata):
    """
    Generates a detailed yet concise description of the asset using Cohere's language model.

    Args:
        filename (str): The name of the asset file.
        project_name (str): The name of the project.
        metadata (dict): Metadata associated with the asset.

    Returns:
        str: A generated description of the asset.
    """
    # Condense metadata for each asset in the list
    condensed_assets = [
        {
            "name": asset.get("name", "Unknown Name"),
            "fileName": asset.get("fileName", filename),
            "fileSize": asset.get("fileSize", "Unknown Size")
        }
        for asset in metadata
    ]

    # Format the metadata for use in the prompt
    condensed_metadata_str = "; ".join(
        f"Name: {asset['name']}, FileName: {asset['fileName']}, Size: {asset['fileSize']}"
        for asset in condensed_assets
    )
    try:
        co = cohere.Client(COHERE_API_KEY)
        prompt = (
            f"Using the following metadata and filename, generate a detailed yet easy-to-understand description of the asset. "
            f"The description should be concise but thorough, summarizing the asset in around 50 words, written as a complete paragraph WITHOUT any unnecessary phrases like 'this is a description of'. "
            f"It should also be written for a general audience, avoiding overly technical terms or unnecessary specifications like no polygon counts and no numbers "
            f"Focus on describing the asset's main purpose and characteristics in a simple and user-friendly way, without mentioning the project or using excessive technical details. "
            f"Provide useful information without diving into complex technical aspects. (high level)"
            f"Format the response as: 'This asset is [description of the item].' "
            f"Filename: {filename}, Sub files: {condensed_metadata_str}, Project: {project_name}."
        )

        logging.info(f"Generating description for: {filename}")
        response = co.generate(
            model='command',
            prompt=prompt[:4000],
            temperature=0.5,
        )

        return response.generations[0].text.strip()
    except Exception as e:
        logging.error(f"Error generating description for {filename}: {e}")
        exit(1)
        return None


def get_fbx_metadata(fbx_file_path):
    """
    Retrieves metadata from an FBX file using an external Node.js script.

    Args:
        fbx_file_path (str): The path to the FBX file.

    Returns:
        dict: The metadata extracted from the FBX file.
    """
    try:
        result = subprocess.run(
            ['node', './metadata-extractor/metadata-extractor.js', fbx_file_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )

        if result.returncode != 0:
            logging.error(f"Error executing the Node.js script: {result.stderr.strip()}")
            raise Exception(f"Error executing the Node.js script: {result.stderr.strip()}")

        metadata = json.loads(result.stdout)
        if 'error' in metadata:
            logging.error(f"Error in metadata extraction: {metadata['error']}")
            raise Exception(f"Error in metadata extraction: {metadata['error']}")

        return metadata

    except Exception as e:
        logging.error(f"Error retrieving FBX metadata: {e}")
        return None


def count_image_files_in_texture_folders(asset_folder_path):
    """
    Counts unique image files in specified texture folders within the asset folder.

    Args:
        asset_folder_path (str): The path to the asset folder.

    Returns:
        int: The total number of unique image files.
    """
    unique_files = set()  # To store unique image file names
    target_folders = ASSET_TEXTURE_FOLDERS
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'}

    for dirpath, dirnames, filenames in os.walk(asset_folder_path):
        # Check if the directory path ends with any of the target folders
        if any(dirpath.endswith(target_folder) for target_folder in target_folders):
            # Recursively go through the directory and all nested directories
            for subdirpath, subdirnames, subfilenames in os.walk(dirpath):
                for filename in subfilenames:
                    # Check if the file has a valid image extension
                    if os.path.splitext(filename)[1].lower() in image_extensions:
                        # Add the file to the set (this ensures uniqueness)
                        unique_files.add(filename)

    return len(unique_files)


def clean_asset_name(asset_name):
    """
    Cleans and formats the asset name by removing unnecessary characters and patterns.

    Args:
        asset_name (str): The original asset name.

    Returns:
        str: The cleaned asset name.
    """
    try:
        asset_name = re.sub(r"Asset Files -\s*", "", asset_name)  # Remove "Asset Files - " if it exists
        asset_name = re.sub(r"[{}\[\]()]", "", asset_name)  # Remove all types of brackets (square, round, and curly)
        asset_name = re.sub(r"[-_.]+", " ", asset_name)  # Replace characters like dashes, underscores, and periods between words with a space
        asset_name = re.sub(r"([A-Z])([A-Z][a-z])", r"\1 \2", asset_name)  # Add space before a capital letter followed by a lowercase letter, but ignore consecutive capitals (acronyms)
        asset_name = re.sub(r"([a-z])([A-Z])", r"\1 \2", asset_name)  # Add space before a capital letter that follows a lowercase letter
        asset_name = re.sub(r"([a-zA-Z])(\d)", r"\1 \2", asset_name)  # Add space before a number if it follows a lowercase letter or a capital letter
        asset_name = re.sub(r"(\d)x\s*(\d)", r"\1x\2", asset_name)  # Remove spaces between numbers and 'x' like "4x 4" to become "4x4"
        asset_name = re.sub(r"\s+", " ", asset_name).strip()  # Remove extra spaces

        return asset_name
    except Exception as e:
        logging.error(f"Error cleaning asset name: {e}")
        return asset_name


def send_fbx_api_request(refresh_token, main_file, asset_metadata, model_metadata, image_bytes_list):
    """
    Sends an API request to upload an FBX asset file.

    Args:
        refresh_token (str): The refresh token for authentication.
        main_file (dict): Contains 'filename' and 'zip' of the asset.
        asset_metadata (dict): Metadata for the asset.
        model_metadata (dict): Model-specific metadata.

    Returns:
        bool: True if the upload was successful, False otherwise.
    """
    url = API_URL
    cookies = {'refreshToken': refresh_token}
    files = [
        ("mainFile", (f"{main_file['filename']}.zip", main_file['zip'], 'application/zip'))
    ]

    # Prepare the list of preview images under the same key "previewImages"
    preview_images = [
        ("previewImages", (image.name, image.getvalue(), f'image/${PREVIEW_FORMAT}'))
        for image in image_bytes_list
    ]

    # Add the preview images to the files list
    files.extend(preview_images)

    form_data = {
        "name": clean_asset_name(main_file['filename']),
        "description": asset_metadata['description'],
        "projects": json.dumps(asset_metadata['projects']),
        "categories": json.dumps(asset_metadata['categories']),
        "tags": json.dumps(asset_metadata['tags']),
        "model": json.dumps(model_metadata)
    }

    try:
        logging.info(f"Uploading asset file for {form_data['name']}...")
        response = requests.post(url, files=files, data=form_data, cookies=cookies)
        response_json = response.json()

        if response.status_code == 200:
            if "error" in response_json:
                raise Exception(f"Error in the response body: {response_json['error']}")
            else:
                logging.info("Asset file uploaded successfully!")
                return True
        else:
            raise Exception(f"Failed to upload asset file: {response.status_code}, {response_json['error']}")

    except Exception as e:
        logging.error(f"Error during API request: {e}")
        return False


# def send_texture_api_request(metadata_list):


def check_fbx_exists(directory):
    """
    Checks if any .fbx files exist in the given directory.

    Args:
        directory (str): The path of the directory to search for .fbx files.

    Returns:
        bool: True if at least one .fbx file is found, False otherwise.
    """
    try:
        for root, _, files in os.walk(directory):
            for file in files:
                if file.lower().endswith('.fbx'):
                    logging.debug(f".fbx file found: {os.path.join(root, file)}")
                    return True
        logging.debug(f"No .fbx files found in '{directory}'")
        return False
    except Exception as e:
        logging.error(f"Error while searching for .fbx files: {e}")
        return False


def process_fbx_files_in_asset_folder(asset_folder_path):
    """
    Processes all FBX files in the given asset folder and collects their metadata.

    Args:
        asset_folder_path (str): The path to the asset folder to process.

    Returns:
        list: A list of metadata dictionaries for each FBX file found.
    """
    metadata_list = []
    preview_list = []

    # Walk through the asset folder to find and process FBX files
    for root, dirs, files in os.walk(asset_folder_path):
        for file_name in files:
            if file_name.lower().endswith('.fbx'):
                fbx_file_path = os.path.join(root, file_name)
                logging.info(f"Found FBX file: {fbx_file_path}")

                try:
                    # Retrieve FBX metadata using the external script
                    metadata = get_fbx_metadata(fbx_file_path)
                    if metadata:
                        metadata_list.append(metadata)
                        logging.info(f"Successfully processed metadata for {fbx_file_path}")

                        try:
                            change_preview_gen_filename(file_name)
                            screenshot_json = run_make_preview_and_get_encoded_screenshot()
                            if screenshot_json:
                                preview_list.append({'file_name': file_name.replace('.fbx', f'.{PREVIEW_FORMAT}'),
                                                     'base64': screenshot_json["screenshotBase64"]})

                        except Exception as e:
                            logging.error(f"Error forwarding filename to the Express server: {e}")
                            raise Exception(f"Error forwarding filename to the Express server: {e}")
                    else:
                        logging.error(f"Failed to retrieve metadata for {fbx_file_path}")
                        raise Exception(f"Failed to retrieve metadata for {fbx_file_path}")
                except Exception as e:
                    logging.error(f"This fbx is corrupted!! {e}")
                    raise Exception(f"This fbx is corrupted!! {e}")

    return metadata_list, preview_list


def aggregate_metadata(metadata_list):
    """
    Aggregates the metadata fields from a list of FBX file metadata.

    Args:
        metadata_list (list): A list of metadata dictionaries to aggregate.

    Returns:
        dict: A dictionary with the aggregated metadata.
    """
    aggregated_data = {
        'triCount': 0,
        'vertices': 0,
        'edges': 0,
        'lodCount': 0,
        'polygons': 0,
        'rigType': "NONE",
        'animationCount': 0,
        'textureCount': 0
    }

    for metadata in metadata_list:
        aggregated_data['triCount'] += metadata['model'].get('triCount', 0)
        aggregated_data['vertices'] += metadata['model'].get('vertices', 0)
        aggregated_data['edges'] += metadata['model'].get('edges', 0)
        aggregated_data['lodCount'] += metadata['model'].get('lodCount', 0)
        aggregated_data['polygons'] += metadata['model'].get('polygons', 0)
        aggregated_data['rigType'] = metadata['model'].get('rigType', "NONE")
        aggregated_data['animationCount'] += metadata['model'].get('animationCount', 0)

    return aggregated_data


def zip_folder_in_memory(folder_path):
    """
    Creates a zip archive of the given folder in memory.

    Args:
        folder_path (str): The path to the folder to zip.

    Returns:
        BytesIO: The in-memory zip archive.
    """
    try:
        logging.info(f"Zipping folder: {folder_path}")
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    zipf.write(file_path, os.path.relpath(file_path, folder_path))
        memory_file.seek(0)
        logging.info(f"Successfully zipped folder: {folder_path}")
        return memory_file
    except Exception as e:
        logging.error(f"Error zipping folder: {e}")
        return None


def change_preview_gen_directory(new_directory):
    """
    Makes a POST request to change the root directory on the Express server.

    :param api_url: The URL for the API (e.g., 'http://localhost:8000/set-directory')
    :param new_directory: The new directory path to set as root
    """
    try:
        # Prepare the request data
        data = {
            'directoryPath': new_directory
        }

        # Make the POST request to change the directory
        response = requests.post(f"http://localhost:{os.getenv('VITE_SERVER_PORT')}/set-directory", json=data)

        # Log the response
        if response.status_code == 200:
            logging.info(f"Directory changed successfully: {response.text}")
        else:
            logging.info(f"Failed to change directory. Status Code: {response.status_code} | Response: {response.text}")

    except requests.RequestException as e:
        logging.info(f"Error occurred during the request: {e}")    


def change_preview_gen_filename(filename):
    """
    Makes a POST request to forward the filename to the Express server.

    :param filename: The filename to be forwarded (e.g., 'example_file.fbx')
    """
    try:
        # Prepare the request data
        data = {
            'filename': filename
        }

        # Make the POST request to forward the filename
        response = requests.post(f"http://localhost:{os.getenv('VITE_SERVER_PORT')}/forward-filename", json=data)

        # Log the response
        if response.status_code == 200:
            logging.info(f"Filename forwarded successfully. Status Code: {response.status_code} | Response: {response.text}")
        else:
            logging.info(f"Failed to forward filename. Status Code: {response.status_code} | Response: {response.text}")

    except requests.RequestException as e:
        logging.info(f"Error occurred during the request: {e}")


def start_3d_preview_servers():
    """
    Starts the 3D preview generator servers located in the '3d-preview-generator' folder using 'npm start'.
    This process will remain open until the program ends.
    """
    try:
        # Navigate to the 3d-preview-generator directory and start the servers
        server_process = subprocess.Popen(
            ['npm', 'start'],
            cwd='./3d-preview-generator',
            shell=True
        )

        logging.info("3D preview generator servers started.")
        return server_process

    except Exception as e:
        logging.error(f"Error starting 3D preview generator servers: {e}")
        return None


def run_make_preview_and_get_encoded_screenshot():
    """
    Runs the 'node utils/make-preview.js' command located in 'src/utils', captures the output, 
    filters the JSON portion, and parses it to extract the 'screenshotBase64' value.

    Returns:
        dict: The parsed JSON containing 'screenshotBase64' and other metadata.
    """
    try:
        # Run the node command to generate the preview and capture the output
        logging.info("Running 'node src/utils/make-preview.js' to generate preview...")
        result = subprocess.run(
            ['npm', 'run', 'genpreview'],
            cwd='./3d-preview-generator',
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True
        )

        # Check if the command was successful
        if result.returncode != 0:
            logging.error(f"Error executing 'node src/utils/make-preview.js': {result.stderr.strip()}")
            raise Exception(f"Error executing 'node src/utils/make-preview.js': {result.stderr.strip()}")

        # Extract JSON portion from the output
        output = result.stdout.strip()

        # Use regex to find the JSON part
        json_match = re.search(r'({\s*"status".*})', output, re.DOTALL)
        if json_match:
            json_data = json_match.group(1)
            try:
                # Parse the JSON data
                parsed_json = json.loads(json_data)
                return parsed_json
            except json.JSONDecodeError:
                logging.error("Failed to parse JSON from the output.")
                raise Exception("Failed to parse JSON from the output.")
        else:
            logging.error("No JSON found in the output.")
            raise Exception("No JSON found in the output.")

    except Exception as e:
        logging.error(f"Error running 'node src/utils/make-preview.js' and extracting JSON: {e}")
        return None


def create_byteio_list(preview_list):
    byteio_list = []

    for item in preview_list:
        # Get base64 string from the item dictionary
        base64_str = item.get('base64', '')

        # Decode the base64 string
        img_data = base64.b64decode(base64_str)

        # Create a BytesIO object from the decoded data
        byte_io = io.BytesIO(img_data)

        # Optionally, store the filename in the BytesIO object for later use
        byte_io.name = item.get('file_name', f'unknown.{PREVIEW_FORMAT}')

        # Append the BytesIO object to the list
        byteio_list.append(byte_io)

    return byteio_list


def traverse_and_process_assets(project_folder_path):
    """
    Traverses the given project folder path to find and process FBX files in asset subdirectories.

    Args:
        project_folder_path (str): The path of the project folder to traverse and process.
    """
    try:
        logging.info(f"Processing project folder: {project_folder_path}")

        asset_parent_folders = {
            folder for folder in os.listdir(project_folder_path)
            if os.path.isdir(os.path.join(project_folder_path, folder))
        }

        for asset_parent_folder in asset_parent_folders:
            asset_parent_folder_path = os.path.join(project_folder_path, asset_parent_folder)
            change_preview_gen_directory(asset_parent_folder_path)
            if not os.path.exists(asset_parent_folder_path):
                logging.warning(f"Asset folder '{asset_parent_folder}' does not exist in '{project_folder_path}'")
                continue

            logging.info(f"Traversing asset folder: {asset_parent_folder_path}")

            for asset_folder in os.listdir(asset_parent_folder_path):
                asset_folder_path = os.path.join(asset_parent_folder_path, asset_folder)
                try:
                    if not check_fbx_exists(asset_folder_path):
                        logging.info(f"No .fbx files found in asset folder: {asset_folder_path}")
                        raise Exception(f"No .fbx files found in asset folder: {asset_folder_path}")
                    metadata_list, preview_list = process_fbx_files_in_asset_folder(asset_folder_path)
                except Exception as e:
                    logging.error(f"Error processing asset folder '{asset_folder_path}': {e}")
                    error_logger = logging.getLogger('errored_assets_logger')
                    error_logger.error(f"{os.path.basename(project_folder_path)}/{os.path.basename(asset_folder_path)}\t---\t---\t{asset_folder_path}\t---\t{e}")
                    continue

                main_file = {
                    "filename": os.path.basename(asset_folder_path),
                    "zip": zip_folder_in_memory(asset_folder_path)
                }

                if metadata_list and preview_list:
                    combined_model_metadata = aggregate_metadata(metadata_list)
                    combined_model_metadata['textureCount'] = count_image_files_in_texture_folders(asset_folder_path)
                    generated_tags = generate_tags(clean_asset_name(os.path.basename(asset_folder_path)))
                    asset_metadata = {
                        "description": generate_description(os.path.basename(asset_folder_path), os.path.basename(project_folder_path), metadata_list),
                        "projects": PROJECT_DESTINATION_NAMES,
                        "categories": ["model"],
                        "tags": GLOBAL_ASSET_TAGS + (generated_tags if generated_tags else [])
                    }
                    image_bytes_list = create_byteio_list(preview_list)
                    try:
                        if send_fbx_api_request(REFRESH_TOKEN, main_file, asset_metadata, combined_model_metadata, image_bytes_list):
                            success_logger = logging.getLogger('successful_assets_logger')
                            success_logger.info(f"{os.path.basename(project_folder_path)}/{os.path.basename(asset_folder_path)}\t---\t---\t{asset_folder_path}")
                        else:
                            error_logger = logging.getLogger('errored_assets_logger')
                            error_logger.error(f"{os.path.basename(project_folder_path)}/{os.path.basename(asset_folder_path)}\t---\t---\t{asset_folder_path}")
                            continue
                    except Exception as e:
                        logging.error(f"Error sending API request for asset folder '{asset_folder_path}': {e}")
                        error_logger = logging.getLogger('errored_assets_logger')
                        error_logger.error(f"{os.path.basename(project_folder_path)}/{os.path.basename(asset_folder_path)}\t---\t---\t{asset_folder_path}\t---\t{e}")
                        continue
                else:
                    logging.info(f"No .fbx files found in asset folder: {asset_folder_path}. Sending non-FBX request.")
                    asset_metadata = {
                        "description": generate_description(os.path.basename(asset_folder_path), os.path.basename(project_folder_path)),
                        "projects": PROJECT_DESTINATION_NAMES,
                        "categories": ["texture"],
                        "tags": ["colour"]
                    }
                    # send_texture_api_request  # Placeholder for sending texture API request
                    logging.info(f"Successfully sent non-FBX request for asset folder {asset_folder_path}")
    except Exception as e:
        logging.error(f"Error while processing project folder '{project_folder_path}': {e}")


def get_project_folders(root_source_path, project_folders=None):
    """
    Retrieves the set of project folders to process.

    Args:
        root_source_path (str): The root directory containing project folders.
        project_folders (set, optional): Specific project folders to process.

    Returns:
        set: A set of project folder names.
    """
    if not project_folders:
        try:
            return {
                folder for folder in os.listdir(root_source_path)
                if os.path.isdir(os.path.join(root_source_path, folder))
            }
        except Exception as e:
            logging.error(f"Error retrieving project folders from '{root_source_path}': {e}")
            return set()
    return project_folders


nltk.download('punkt_tab', quiet=True)
nltk.download('wordnet')
english_dict = enchant.Dict("en_US")
lemmatizer = WordNetLemmatizer()


def generate_tags(input_string: str) -> list[str]:
    """
    Generate up to two real English word tags from the input string,
    converting plurals to singular form if applicable.

    Parameters:
        input_string (str): The string to generate tags from.

    Returns:
        list[str]: An array of up to two real English word tags.
    """
    # Tokenize the input string
    words = nltk.word_tokenize(input_string.lower())

    # Filter tokens to include only valid English words and process plurals
    real_words = [
        lemmatizer.lemmatize(word)  # Convert to singular form
        for word in words
        if english_dict.check(word) and len(word) > 1 and word.isalpha()
    ]

    return real_words


if __name__ == "__main__":
    try:
        setup_logger()
        set_working_directory_and_load_env()
        install_npm_dependencies('metadata-extractor')
        install_npm_dependencies('3d-preview-generator')
        server_process = start_3d_preview_servers()
        if server_process:
            logging.info("Process started.")
            project_folders = get_project_folders(ROOT_ASSET_PATH, PROJECT_FOLDERS)
            for projectFolderName in project_folders:
                traverse_and_process_assets(os.path.join(ROOT_ASSET_PATH, projectFolderName))
        server_process.terminate()
        logging.info("3D preview servers terminated.")
    except Exception as e:
        logging.error(f"Error during processing: {e}")
    finally:
        logging.info("End of script.")
