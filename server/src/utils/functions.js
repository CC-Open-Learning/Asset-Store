import { pbkdf2Sync, randomBytes } from "crypto";
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
dotenv.config();
import passport from "passport";

import {
  jwtConfig,
  MILLISECONDS_IN_SECOND,
  passwordConfig,
  statusCodes
} from "../../config.js";
import { userModel } from "../models/userModel.js";

// Constants
const { PRIVATE_KEY } = process.env;
const { ACCESS_SECRET } = process.env;

/**
 *  Function:     genPassword()
 *  Description:  generate a 32 bit random hex string (salt), takes the salt and the password to generate a hash value
 *  Parameters:   password
 *  Returns:      object: salt and hash value.
 * @param password - The password to hash.
 */
export function genPassword(password) {
  const salt = randomBytes(passwordConfig.saltLength).toString("hex");
  const genHash = pbkdf2Sync(
    password,
    salt,
    passwordConfig.iterations,
    passwordConfig.hashLength,
    "sha512"
  ).toString("hex");

  return {
    hash: genHash,
    salt
  };
}

/**
 *  Function:     validPassword()
 *  Description:  Uses the password inserted by the user and the salt stored in the database to create a new hash. Then compare the new hash with the one stored in the database to see if the password is correct
 *  Parameters:   password, hash, salt
 *  Returns:      boolean: true if password is valid, false if invalid.
 * @param password - The password to validate.
 * @param hash - The hash to compare against.
 * @param salt - The salt to use for the hash.
 */
export function validPassword(password, hash, salt) {
  const hashVerify = pbkdf2Sync(
    password,
    salt,
    passwordConfig.iterations,
    passwordConfig.hashLength,
    "sha512"
  ).toString("hex");
  return hash === hashVerify;
}

/**
 *  Function:     issueJWT()
 *  Description:  Creates a new token for the user
 *  Parameters:   user
 *  Returns:      object: token and expiration time.
 * @param user - The user to issue a token for.
 * @param type - The type of token to issue.
 */
export function issueJWT(user, type) {
  const _id = user._id || user.sub;
  let key = "";
  let expiresIn = "";
  let algorithm = "";

  // set different key and expire time for refresh / access token
  if (type === "refresh") {
    key = PRIVATE_KEY;
    expiresIn = "30d";
    algorithm = "RS256";
  } else if (type === "access") {
    key = ACCESS_SECRET;
    expiresIn = "10m";
    algorithm = "HS256";
  }

  const payload = {
    iat: Math.floor(Date.now() / MILLISECONDS_IN_SECOND), // convert to seconds
    sub: _id
  };

  const signedToken = jsonwebtoken.sign(payload, key, {
    algorithm,
    expiresIn
  });

  return {
    expires: expiresIn,
    token: `Bearer ${signedToken}`
  };
}

/**
 * Function:     checkRefreshToken()
 * Description:  Check if the refresh token is valid and issue a new access token
 * Parameters:   req, res, next
 * Returns:      next() or 403 Forbidden.
 * @param refreshToken - The refresh token to check.
 * @param req - The request object.
 * @param res - The response object.
 */
export async function checkRefreshToken(refreshToken, req, res) {
  try {
    const decoded = jsonwebtoken.verify(refreshToken, process.env.PUBLIC_KEY);
    const userId = decoded.sub;

    const user = await userModel.findOne({ _id: userId });

    // Check errors
    if (!user) {
      throw new Error("refresh token contains an invalid user ID");
    }

    if (user.refreshToken !== `Bearer ${refreshToken}`) {
      throw new Error(
        "Refresh token is valid but doesn't match the one in the database"
      );
    }

    // Issue a new access token
    req.user = user;
    const accessTokenObject = issueJWT(user, "access");
    res.cookie("accessToken", accessTokenObject.token, {
      httpOnly: true,
      maxAge: jwtConfig.ACCESS_TOKEN_MAX_AGE, // 10 minutes
      sameSite: "Strict",
      secure: true
    });

    req.headers.authorization = `${accessTokenObject.token}`;
  } catch (err) {
    // clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    throw err;
  }
}

/**
 * Function:     authenticateWithPassport()
 * Description:  Authenticate the user with Passport
 * Parameters:   req, res, next
 * Returns:      next().
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export function authenticateWithPassport(req, res, next) {
  passport.authenticate("accessJwt", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(statusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  })(req, res, next);
}
