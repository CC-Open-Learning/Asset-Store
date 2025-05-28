import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, beforeEach, afterEach } from "vitest";

// Extend jest-dom matchers
expect.extend(matchers);

// Provide mock for matchMedia
global.window.matchMedia =
  global.window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {}
    };
  };

// Capture unhandled errors per test
let unhandledError: unknown = null;

// Run before the each test start
// Initialize unhandledError flag to 'null' in each test start
// not to interrupt the test process
beforeEach(() => {
  unhandledError = null;

  // To catch the unhanded error in situation 
  // when a promise fails and error handling is not done with .catch()
  // Remove current unhandledRejection error handler
  // Keep the error message at 'unhandledError'
  process.removeAllListeners("unhandledRejection");
  process.on("unhandledRejection", (reason) => {
    unhandledError = reason;
  });

  // To catch the unhanded error in situation 
  // when a common throw error occurs without try-catch
  // The same logic as before
  process.removeAllListeners("uncaughtException");
  process.on("uncaughtException", (err) => {
    unhandledError = err;
  });
});

// Run after the each test
// Throw the unhandled error if 'unhandledError' isn't empty
afterEach(() => {
  if (unhandledError !== null) {
    throw unhandledError;
  }
});