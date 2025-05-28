import fs from "fs";
import path from "path";

import { statusCodes } from "../../config.js";
//This file does validation
import logger from "./logger.js";
const queriesPath = path.resolve("./valid-queries.json");
//Load config with a fallback if the file doesn’t exist
const config = (() => {
  try {
    return JSON.parse(fs.readFileSync(queriesPath, "utf-8"));
  } catch (err) {
    logger.error("Could not load valid-queries.json:", err);
    return { VALID_QUERIES: [] };
  }
})();
const NO_ERROR_MESSAGES = 0;

/**
 * ----------------------------------------------------------------------------
 * Loops through each object and checks if they key is on the whitelist
 * This function is mean't to only do checks on search/asset? Endpoint objects
 * Only works if the terms have been flattened.
 * @param terms The terms to check.
 * @param validQueries The valid queries to check against.
 */
export function queryTerms(terms, validQueries = config.VALID_QUERIES) {
  let retValue = true;

  Object.keys(terms).forEach(key => {
    // Go through the key of each object and check if the term is
    // on the white list, with an exception for searches containing $or which is part of
    // Keyword search which cannot be validated in same way
    if (!validQueries.includes(key) && key !== "$or") {
      retValue = false;
      logger.error(`Invalid search term: ${key}`);
    }
  });
  return retValue;
}

/**
 * ----------------------------------------------------------------------------
 * Checks if the content-type of the HTTP header is "multipart/form-data".
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 */
export const isContentTypeValid = (req, res, next) => {
  if (!req.is("multipart/form-data")) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .json({ msg: "Bad content type", success: false });
  }
  // Passes values to the next middleware function in the application’s request-response cycle
  return next();
};

/**
 * ----------------------------------------------------------------------------
 * Tests the extension of the filename, returns false if not included in one of the regex.
 * @param filename The filename to test.
 */
export function isExtensionValid(filename) {
  const allowedModelExtensions = /\.(?:fbx|glb|dae|obj|zip)$/i;
  const allowedTextureExtensions = /\.(?:jpe?g|png|tiff|tga|webp|)$/i;
  const allowedProductionExtensions = /\.(?:blend|ma|mb|psd|sp|)$/i;

  return (
    allowedModelExtensions.test(filename) ||
    allowedTextureExtensions.test(filename) ||
    allowedProductionExtensions.test(filename)
  );
}

/**
 * ---------------------------------------------------------------------------
 * Returns true if the filename is valid, and false otherwise.
 * @param filename The filename to test.
 */
export function isFilenameValid(filename) {
  // Allow alphanumeric characters, spaces, hyphens, underscores, and dots
  // Must end with a file extension of 3-4 characters
  const regex = /^[\w\s-]+\.[A-Za-z]{3,4}$/;
  return regex.test(filename);
}

/**
 * ---------------------------------------------------------------------------
 * Checks if the mime-type of a submitted image is valid.
 * @param mimeType The mime-type to test.
 */
export function isImageMimeValid(mimeType) {
  const validMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  for (const type of validMimeTypes) {
    if (mimeType === type) {
      return true;
    }
  }
  return false;
}

/**
 * ---------------------------------------------------------------------------
 * Checks if names and extensions are allowed, and checks mime-type if image is submitted.
 * @param fileOriginalName The original name of the uploaded file.
 * @param fileMimetype The mime-type of the uploaded file.
 */
export const checkForFileErrors = (fileOriginalName, fileMimetype) => {
  const errorMsgs = [];

  if (fileOriginalName) {
    if (!isFilenameValid(fileOriginalName)) {
      errorMsgs.push("filename");
    }
    if (!isExtensionValid(fileOriginalName)) {
      errorMsgs.push("extension");
    }
  }

  if (fileMimetype) {
    if (!isImageMimeValid(fileMimetype)) {
      errorMsgs.push("mime type");
    }
  }

  return errorMsgs;
};

/**
 * ---------------------------------------------------------------------------
 * Validates the file submitted to the server is valid based on the functions called
 * in checkForFileErrors().
 * @param req The request object.
 * @param file The file to validate.
 * @param cb The callback function.
 */
export const isFileValid = (req, file, cb) => {
  const errorMsgs = checkForFileErrors(file.originalname);

  if (errorMsgs.length === NO_ERROR_MESSAGES) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid main file (not accepted: ${errorMsgs.join(", ")}).`),
      false
    );
  }
};

/**
 * ---------------------------------------------------------------------------
 * Validates the file submitted to the server is valid based on the functions called
 * in checkForFileErrors().
 * @param req The request object.
 * @param file The file to validate.
 * @param cb The callback function.
 */
export const isImageValid = (req, file, cb) => {
  const errorMsgs = checkForFileErrors(file.originalname, file.mimetype);

  if (errorMsgs.length === NO_ERROR_MESSAGES) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid image file added (not accepted: ${errorMsgs.join(", ")}).`
      ),
      false
    );
  }
};

//----------------------------------------------------------------------------
