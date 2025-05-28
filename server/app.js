import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
mongoose.set("strictQuery", false);
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import passport from "passport";

import passportConfig from "./src/configs/passport.js";
import { logRequest } from "./src/middlewares/logMiddleware.js";
import router from "./src/routes/index.js";
import logger from "./src/utils/logger.js";
dotenv.config();

// ------ Create the Express application -----
const app = express();

// ------ Logging middlewares -----
app.use(logRequest);
app.use(morgan("combined", { stream: logger.stream })); // for HTTP log

// ------ Enable CORS ------
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", process.env.SERVER_URL]
  })
);

// ------ Cookie Parser ------
app.use(cookieParser());

// configure database ------
import "./src/configs/database.js";

// ------ Load models ------
import "./src/models/userModel.js";

// ------ Require Passport config module and initialize it ------
passportConfig(passport);
app.use(passport.initialize());

// ------ json parsers ------
app.use(json());
app.use(urlencoded({ extended: true }));

// ------ Load routes and add '/api' to all routes ------
app.use("/api", router);

// ------ start server ------
const FALLBACK_PORT = 3000;
const PORT = process.env.PORT || FALLBACK_PORT;
app.listen(PORT, () => {
  logger.info(`Server is listening on port ${PORT}`);
});
