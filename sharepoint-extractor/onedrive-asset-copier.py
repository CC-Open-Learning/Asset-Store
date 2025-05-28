"""
Script Overview:
This script automates the process of copying asset files from a SharePoint directory
to a local destination directory. It searches for specific asset folders within
project directories, categorizes them based on the presence of .fbx files (3D or 2D assets),
and copies them while maintaining the directory structure.

Key Features:
- Processes all project folders or specific ones if defined.
- Checks for required folders and categorizes assets accordingly.
- Logs operations with both console output and log files.
- Skips specified folders to ignore.
"""

import shutil
import os
import logging
from colorama import Fore, Style

# Constants for paths and configurations
DESTINATION_PATH = "A:\\VARLab Assets"  # Destination path for assets
ROOT_SOURCE_PATH = "Q:\\VARLabs Sharepoint\\Conestoga College\\CC_VARLab - Documents"  # SharePoint root path

# Define specific project folders to process, leave empty to process all
# PROJECT_FOLDERS = {"LSM8.03 - Ambulance and Paramedicine", "Project 2", "Project 3"}
PROJECT_FOLDERS = {}  # Empty set means process all project folders

# Folder names to check for determining if an asset folder is valid
REQUIRED_FOLDERS = {"Engine Import Files", "Engine Imports", "Source Files", "Mesh Exports", "Texture Files", "Animation Updates"}
IGNORE_FOLDERS = {"Asset Files - [Template - Insert Label]", "Old Files"}  # Folders to ignore

LOG_FILE_BASE_NAME = "onedrive-extractor"  # Base name for log files
LOG_MODE = logging.INFO  # Logging level (DEBUG or INFO)


# Custom formatter for console with selective coloring
class ColoredFormatter(logging.Formatter):
    """
    Custom logging formatter to add color to console logs based on log level.
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
    Sets up the logging configuration with file and console handlers,
    including a separate logger for successful asset copies.
    """
    log_file_name = f".{LOG_FILE_BASE_NAME}.log"
    log_file_path = os.path.join(DESTINATION_PATH, log_file_name)

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

    # Logger for successful asset copies
    success_log_file_name = f".{LOG_FILE_BASE_NAME}-asset-ledger.log"
    success_log_file_path = os.path.join(DESTINATION_PATH, success_log_file_name)

    success_file_handler = logging.FileHandler(success_log_file_path, mode='a')
    success_file_handler.setLevel(LOG_MODE)
    success_file_formatter = logging.Formatter('%(message)s')
    success_file_handler.setFormatter(success_file_formatter)
    
    success_logger = logging.getLogger('successful_assets_logger')
    if success_logger.hasHandlers():
        success_logger.handlers.clear()
    success_logger.setLevel(LOG_MODE)
    success_logger.addHandler(success_file_handler)
    success_logger.propagate = False
    
 # Logger for errored asset uploads
    error_log_file_name = f".{LOG_FILE_BASE_NAME}-asset-ledger-error.log"
    error_log_file_path = os.path.join(DESTINATION_PATH, error_log_file_name)

    error_file_handler = logging.FileHandler(error_log_file_path, mode='a')
    error_file_handler.setLevel(LOG_MODE)
    error_file_formatter = logging.Formatter('%(message)s')
    error_file_handler.setFormatter(error_file_formatter)

    error_logger = logging.getLogger('errored_assets_logger')
    if error_logger.hasHandlers():
        error_logger.handlers.clear()
    error_logger.setLevel(LOG_MODE)
    error_logger.addHandler(error_file_handler)
    error_logger.propagate = False


def get_project_folders(root_source_path, project_folders=None):
    """
    Retrieves the set of project folders to process. If project_folders is empty,
    it lists all directories in the root_source_path.

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


def check_fbx_exists(directory):
    """
    Checks if any .fbx files exist within the given directory.

    Args:
        directory (str): The directory to search.

    Returns:
        bool: True if a .fbx file is found, False otherwise.
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


def copy_directory(src_path, dest_path, project_name):
    """
    Copies the contents of src_path to dest_path, preserving the directory structure.

    Args:
        src_path (str): The source directory to copy.
        dest_path (str): The destination directory.
        project_name (str): The name of the project (for logging purposes).

    Returns:
        bool: True if the copy was successful, False otherwise.
    """
    base_name = os.path.basename(src_path)
    destination_dir = os.path.join(dest_path, base_name)

    try:
        logging.debug(f"Copying to {dest_path}...")
        for root, _, files in os.walk(src_path):
            rel_path = os.path.relpath(root, src_path)
            dest_root = os.path.join(destination_dir, rel_path)

            os.makedirs(dest_root, exist_ok=True)

            for file_name in files:
                src_file = os.path.join(root, file_name)
                dest_file = os.path.join(dest_root, file_name)

                shutil.copy2(src_file, dest_file)
                logging.debug(f"Copied '{src_file}' to '{dest_file}'")
        logging.info(f"Successfully copied '{project_name}' / '{base_name}' assets to '{destination_dir}'")
        success_logger = logging.getLogger('successful_assets_logger')
        success_logger.info(f"{project_name}/{base_name} --\t--\t{src_path}")
        return True
    except Exception as e:
        logging.error(f"Error copying directory: {e}")
        return False


def check_required_folders(src_path, required_folders):
    """
    Checks if the source path contains at least two of the required folders.

    Args:
        src_path (str): The directory to check.
        required_folders (set): A set of required folder names.

    Returns:
        bool: True if at least two required folders are present, False otherwise.
    """
    if not os.path.exists(src_path):
        logging.error(f"Source path '{src_path}' does not exist.")
        return False
    
    if not os.path.isdir(src_path):
        logging.error(f"Source path '{src_path}' is not a directory.")
        return False

    folders_in_src = {
        folder for folder in os.listdir(src_path)
        if os.path.isdir(os.path.join(src_path, folder))
    }

    if required_folders:
        matching_folders = required_folders.intersection(folders_in_src)
        if len(matching_folders) >= 2:
            logging.info(f"Source path '{src_path}' contains required folders: {matching_folders}")
            return True
        else:
            logging.debug(f"Source path '{src_path}' lacks required folders. Found: {matching_folders}")
            return False
    else:
        logging.info(f"No required folders specified, proceeding with all folders in '{src_path}'")
        return True


def contains_files(dir_path):
    """
    Checks if a directory contains any files, directly or in any subdirectory.

    Args:
        dir_path (str): The directory to check for files.

    Returns:
        bool: True if the directory or any subdirectory contains files, False otherwise.
    """
    if os.path.exists(dir_path) and os.path.isdir(dir_path):
        for root, dirs, files in os.walk(dir_path):
            if files:  # If any file is found, return True
                return True
        return False  # No files found in the directory or its subdirectories
    else:
        raise Exception(f"Path '{dir_path}' does not exist or is not a directory.")
    

def remove_if_empty(dest_path):
    """
    Removes the destination directory if it contains no files (only folders).
    Recursively deletes the entire directory if it has no files, regardless of subfolders.

    Args:
        dest_path (str): The directory to check and remove if empty.
    """
    try:
        if os.path.exists(dest_path) and os.path.isdir(dest_path):
            # Check if the directory contains any actual files
            has_files = False
            for root, dirs, files in os.walk(dest_path):
                if files:  # If any file is found, mark the folder as having files
                    has_files = True
                    break

            # If no files are found, forcefully remove the entire directory
            if not has_files:
                shutil.rmtree(dest_path)  # Remove the directory and all subdirectories
                logging.info(f"Forcefully removed empty directory: {dest_path}")
            else:
                logging.info(f"Directory '{dest_path}' contains files, skipping deletion.")
        else:
            logging.debug(f"Path '{dest_path}' does not exist or is not a directory.")
    except Exception as e:
        logging.error(f"Error while removing directory '{dest_path}': {e}")


def find_and_copy(src_path, dest_path, project_name):
    """
    Searches for asset directories within src_path and copies them to dest_path.

    Args:
        src_path (str): The source directory to search.
        dest_path (str): The destination directory.
        project_name (str): The name of the project (for logging purposes).

    Returns:
        bool: True if assets were found and copied, False otherwise.
    """
    try:
        for current_dir, dirs, _ in os.walk(src_path):
            for dir_name in dirs:
                dir_path = os.path.join(current_dir, dir_name)
                logging.info(f"Checking directory: {dir_path}")

                if dir_name in IGNORE_FOLDERS:
                    logging.info(f"Skipping '{dir_path}' as it is in the ignore list.")
                elif not contains_files(dir_path):
                    logging.info(f"Skipping '{dir_path}' as it contains no files.")
                elif dir_path.count("Asset Files -") == 1 and dir_name.startswith("Asset Files -"):
                    logging.info(f"Found asset folder '{dir_path}'")
                    # Determine asset type based on presence of .fbx files
                    if check_fbx_exists(dir_path):
                        asset_type = "3D Assets"
                        logging.info(f"Copying 3D asset to '{dest_path}'...")
                        final_dest_path = os.path.join(dest_path, asset_type)
                        copy_directory(dir_path, final_dest_path, project_name)
                    else:
                        asset_type = "2D Assets"
                        logging.info(f"Skipping 2D asset folder '{dir_path}'")
                        error_logger = logging.getLogger('errored_assets_logger')
                        error_logger.info(f"{project_name}/{dir_name} --\t--\t{current_dir}")
                    # elif asset_type == "2D Assets": #not in current scope
                    #     logging.info(f"Copying 2D asset to '{dest_path}'...")
                    #     final_dest_path = os.path.join(dest_path, asset_type)
                    #     logging.info(f"Copying to {final_dest_path}...")
                    #     copy_directory(dir_path, final_dest_path, project_name)
                elif dir_path.count("Asset Files -") == 0 and check_required_folders(dir_path, REQUIRED_FOLDERS):
                    asset_type = "3D Assets" if check_fbx_exists(dir_path) else "2D Assets"
                    final_dest_path = os.path.join(dest_path, asset_type)
                    logging.info(f"Copying to {final_dest_path}...")
                    copy_directory(dir_path, final_dest_path, project_name)
                # elif check_required_folders(dir_path, REQUIRED_FOLDERS):
                #     final_dest_path = os.path.join(dest_path, "Other Assets")
                #     logging.info(f"Found asset with required folders in '{dir_path}'. Copying to 'Other Assets'...")
                #     copy_directory(dir_path, final_dest_path, project_name)
                else:
                    logging.debug(f"Skipping '{dir_path}' due to missing required folders.")
            remove_if_empty(os.path.join(dest_path, os.path.basename(current_dir)))
        remove_if_empty(dest_path)
        return True
    except Exception as e:
        logging.error(f"Error while searching for directories: {e}")
        remove_if_empty(dest_path)
        return False


def ensure_destination_path_exists(destination_path, project_folder_name):
    """
    Ensures that the destination directory exists; creates it if it doesn't.

    Args:
        destination_path (str): The base destination path.
        project_folder_name (str): The project folder name to append.

    Returns:
        str: The full destination path.
    """
    full_path = os.path.join(destination_path, project_folder_name)
    if not os.path.exists(full_path):
        os.makedirs(full_path)
        logging.info(f"Created directory: {full_path}")
    else:
        logging.info(f"Directory already exists: {full_path}")
    return full_path


def set_project_folder(base_root, specific_folder):
    """
    Constructs the full path to a specific project folder.

    Args:
        base_root (str): The base root path.
        specific_folder (str): The specific project folder name.

    Returns:
        str: The full path to the project folder.
    """
    new_root = os.path.join(base_root, specific_folder)
    logging.info(f"Set new root folder: {new_root}")
    return new_root


if __name__ == "__main__":
    # Ensure the base destination path exists
    ensure_destination_path_exists(DESTINATION_PATH, "")
    # Set up logging configurations
    setup_logger()
    try:
        # Retrieve project folders to process
        project_folders = get_project_folders(ROOT_SOURCE_PATH, PROJECT_FOLDERS)
        for projectFolderName in project_folders:
            # Ensure the project destination folder exists
            folder_path = ensure_destination_path_exists(DESTINATION_PATH, projectFolderName)
            logging.debug(f"Processing project folder: {folder_path}")
            # Construct source path for the project
            source_path = set_project_folder(ROOT_SOURCE_PATH, projectFolderName)
            # Start finding and copying assets
            find_and_copy(source_path, folder_path, projectFolderName)
    except Exception as e:
        logging.error(f"Error during processing: {e}")
    finally:
        logging.info("Process completed.")
