import { Router } from "express";
const router = Router();
import { statusCodes } from "../../config.js";
import logger from "../utils/logger.js";

router.post("/", (req, res) => {
  const { componentStack, error, stack } = req.body;
  logger.error(`[Frontend Error]\n${error}${stack}${componentStack}`);
  res.sendStatus(statusCodes.OK);
});

export default router;
