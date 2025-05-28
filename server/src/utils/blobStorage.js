import dotenv from "dotenv";
dotenv.config();
import {
  ContainerSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential
} from "@azure/storage-blob";
import sanitize from "sanitize-filename";

import { MILLISECONDS_IN_MINUTE, NO_FILE } from "../../config.js";
import { assetModel } from "../models/assetModel.js";
import { categoryModel } from "../models/categoryModel.js";
import { projectModel } from "../models/projectModel.js";
import { tagModel } from "../models/tagModel.js";
import logger from "../utils/logger.js";

// Constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

/**
 * Function to upload one or multiple files to Azure Blob Storage with customizable access tier and sanitization.
 * @param containerClient - The destination container client.
 * @param files - The files to upload to the container.
 * @param options - Optional parameters.
 */
export async function uploadToBlobStorage(
  containerClient,
  files,
  options = {}
) {
  const { tier = "Hot" } = options; // Default to sanitizing and 'Hot' tier

  const filesArray = Array.isArray(files) ? files : [files]; // Check if files is an array

  const [firstFileBuffer] = filesArray;
  // Check if file is empty or fileBuffer is missing
  if (filesArray.length === NO_FILE || !firstFileBuffer.fileBuffer) {
    throw new Error("File data is required for upload.");
  }

  const uploadResults = [];

  try {
    for (const file of filesArray) {
      const { fileBuffer, originalName } = file;
      const blobName =
        options.sanitize === false ? originalName : sanitize(originalName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(fileBuffer, { tier });

      // Push the full URL of the uploaded file to uploadResults
      uploadResults.push(blockBlobClient.url);
      logger.info(`File uploaded to Blob Storage: ${blockBlobClient.url}`);
    }
    return uploadResults; // Return an array of blob URLs
  } catch (error) {
    logger.error("Error uploading files to Blob Storage:", error);
    throw error;
  }
}

/**
 *  Function:     createContainerSasToken()
 *  Description:  Generate a SAS token for a container
 *  Parameters:   containerName
 *  Returns:      string: SAS token.
 * @param containerName - The name of the container to generate a SAS token for.
 * @param minutes - The number of minutes the SAS token will be valid for.
 */
export async function createContainerSasToken(containerName, minutes) {
  // SAS token options
  const expirationTime = minutes * MILLISECONDS_IN_MINUTE; // 1 minute in milliseconds
  const TOKEN_DURATION = 5;
  const sasOptions = {
    expiresOn: new Date(Date.now() + expirationTime), // Expiry time
    permissions: ContainerSASPermissions.parse("r"), // r = Read-only permissions
    protocol: "https", // Enforce HTTPS
    startsOn: new Date(Date.now() - TOKEN_DURATION * MILLISECONDS_IN_MINUTE) // Start time (5 minutes ago)
  };

  try {
    // Generate the SAS token
    const sasToken = await generateBlobSASQueryParameters(
      {
        containerName,
        expiresOn: sasOptions.expiresOn,
        permissions: sasOptions.permissions
      },
      sharedKeyCredential
    ).toString();

    // Log the SAS token
    logger.info(
      `Generated SAS token ${sasToken} for container: ${containerName}`
    );

    // Return the SAS token
    return sasToken;
  } catch (error) {
    logger.error(`Failed to generate SAS token for ${containerName}:`, error);
    throw error; // Rethrow error for the caller to handle
  }
}

/**
 *  Function:     createMongoAsset()
 *  Description:  Create an asset in MongoDB.
 *  Returns:      true if the asset was created successfully in MongoDB, false otherwise.
 *  @param mainFile - The main file object.
 *  @param reqBody - The request body object.
 *  @param previewImagesUrl - The preview images URLs.
 */
export async function createMongoAsset(mainFile, reqBody, previewImagesUrl) {
  try {
    // Metadata

    // Destructure mainFile
    const {
      mimetype: format = "undefined",
      originalname: fileName = null,
      size: fileSize = NO_FILE
    } = mainFile;

    // Destructure req.body
    const {
      categories = null,
      description = null, // sets the default value to null if the field is not present in the req.body
      license = null, // to be removed in the future
      model = null,
      name = null,
      origin = null, // to be removed in the future
      price = null, // to be removed in the future
      production = null,
      projects = null,
      tags = null,
      texture = null
    } = reqBody;

    // Parse JSON fields only if they exist
    const parsedModel = model ? JSON.parse(model) : null; // if model exists, parse it, otherwise set it to null
    const parsedTexture = texture ? JSON.parse(texture) : null;
    const parsedProduction = production ? JSON.parse(production) : null;
    let parsedProjects = projects ? JSON.parse(projects) : null;
    let parsedTags = tags ? JSON.parse(tags) : null;
    let parsedCategories = categories ? JSON.parse(categories) : null;

    // projects names to IDs
    if (parsedProjects) {
      parsedProjects = await Promise.all(
        parsedProjects.map(async projectName => {
          const project = await projectModel.findOne({ name: projectName });
          return project ? project._id : null; // Return ObjectId if found, otherwise null
        })
      );
      parsedProjects = parsedProjects.filter(id => id !== null); // remove null values from the array
    }
    // categories names to IDs
    if (parsedCategories) {
      parsedCategories = await Promise.all(
        parsedCategories.map(async categoryName => {
          const category = await categoryModel.findOne({ name: categoryName });
          return category ? category._id : null; // Return ObjectId if found, otherwise null
        })
      );

      parsedCategories = parsedCategories.filter(id => id !== null); // remove null values from the array
    }

    // tags names to IDs
    if (parsedTags) {
      parsedTags = await Promise.all(
        parsedTags.map(async tagName => {
          let tag = await tagModel.findOne({ name: tagName });
          if (!tag) {
            // Create a new tag if not found
            tag = await tagModel.create({ name: tagName });
          }
          return tag._id; // Return the ObjectId
        })
      );
    }

    // Store metadata in MongoDB
    const asset = new assetModel({
      ...(fileName !== null && { fileName }), // if fileName exists, add it to the object, otherwise ignore it
      ...(name !== null && { name }),
      ...(fileSize !== null && { fileSize }),
      ...(description !== null && { description }),
      ...(format !== null && { format }),
      ...(previewImagesUrl !== null && { previews: previewImagesUrl }),
      ...(projects !== null && { projects: parsedProjects }),
      ...(tags !== null && { tags: parsedTags }),
      ...(categories !== null && { categories: parsedCategories }),
      ...(price !== null && { price }),
      ...(license !== null && { license }),
      ...(origin !== null && { origin }),
      ...(model !== null && { model: parsedModel }),
      ...(texture !== null && { texture: parsedTexture }),
      ...(production !== null && { production: parsedProduction })
    });
    await asset.save();
    // Log the upload
    logger.info(`Asset uploaded to MongoDB: '${fileName}'`);
    return true;
  } catch (error) {
    logger.error("Uploading asset to MongoDb error: ", error);
    return false;
  }
}
