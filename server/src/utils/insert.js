import { tagModel } from "../models/tagModel.js";
import logger from "../utils/logger.js";

/**
 * Creates a new tag in the database.
 * @param tag The name of the tag to create.
 */
export const insertTag = async tag => {
  try {
    return await tagModel.create({ name: tag });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
