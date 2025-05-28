import { Router } from "express";

import { checkAuthentication } from "../middlewares/authMiddleware.js";
import { tagModel } from "../models/tagModel.js";
import logger from "../utils/logger.js";
import { sanitizeString } from "../utils/sanitize.js";

const router = Router();
router.get("/", checkAuthentication, async (req, res) => {
  const query = sanitizeString(req.query.keywords);
  const keywords = query
    .toLowerCase()
    .split(",") //If multiple keywords are present, they are split by "," delimiter
    .filter(keyword => keyword !== "");

  let result = [];
  try {
    const tagPromises = keywords.map(tagName => {
      logger.info(`Searching for tags: ${tagName}`);
      return tagModel
        .find({
          name: { $options: "i", $regex: `^${tagName}` }
        })
        .select("name");
    });
    const tagsArray = await Promise.all(tagPromises);
    result = tagsArray.flat();
    logger.info(`Found tags: ${result}`);
  } catch (err) {
    logger.error("some message here", err.message);
  }
  return res.json(result);
});

export default router;
