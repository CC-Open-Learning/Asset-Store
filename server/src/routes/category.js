import { Router } from "express";
const router = Router();
import dotenv from "dotenv";
dotenv.config();
import { statusCodes } from "../../config.js";
import { checkAuthentication } from "../middlewares/authMiddleware.js";
import { createContainerSasToken } from "../utils/blobStorage.js";
import logger from "../utils/logger.js";

// Azure Blob Storage setup
const containerName = "category-images";
const CATEGORY_TOKEN_DURATION = 5;

// -------------------------SAS TOKEN-------------------------

//Gets the sas token for categories
router.get("/category-sas-token", checkAuthentication, async (req, res) => {
  try {
    const sasToken = await createContainerSasToken(
      containerName,
      CATEGORY_TOKEN_DURATION
    );
    logger.info(`Sas token generated: ${sasToken} container: ${containerName}`);
    return res.json({ message: sasToken });
  } catch (error) {
    logger.error(`Error generating sas category token: ${error.message}`);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).send({
      message: `Error generating sas category token: ${error.message}`,
      success: false
    });
  }
});

export default router;
