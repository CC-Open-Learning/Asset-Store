import express from "express";
const router = express.Router();
import { jwtConfig, statusCodes } from "../../config.js";
import {
  checkAuthentication,
  checkIsAdmin
} from "../middlewares/authMiddleware.js";
import { userModel } from "../models/userModel.js";
import { issueJWT, validPassword } from "../utils/functions.js";
import logger from "../utils/logger.js";

// -------------------------POST-------------------------

// Login
router.post("/login", function handleLogin(req, res, next) {
  // Error message for incorrect username or password
  const responseMessage = "Invalid Credentials";
  userModel
    .findOne({ username: req.body.username })
    .then(async user => {
      if (!user) {
        // Log username not found
        logger.info(`User ${req.body.username} not found`);
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json({ message: responseMessage, success: false });
      }

      // Function defined at bottom of app.js
      const isValid = validPassword(req.body.password, user.hash, user.salt);

      if (isValid) {
        // create jwt tokens
        const refreshTokenObject = issueJWT(user, "refresh");
        const accessTokenObject = issueJWT(user, "access");

        // update user.refreshtoken to new refreshtoken
        user.refreshToken = refreshTokenObject.token;

        // save the updated user
        await user.save();

        // set tokens in cookies
        res.cookie("refreshToken", refreshTokenObject.token, {
          httpOnly: true,
          maxAge: jwtConfig.REFRESH_TOKEN_MAX_AGE, // 30 days
          sameSite: "Strict",
          secure: true
        });

        res.cookie("accessToken", accessTokenObject.token, {
          httpOnly: true,
          maxAge: jwtConfig.ACCESS_TOKEN_MAX_AGE, // 10 min
          sameSite: "Strict",
          secure: true
        });

        // print jwt
        logger.info(
          `User ${user.username}, Refresh token: ${refreshTokenObject.token}, Access token: ${accessTokenObject.token}`
        );

        // send success response
        return res
          .status(statusCodes.OK)
          .json({ message: "Login successful", success: true });
      }
      // log the username and password entered
      logger.info(`User ${req.body.username} entered the wrong password`);
      return res.status(statusCodes.UNAUTHORIZED).json({
        message: responseMessage,
        success: false
      });
    })
    .catch(err => {
      next(err);
    });
});

// Logout
router.post("/logout", checkAuthentication, (req, res) => {
  // log user logged out
  logger.info(`User ${req.user.username} logged out`);
  // delete refresh token
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.status(statusCodes.OK).json({ message: "Logout success", success: true });
});

// -------------------------GET-------------------------

// authenticate
router.get("/authenticate", checkAuthentication, (req, res) => {
  res
    .status(statusCodes.OK)
    .json({ message: "You are authenticated", success: true });
});

// Get user profile
router.get("/profile", checkAuthentication, (req, res) => {
  const { user } = req;
  logger.info(`User profile requested: ${user.username}`);
  return res.status(statusCodes.OK).json({
    _id: user._id || "user id",
    email: user.email || "email",
    googleId: user.googleId || "user googleId",
    picture: user.picture,
    role: user.role || "user role",
    username: user.username || "user name"
  });
});

// Get all users names and roles
router.get(
  "/allUserRoles",
  checkAuthentication,
  checkIsAdmin,
  async (req, res) => {
    try {
      const users = await userModel.find({}, "_id username role email");
      logger.info(`Found ${users.length} users`);
      return res.status(statusCodes.OK).json(users);
    } catch (err) {
      logger.error(`Error fetching users: ${err.message}`);
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching users",
        success: false
      });
    }
  }
);

// -------------------------PUT-------------------------

// Toggle user role passed as a query parameter
router.put(
  "/toggleUserRole",
  checkAuthentication,
  checkIsAdmin,
  async (req, res, next) => {
    try {
      // If user is not admin, return unauthorized
      if (req.user.username !== "admin") {
        return res.status(statusCodes.FORBIDDEN).json({
          message: "You are not authorized to perform this action",
          success: false
        });
      }

      // Get username from request body
      const { username } = req.body;

      // Validate input
      if (!username) {
        return res.status(statusCodes.BAD_REQUEST).json({
          message: "Username is required",
          success: false
        });
      }

      // Find user by username
      const user = await userModel.findOne({ username });

      // If user not found, return not found
      if (!user) {
        logger.warn(`User not found: ${username}`);
        return res.status(statusCodes.NOT_FOUND).json({
          message: "User not found",
          success: false
        });
      }

      // Prevent admin from changing their own role
      if (user.username === "admin") {
        return res.status(statusCodes.FORBIDDEN).json({
          message: "Admins cannot change their own role",
          success: false
        });
      }

      // Toggle user role
      user.role = user.role === "user" ? "admin" : "user";
      await user.save();

      // Log the change
      logger.info(`User role changed: ${username} is now ${user.role}`);

      // Return success response
      return res.status(statusCodes.OK).json({
        message: "User role updated",
        success: true,
        user
      });
    } catch (err) {
      logger.error(`Error changing user role: ${err.message}`);
      return next(err);
    }
  }
);

router.delete(
  "/",
  checkAuthentication,
  checkIsAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.query;

      // Validate input
      if (!id) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json({ message: "User ID is required", success: false });
      }

      // Find user by username
      const user = await userModel.findOne({ _id: id });

      // If user not found, return not found
      if (!user) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json({ message: "User not found", success: false });
      }

      // Prevent deleting default admin
      if (user.username === "admin") {
        return res.status(statusCodes.FORBIDDEN).json({
          message: "Admin account cannot be deleted",
          success: false
        });
      }

      // Delete user
      await userModel.deleteOne({ _id: id });

      // Log the change
      logger.info(`User deleted: ${user.username}`);

      // Return success response
      return res
        .status(statusCodes.OK)
        .json({ message: "User deleted", success: true });
    } catch (err) {
      logger.error(`Error deleting user: ${err.message}`);
      return next(err);
    }
  }
);

export default router;
