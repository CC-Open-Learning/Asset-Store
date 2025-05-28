import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import { userModel } from "../models/userModel.js";

dotenv.config();

// Constants
const { PUBLIC_KEY } = process.env;
const { ACCESS_SECRET } = process.env;
const { GOOGLE_CLIENT_ID } = process.env;
const { GOOGLE_CLIENT_SECRET } = process.env;
const { SERVER_URL } = process.env;

// JWT Strategy for access token
const accessJwtOptions = {
  algorithms: ["HS256"],
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_SECRET
};

const accessJwtStrategy = new JwtStrategy(accessJwtOptions, (payload, done) => {
  userModel
    .findOne({ _id: payload.sub })
    .then(user => {
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
    .catch(err => done(err, null));
});

// JWT Strategy for refresh token
const refreshJwtOptions = {
  algorithms: ["RS256"],
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true,
  secretOrKey: PUBLIC_KEY
};

const refreshJwtStrategy = new JwtStrategy(
  refreshJwtOptions,
  (req, payload, done) => {
    userModel
      .findOne({ _id: payload.sub })
      .then(user => {
        if (user) {
          // verify if the refresh token matches
          const { refreshToken } = req.cookies;
          if (user.refreshToken === refreshToken) {
            return done(null, user);
          }
          return done(null, false, { message: "Invalid refresh token" });
        }
        return done(null, false);
      })
      .catch(err => done(err, null));
  }
);

// Google OAuth Strategy Configuration and Verification
const googleStrategy = new GoogleStrategy(
  {
    callbackURL: `${SERVER_URL}/api/oauth/google/callback`, // URL to which Google will redirect after authentication
    clientID: GOOGLE_CLIENT_ID, // Google Client ID obtained from Google Developer Console
    clientSecret: GOOGLE_CLIENT_SECRET, // Google Client Secret obtained from Google Developer Console
    passReqToCallback: true // Allows passing of the request object to the callback function
  },
  /**
   * Verification callback function executed after Google authenticates the user.
   * @param {object} req - The incoming request object.
   * @param {string} accessToken - The access token provided by Google.
   * @param {string} refreshToken - The refresh token provided by Google.
   * @param {object} profile - The user's profile information returned by Google.
   * @param {Function} done - Callback function to signal completion.
   */
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Attempt to find an existing user with the provided Google ID
      let user = await userModel.findOne({ googleId: profile.id });
      const [firstEmail] = profile.emails;
      if (user) {
        // If user exists, check if their profile picture has been updated
        if (user.picture !== profile._json.picture) {
          user.picture = profile._json.picture; // Update the user's profile picture
          await user.save(); // Save the updated user information to the database
        }

        // If the user's email is not already set, update it with the email from Google
        if (!user.email) {
          user.email = firstEmail.value; // Set the user's email
          await user.save(); // Save the updated user information to the database
        }

        return done(null, user); // Authentication successful, proceed with the user
      }

      // If user does not exist, create a new user with information from Google
      user = new userModel({
        email: firstEmail.value, // Store the user's email from Google
        googleId: profile.id, // Store the user's Google ID
        picture: profile._json.picture, // Store the user's profile picture URL from Google
        username: profile.displayName // Store the user's display name from Google
      });

      await user.save(); // Save the new user to the database
      return done(null, user); // Authentication successful, proceed with the new user
    } catch (err) {
      return done(err, null); // Handle any errors that occur during the authentication process
    }
  }
);

/**
 * Export module Passport configuration.
 * @param passport Passport instance.
 */
const passportConfig = passport => {
  passport.use("accessJwt", accessJwtStrategy);
  passport.use("refreshJwt", refreshJwtStrategy);
  passport.use(googleStrategy);
};
export default passportConfig;
