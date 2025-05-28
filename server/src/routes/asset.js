import { Router } from "express";
const router = Router();
import { BlobClient, BlobServiceClient } from "@azure/storage-blob";
import { join } from "path";

import { statusCodes } from "../../config.js";
import {
  checkAuthentication,
  checkIsAdmin
} from "../middlewares/authMiddleware.js";
import multerUploader from "../middlewares/multerMiddleware.js";
import { assetModel } from "../models/assetModel.js";
import {
  createContainerSasToken,
  createMongoAsset,
  uploadToBlobStorage
} from "../utils/blobStorage.js";
import { deleteAsset } from "../utils/delete.js";
import logger from "../utils/logger.js";

// Constants
const ASSET_CONTAINER_NAME = "assets";
const PREVIEW_IMAGES_CONTAINER_NAME = "preview-images";
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const assetPath = process.env.ASSET_STORAGE_ROOT;

// Containers clients
const mainContainerClient =
  blobServiceClient.getContainerClient(ASSET_CONTAINER_NAME);
const previewContainerClient = blobServiceClient.getContainerClient(
  PREVIEW_IMAGES_CONTAINER_NAME
);

// -------------------------GET-------------------------

const PROJECT_TOKEN_DURATION = 5;
//Gets the sas token for asset preview images
router.get("/asset-sas-token", checkAuthentication, async (req, res) => {
  try {
    const sasToken = await createContainerSasToken(
      "preview-images",
      PROJECT_TOKEN_DURATION
    );
    logger.info(`Sas token generated: ${sasToken} container: project-images`);
    return res.json({ message: sasToken });
  } catch (error) {
    logger.error(`Error generating sas projects token: ${error.message}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error generating sas projects token: ${error.message}`,
      success: false
    });
  }
});

// -------------------------POST-------------------------

// /upload-Asset
router.post(
  "/",
  checkAuthentication,
  multerUploader,
  checkIsAdmin,
  async (req, res) => {
    const { mainFile, previewImages } = req.files; // Destructure main and preview images

    // eslint-disable-next-line prefer-const
    let previewImagesUrl = [];

    try {
      const [mainFileObj] = mainFile;
      // Upload the main file
      await uploadToBlobStorage(
        mainContainerClient,
        {
          fileBuffer: mainFileObj.buffer,
          originalName: mainFileObj.originalname
        },
        {
          sanitize: false, // Sanitize if necessary
          tier: "Cool" // Access tier
        }
      );

      // Log successful upload of main file
      logger.info(
        `'${req.user.username}' uploaded a Main file: ${mainFileObj.originalname}`
      );

      const NO_PREVIEW_IMAGES = 0;

      // Upload preview images, if any
      if (previewImages && previewImages.length > NO_PREVIEW_IMAGES) {
        const previewFilesToUpload = previewImages.map(preview => ({
          fileBuffer: preview.buffer,
          originalName: `${mainFileObj.originalname}/${preview.originalname}`
        }));

        const previewUploadResults = await uploadToBlobStorage(
          previewContainerClient,
          previewFilesToUpload,
          {
            sanitize: false,
            tier: "Hot"
          }
        );

        previewImagesUrl.push(...previewUploadResults);

        previewImages.forEach(preview => {
          logger.info(
            `'${req.user.username}' uploaded a Preview Image: ${preview.originalname}`
          );
        });
      }

      // Create asset in MongoDB
      const mongoUploadedSuccessfully = await createMongoAsset(
        mainFileObj,
        req.body,
        previewImagesUrl
      );

      if (mongoUploadedSuccessfully) {
        res
          .status(statusCodes.OK)
          .json({ message: "Files uploaded successfully", success: true });
      } else {
        throw new Error("Error uploading asset to MongoDB");
      }
    } catch (err) {
      logger.error("Error uploading files: ", err.message);
      res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Blob Storage upload asset error: ${err.message}`,
        success: false
      });
    }
  }
);

//------------------------------------------------------------------------------
// File download endpoint, finds the file by ID in the get request, sends the full url to download from the blob
router.get("/download", checkAuthentication, async (req, res) => {
  try {
    const { id } = req.query;
    const asset = await assetModel.findById(id);
    const minuteDuration = 2; // Change duration according
    if (asset !== null) {
      // Generate SAS token for the asset file
      const sasToken = await createContainerSasToken("assets", minuteDuration);

      // Construct the full URL
      const fileUrl = `${process.env.BLOBSTORAGE_URI}assets/${asset.fileName}?${sasToken}`;

      // Create a BlobClient using the full blob URL with SAS token
      const blobClient = new BlobClient(fileUrl);

      // Check if the blob exists
      if (await blobClient.exists()) {
        //Log user who requested the download
        logger.info(
          `User ${req.user.username} requested download for "${asset.fileName}"`
        );

        // Send the full URL as the response
        return res.status(statusCodes.OK).send({ url: fileUrl });
      }
    }
    return res
      .status(statusCodes.NOT_FOUND)
      .send({ message: "Asset not found", success: false });
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message, success: false });
  }
});

//------------------------------------------------------------------------------
router.delete("/", checkAuthentication, checkIsAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      await deleteAsset(id);
    } else {
      return res
        .status(statusCodes.NOT_FOUND)
        .json({ message: "Id not found", success: false });
    }

    return res
      .status(statusCodes.OK)
      .json({ message: "Asset Deleted.", success: true });

    //delete MongoDB metadata
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message, success: false });
  }
});

//------------------------------------------------------------------------------
// End point to send a GLB to the client for display
router.get("/glb", checkAuthentication, checkIsAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    const asset = await assetModel.findById(id);
    if (asset !== null) {
      // Use the filename to find the file at a set location (stored in .env)
      const filePath = join(`${assetPath}/Assets/`, asset.production.glb);
      // log user who downloaded the file and the file name
      logger.info(
        `User ${req.user.username} downloaded file "${asset.production.glb}"`
      );
      return res.sendFile(filePath);
    }
    return res
      .status(statusCodes.NOT_FOUND)
      .send({ message: "Asset not found", success: false });
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message, success: false });
  }
});

//------------------------------------------------------------------------------
export default router;
