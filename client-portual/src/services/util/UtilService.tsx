/**
 * Helper function to get CSS color from class name
 * Get the color of an element by its class name.
 * @param className The class name of the element.
 */
const getColorFromHTMLElement = (className: string) => {
  const element = document.querySelector(`.${className}`);
  return element ? getComputedStyle(element).color : null;
};

/**
 * This function returns the size of the bytes.
 * @param bytes Number of bytes to be calculated.
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

/**
 * This function capitalize the first letter of the word.
 * @param text String to be changed.
 */
const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Checks the format of the file name.
 * @param filename Name to be validated.
 */
function isFilenameValid(filename: string): boolean {
  const regex = /^[\w,\s\-()]+\.[A-Za-z]{3}$/;
  return regex.test(filename);
}

/**
 * Validates the provided files based on their extension, number, and size.
 * @param {File | File[]} files The file(s) to validate. Can be a single file or an array of files.
 * @param {string[]} allowedExtensions A list of allowed file extensions (e.g., ['jpg', 'png', 'pdf']).
 * @param {number} maxFiles The maximum number of files that can be uploaded.
 * @param {number} [maxSizeMB] The maximum file size in megabytes. This parameter is optional. If provided, files larger than this size will be considered invalid.
 * @returns {{ isValid: boolean, message?: string }} An object indicating whether the files are valid. If invalid, the message property contains a descriptive error message.
 */
const validateFile = (
  files: File | File[],
  allowedExtensions: string[],
  maxFiles: number,
  maxSizeMB?: number // Optional parameter for maximum size
) => {
  const maxSizeBytes = maxSizeMB ? maxSizeMB * 1024 * 1024 : undefined;

  // If a single file is passed, turn it into an array
  const fileArray = Array.isArray(files) ? files : [files];

  // Check number of files
  if (fileArray.length > maxFiles) {
    return {
      isValid: false,
      message: `You can upload a maximum of ${maxFiles} files.`
    };
  }

  // Validate each file in the array
  for (const file of fileArray) {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    // Check file extension
    if (!allowedExtensions.includes(fileExtension ?? "")) {
      return {
        isValid: false,
        message: `Invalid file extension (.${fileExtension})`
      };
    }

    // If maxSizeMB is provided, check file size
    if (maxSizeBytes && file.size > maxSizeBytes) {
      return { isValid: false, message: "File size exceeds the limit." };
    }
  }

  return { isValid: true };
};

const UtilService = {
  capitalizeFirstLetter,
  formatBytes,
  getColorFromHTMLElement,
  isFilenameValid,
  validateFile
};

export default UtilService;
