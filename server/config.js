/* eslint-disable no-magic-numbers */
export const statusCodes = {
  BAD_REQUEST: 400,
  CONFLICT: 409,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  OK: 200,
  UNAUTHORIZED: 401
};

export const passwordConfig = {
  hashLength: 64,
  iterations: 10000,
  saltLength: 32
};

export const MINUTES = 10;
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const MILLISECONDS_IN_SECOND = 1000;
export const MILLISECONDS_IN_MINUTE = 60 * 1000;
export const DAYS = 30;
export const HOURS = 24;

export const jwtConfig = {
  ACCESS_SECRET: process.env.ACCESS_SECRET,
  ACCESS_TOKEN_MAX_AGE: MINUTES * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND, // 10 minutes
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  PUBLIC_KEY: process.env.PUBLIC_KEY,
  REFRESH_TOKEN_MAX_AGE:
    DAYS * HOURS * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND // 30 days
};

export const NO_FILE = 0;
export const KB_MULTIPLIER = 1024; // 1KB = 1024 bytes
export const MEGABYTE_MULTIPLIER = KB_MULTIPLIER * KB_MULTIPLIER; // 1MB = 1024 * 1024 bytes

export const multerConfig = {
  maxFileSize: 10 * MEGABYTE_MULTIPLIER // 10MB
};
