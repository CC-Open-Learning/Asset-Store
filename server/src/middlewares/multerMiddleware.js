import multer, { memoryStorage, MulterError } from "multer";

import { statusCodes } from "../../config.js";
import { assetModel } from "../models/assetModel.js";
import logger from "../utils/logger.js";

// Storage
const upload = multer({ storage: memoryStorage() });

/**
 * Middleware to handle file upload.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const multerUploader = (req, res, next) => {
  upload.fields([
    { maxCount: 1, name: "mainFile" }, // max asset files
    { maxCount: 30, name: "previewImages" } // max preview images
  ])(req, res, async function handleMulterUpload(err) {
    // Check misspellings
    if (err instanceof MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        logger.error(`Unexpected field: ${err.field}`);
        return res
          .status(statusCodes.BAD_REQUEST)
          .json({ message: `Unexpected field: ${err.field}`, success: false });
      }
      // other errors (e.g., file size limits)
      logger.error(`Multer error: ${err.message}`);
      return res
        .status(statusCodes.BAD_REQUEST)
        .json({ message: err.message, success: false });
    } else if (err) {
      // any other errors
      logger.error("Error during file upload:", err);
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        message: `An error occurred during file upload on multer middleware: ${err.message}`,
        success: false
      });
    }

    // Check if 'mainFile' is present
    if (!req.files || !req.files.mainFile) {
      logger.error(`Upload failed: Main file is required`);
      return res
        .status(statusCodes.BAD_REQUEST)
        .json({ message: "Main file is required", success: false });
    }

    // Check database for existing asset
    const { mainFile } = req.files;
    const [mainFileObj] = mainFile;
    const fileName = mainFileObj.originalname;
    const asset = await assetModel.findOne({ fileName });

    if (asset) {
      logger.error(`Asset already exists: '${asset.fileName}'`);
      return res.status(statusCodes.BAD_REQUEST).json({
        message: `Asset already exists: '${asset.fileName}'`,
        success: false
      });
    }

    // If no errors, continue
    return next();
  });
};

export default multerUploader;
