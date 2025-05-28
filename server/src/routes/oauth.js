import express from "express";
const router = express.Router();
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import passport from "passport";

import { jwtConfig, statusCodes } from "../../config.js";
import { allowListModel } from "../models/allowListModel.js";
import { userModel } from "../models/userModel.js";
import { issueJWT } from "../utils/functions.js";
import logger from "../utils/logger.js";
dotenv.config();

// Constants
const isProduction = process.env.NODE_ENV === "production";
const redirectUrl = isProduction
  ? process.env.SERVER_URL
  : process.env.CLIENT_URL;

// GOOGLE
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

/**
 * Google callback handler, handles the callback from Google after user authentication.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const googleCallbackHandler = async (req, res) => {
  try {
    // Check if user is allowed to access the application
    const allowedUser = await allowListModel.findOne({ email: req.user.email });

    if (!allowedUser) {
      logger.warn(`Unauthorized user attempt: ${req.user.email}`);
      return res.redirect(`${redirectUrl}/unauthorized`);
    }

    // generate jwt tokens
    const refreshTokenObject = issueJWT(req.user, "refresh");
    const accessTokenObject = issueJWT(req.user, "access");

    // Update user's refresh token in the database
    await userModel.findByIdAndUpdate(req.user.id, {
      refreshToken: refreshTokenObject.token
    });

    // Set the access token, refresh token in cookies
    res.cookie("refreshToken", refreshTokenObject.token, {
      httpOnly: true,
      maxAge: jwtConfig.REFRESH_TOKEN_MAX_AGE, // 30 days
      sameSite: "Strict",
      secure: true
    });
    res.cookie("accessToken", accessTokenObject.token, {
      httpOnly: true,
      maxAge: jwtConfig.ACCESS_TOKEN_MAX_AGE, // 10 minutes
      sameSite: "Strict",
      secure: true
    });

    logger.info(
      `User ${req.user.username}, Refresh token: ${refreshTokenObject.token}, Access token: ${accessTokenObject.token}`
    );

    // Redirect to the frontend with the access token
    return res.redirect(redirectUrl);
  } catch (err) {
    logger.error(err);
    return res.redirect(`${redirectUrl}/error`);
  }
};

// google oauth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false
  }),
  googleCallbackHandler
);

// refresh token validation
router.post("/refreshtoken", (req, res, next) => {
  const [, refreshToken] = req.cookies.refreshToken.split(" ");
  if (!refreshToken) {
    return res
      .status(statusCodes.UNAUTHORIZED)
      .json({ message: "No token provided", success: false });
  }

  return jsonwebtoken.verify(
    refreshToken,
    process.env.PUBLIC_KEY,
    (err, decoded) => {
      if (err) {
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json({ message: "Failed to authenticate token", success: false });
      }

      // Attach decoded token to req.user
      req.user = decoded;

      // authenticate user
      req.headers.authorization = `Bearer ${refreshToken}`;
      return passport.authenticate(
        "refreshJwt",
        { session: false },
        (err, user) => {
          if (err) {
            return next(err);
          }

          if (!user) {
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            return res
              .status(statusCodes.UNAUTHORIZED)
              .json({ message: "Unauthorized", success: false });
          }

          // if user is authenticated, issue a new access token
          const accessToken = issueJWT(req.user, "access");
          res.cookie("accessToken", accessToken.token, {
            httpOnly: true,
            maxAge: jwtConfig.ACCESS_TOKEN_MAX_AGE, // 10 minutes
            sameSite: "Strict",
            secure: true
          });
          return res
            .status(statusCodes.OK)
            .json({ message: "Successful issue access token", success: true });
        }
      )(req, res, next);
    }
  );
});

// MICROSOFT
//TODO

export default router;
