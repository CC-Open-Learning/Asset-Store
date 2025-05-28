import { BlobServiceClient } from "@azure/storage-blob";

import { assetModel } from "../models/assetModel.js";
import { projectModel } from "../models/projectModel.js";
import { tagModel } from "../models/tagModel.js";
import logger from "../utils/logger.js";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const assetContainerName = "assets";
const previewContainerName = "preview-images";
const projectContainerName = "project-images";

// Initialize Blob Service Client using the connection string
const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

/**
 * Helper function to delete a blob from a specified container.
 * @param containerName - The name of the container to delete from.
 * @param blobName - The name of the blob to delete.
 */
async function deleteAssetBlob(containerName, blobName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  try {
    await blobClient.deleteIfExists({ deleteSnapshots: "include" });
  } catch (error) {
    logger.error(`Error deleting blob ${blobName}: ${error.message}`);
  }
}

/**
 *------------------------------------------------------------------------------
 * Delete tags not associated with assets.
 * @param tags - The tags to delete.
 */
const deleteTags = async tags => {
  if (Array.isArray(tags)) {
    for (const tag of tags) {
      const assets = await assetModel.findById(tag._id);
      if (!assets) {
        await tagModel.deleteOne(tag._id);
        logger.info(`Tag deleted: ${tag._id}`);
      }
    }
  }
};

/**
 * ------------------------------------------------------------------------------
 * Delete preview image files from Preview-Images folder in storage.
 * @param containerName - The name of the container to delete from.
 * @param previewImages - The preview images to delete.
 */
const deletePreviewImages = async (containerName, previewImages) => {
  try {
    // Ensure previewImages is an array
    const imagesToDelete = Array.isArray(previewImages)
      ? previewImages
      : [previewImages];

    const deletePromises = imagesToDelete.map(async previewUrl => {
      // Extract the blob name from the URL
      const blobName = previewUrl.split("/").pop();
      // Decode the blob name to handle any encoded spaces
      const decodedBlobName = decodeURIComponent(blobName);

      // Create a BlockBlobClient and delete the blob
      const containerClient =
        blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(decodedBlobName);

      await blobClient.delete(); // Delete the blob

      logger.info(
        `Deleted blob: ${decodedBlobName} from container: ${containerName}`
      );
      return true; // Indicate successful deletion
    });

    // Wait for all delete operations to complete
    const results = await Promise.all(deletePromises);
    return results; // Return results of delete operations (true/false)
  } catch (error) {
    logger.error("Error deleting preview images:", error);
    return false; // Indicate failure if an error occurs
  }
};

/**
 * ------------------------------------------------------------------------------
 * Delete a project from the database and blob storage.
 * @param id - The ID of the project to delete.
 */
const deleteProject = async id => {
  const project = await projectModel.findById(id);

  if (project) {
    const { _id: projectId, image: projectImage } = project;

    // delete from blob storage
    try {
      await deletePreviewImages(projectContainerName, [projectImage]);

      // Proceed to delete database records only if all blob deletions succeed
      await projectModel.deleteOne({ _id: projectId });
      logger.info(`Project deleted: ${projectId}`);
    } catch (error) {
      logger.error(`Error during project deletion: ${error.message}`);
    }
  }
};

/**
 * Delete an asset from the database and blob storage.
 * @param id - The ID of the asset to delete.
 */
const deleteAsset = async id => {
  const asset = await assetModel.findById(id);

  if (asset) {
    const {
      _id: assetId,
      fileName: assetFileName,
      previews: previewImages,
      production,
      tags
    } = asset;

    try {
      // Attempt to delete blobs first
      if (production && production.glb) {
        await deleteAssetBlob(assetContainerName, production.glb);
      }
      await deleteAssetBlob(assetContainerName, assetFileName);
      await deletePreviewImages(previewContainerName, previewImages);

      // Proceed to delete database records only if all blob deletions succeed
      await assetModel.deleteOne({ _id: assetId });
      logger.info(`Asset deleted: ${assetId}`);
      await deleteTags(tags);
    } catch (error) {
      logger.error(`Error during asset deletion: ${error.message}`);
    }
  }
};

// Export functions
export {
  deleteAsset,
  deleteAssetBlob,
  deletePreviewImages,
  deleteProject,
  deleteTags
};
