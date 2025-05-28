import { Router } from "express";
const router = Router();
import { statusCodes } from "../../config.js";
import { checkAuthentication } from "../middlewares/authMiddleware.js";
import { categoryModel } from "../models/categoryModel.js";
import { projectModel } from "../models/projectModel.js";
import { tagModel } from "../models/tagModel.js";
import logger from "../utils/logger.js";
import { sanitizeString } from "../utils/sanitize.js";
import {
  assetSearch,
  getAssets,
  getCategories,
  getNamesOfPartialMatchingDocuments,
  keywordSearch
} from "../utils/search.js";
import { queryTerms } from "../utils/validate.js";

//----------------------------------------------
// Keyword search endpoint that returns relevant assets based on the provide keywords
// ex. api/search?<keyword>
router.get("/", checkAuthentication, async (req, res) => {
  try {
    const NO_KEYWORDS = 0;
    const EXACTLY_ONE_KEYWORD = 1;
    // Extract query parameters
    //Parse string for HTML injection elements
    const query = sanitizeString(req.query.keywords);
    const { select } = req.query;
    const keywords = query
      .toLowerCase()
      .split(",") //If multiple keywords are present, they are split by "," delimiter
      .filter(keyword => keyword !== "");

    let result;
    //Case: If keyword is model, texture, production file send back all of each
    if (
      keywords.length === EXACTLY_ONE_KEYWORD &&
      (keywords.includes("texture") ||
        keywords.includes("model") ||
        keywords.includes("video") ||
        keywords.includes("audio") ||
        keywords.includes("sprite") ||
        keywords.includes("image") ||
        keywords.includes("hdri"))
    ) {
      const keywordId = await getCategories(keywords, "_id");
      result = await getAssets(
        {
          $or: [
            {
              categories: {
                $in: keywordId.map(category => category._id)
              }
            }
          ]
        },
        select
      );
      logger.info(`Found ${result.length} assets via ${keywords}`);
    } else if (keywords.length > NO_KEYWORDS) {
      //Case: keyword, that does not match an existing category directly
      //Keyword search only uses the name property of each schema
      result = await keywordSearch(keywords, select);
      logger.info(
        `Found ${result.length} assets via ${keywords} and ${select}`
      );
    } else {
      //Case: No keyword, send back all available assets in the database
      result = await getAssets({});
      logger.info(`Found ${result.length} assets`);
    }
    return res.status(statusCodes.OK).json(result);
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message });
  }
});

// Asset search endpoint that uses a structured asset to search the database
// ex. api/search/asset?<asset>
router.get("/asset", checkAuthentication, async (req, res) => {
  try {
    //query containing a whitelisted asset search
    const { query } = req;
    // Builds query and finds asset
    // this is a more specific search by any property (on the whitelist)
    // in the asset schema
    const result = await assetSearch(query);
    logger.info(`Found ${result.length} assets via ${query}`);
    return res.status(statusCodes.OK).json(result);
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message });
  }
});

/**-------------------------------------------------------------------
 * Find and return all asset, tag, project, or category names that could
 * autocomplete the user's input (removing duplicates)
 */
router.get("/terms", checkAuthentication, async (req, res) => {
  try {
    const { input } = req.query;

    const matches = await getNamesOfPartialMatchingDocuments(input);
    logger.info(`Found ${matches.length} terms via ${input}`);

    return res.status(statusCodes.OK).json(matches);
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message });
  }
});

router.get("/projects", checkAuthentication, async (req, res) => {
  try {
    const { query } = req;

    if (queryTerms(query)) {
      const result = await projectModel.find(query);
      logger.info(`Found ${result.length} projects via ${query}`);
      return res.status(statusCodes.OK).json(result);
    }
    logger.info(`No projects found for query: ${query}`);
    return res.status(statusCodes.OK).json([]);
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message });
  }
});

router.get("/categories", checkAuthentication, async (req, res) => {
  try {
    const { query } = req;

    if (queryTerms(query)) {
      const result = await categoryModel.find(query);
      logger.info(`Found ${result.length} categories via ${query}`);
      return res.status(statusCodes.OK).json(result);
    }
    logger.info(`No categories found for query: ${query}`);
    return res.status(statusCodes.OK).json([]);
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message });
  }
});

router.get("/tags", checkAuthentication, async (req, res) => {
  try {
    const { query } = req;

    if (queryTerms(query)) {
      const result = await tagModel.find(query);
      logger.info(`Found ${result.length} tags via ${query}`);
      return res.status(statusCodes.OK).json(result);
    }
    logger.info(`No tags found for query: ${query}`);
    return res.status(statusCodes.OK).json([]);
  } catch (e) {
    logger.error(e.message);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: e.message });
  }
});

export default router;
