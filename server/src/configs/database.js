import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
import logger from "../utils/logger.js";
mongoose.set("strictQuery", false);
// Get the connection string for the database
const devConnection = process.env.DB_STRING;
const prodConnection = process.env.DB_STRING_PROD;

// Connect to the correct environment database
if (process.env.NODE_ENV === "production") {
  mongoose.connect(prodConnection);

  mongoose.connection.on("connected", () => {
    logger.info("Database connected");
  });
} else {
  mongoose.connect(devConnection);

  mongoose.connection.on("connected", () => {
    logger.info("Database connected");
  });
}
