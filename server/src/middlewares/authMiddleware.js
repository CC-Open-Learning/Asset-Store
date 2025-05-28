import jsonwebtoken from "jsonwebtoken";

import { statusCodes } from "../../config.js";
import {
  authenticateWithPassport,
  checkRefreshToken
} from "../utils/functions.js";
import logger from "../utils/logger.js";

/**
 *  Function:     checkAuthentication()
 *  Description:  Check if the access token is valid. If so, user is authenticated
 *  Returns:      next().
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export async function checkAuthentication(req, res, next) {
  const { cookies } = req;

  const COOKIE_INDEX = 1;

  // Extract token from cookies
  const accessToken = cookies.accessToken
    ? cookies.accessToken.split(" ")[COOKIE_INDEX]
    : null;
  const refreshToken = cookies.refreshToken
    ? cookies.refreshToken.split(" ")[COOKIE_INDEX]
    : null;

  // ------------ No tokens ------------
  if (!cookies.accessToken && !cookies.refreshToken) {
    return res.json({ error: `No access token or refresh token found` });
  }

  // ------------ Access token ------------
  try {
    if (accessToken) {
      // Verify the access token
      return jsonwebtoken.verify(
        accessToken,
        process.env.ACCESS_SECRET,
        async err => {
          if (err) {
            // If access token is invalid, check the refresh token
            if (refreshToken) {
              await checkRefreshToken(refreshToken, req, res);
              return authenticateWithPassport(req, res, next);
            }
            // If no refresh token, clear it and send a response
            res.clearCookie("accessToken");
            logger.info(`invalid access token: ${accessToken}`);
            return res.json({ error: `invalid access token: ${accessToken}` });
          }
          // Access token is valid
          req.headers.authorization = `Bearer ${accessToken}`;
          return authenticateWithPassport(req, res, next);
        }
      );
    }
    // ------------ Refresh token only ------------
    await checkRefreshToken(refreshToken, req, res);
    return authenticateWithPassport(req, res, next);
  } catch (err) {
    logger.error(`${err}`);
    return res.json({ error: `${err}` });
  }
}

/**
 *  Function:     checkIsAdmin()
 *  Description:  Check if the user is an admin
 *  Returns:      next() or 403 Forbidden.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export function checkIsAdmin(req, res, next) {
  if (req.user.role === "admin") {
    return next();
  }
  logger.info(`Unauthorized access to ${req.url} by ${req.user.username}`);
  return res
    .status(statusCodes.FORBIDDEN)
    .json({ msg: `Admin privilege required`, success: false });
}
