import logger from "../utils/logger.js";

/**
 * Middleware to log for all request.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export function logRequest(req, res, next) {
  logger.info(`Request received: ${req.method} ${req.originalUrl}`);
  next();
}
