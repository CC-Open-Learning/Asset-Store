import { Router } from "express";
const router = Router();
import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import multer, { memoryStorage } from "multer";
dotenv.config();
import { join } from "path";

import { multerConfig, statusCodes } from "../../config.js";
import {
  checkAuthentication,
  checkIsAdmin
} from "../middlewares/authMiddleware.js";
import { projectModel } from "../models/projectModel.js";
import {
  createContainerSasToken,
  uploadToBlobStorage
} from "../utils/blobStorage.js";
import { deleteProject } from "../utils/delete.js";
import logger from "../utils/logger.js";
import { sanitizeObject, sanitizeString } from "../utils/sanitize.js";
import { findProjectByName } from "../utils/search.js";
import { isContentTypeValid, isImageValid } from "../utils/validate.js";

const projectImagesStoragePath = `${process.env.ASSET_STORAGE_ROOT}/Project-Images`;

// Azure Blob Storage setup
const containerName = "project-images";
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
const projectContainerClient =
  blobServiceClient.getContainerClient(containerName);

// -------------------------GET-------------------------

const PROJECT_TOKEN_DURATION = 5;
//Gets the sas token for projects
router.get("/projects-sas-token", checkAuthentication, async (req, res) => {
  try {
    const sasToken = await createContainerSasToken(
      "project-images",
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

//==================================================================================
//                          GET PROJECT DISPLAY IMAGE PATH
//==================================================================================
router.get("/image", (req, res) => {
  try {
    const { imageName } = req.query;
    const filePath = join(`${projectImagesStoragePath}/`, imageName);

    return res.sendFile(filePath);
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message, success: false });
  }
});

//==================================================================================
//                              ADD/UPLOAD NEW PROJECT
//==================================================================================

// Multer setup to handle in-memory file storage
const uploadFile = multer({
  fileFilter: isImageValid,
  limits: { fileSize: multerConfig.maxFileSize }, // 10MB
  storage: memoryStorage()
});

// Middleware to handle single image upload
const uploadProjectImage = uploadFile.single("imageFile");

// API post call: create new project (must be admin to do so)
router.post(
  "/",
  checkAuthentication,
  checkIsAdmin,
  isContentTypeValid,
  async function handleAddProject(req, res) {
    try {
      // Middleware for handling a single image upload ("imageFile").
      // Uses Multer with in-memory storage, applying file size limits and image validation.
      // The file is accessible via `req.file.buffer` for further processing (e.g., uploading to Azure).
      return await uploadProjectImage(
        req,
        res,
        async function handleUpload(err) {
          // Handle any Multer errors
          if (err) {
            logger.error(`Multer error: ${err.message}`);
            return res.status(statusCodes.BAD_REQUEST).json({
              message: err.message,
              success: false
            });
          }
          // Parse form data
          const { project } = req.body;

          const projectFormInput = JSON.parse(project);

          // Check if the project already exists
          const projectNameExists = await findProjectByName(
            projectFormInput.name
          );
          if (projectNameExists !== null) {
            return res.status(statusCodes.CONFLICT).json({
              message: "The project submitted already exists.",
              success: false
            });
          }

          if (!req.file) {
            return res
              .status(statusCodes.BAD_REQUEST)
              .json({ message: "Project image is required", success: false });
          }

          const sanitizedName = sanitizeString(projectFormInput.name);
          const projectName = `${sanitizedName}.webp`;

          // Upload project image to Azure Blob Storage
          const uploadResult = await uploadToBlobStorage(
            projectContainerClient,
            {
              fileBuffer: req.file.buffer,
              originalName: projectName
            },
            {
              sanitize: true, // Sanitize the name if necessary
              tier: "Hot" // Access tier for project images
            }
          );

          const [imageUrl] = uploadResult; // Get the full URL of the uploaded image

          if (!uploadResult || !imageUrl) {
            throw new Error("Failed to upload project image to Blob Storage.");
          }

          // Log upload info
          logger.info(
            `Admin "${req.user.username}" uploaded project image: ${req.file.originalname}`
          );

          // Create new project object for database
          const newProject = new projectModel({
            description: projectFormInput.description,
            image: imageUrl,
            name: sanitizedName // Use the full URL of the uploaded image
          });

          // Save project to database
          await newProject.save();

          // Retrieve and return updated project list
          const allProjects = await projectModel.find();
          return res.status(statusCodes.OK).json({
            message: "Project added successfully.",
            success: true,
            updatedProjectList: allProjects
          });
        }
      );
    } catch (error) {
      logger.error("Error posting new project:", error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error.", success: false });
    }
  }
);

router.delete("/", checkAuthentication, checkIsAdmin, async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      // Check if the project exists
      if (projectModel.findById(id) === null) {
        throw new Error("Project not found");
      }

      // Delete the project
      await deleteProject(id);

      return res
        .status(statusCodes.OK)
        .json({ message: "Project Deleted Successfully.", success: true });
    }
    throw new Error("Id not found");
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message, success: false });
  }
});

export default router;
