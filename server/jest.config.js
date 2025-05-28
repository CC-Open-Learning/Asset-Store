export default {
  collectCoverageFrom: [
    "<rootDir>/**/src/**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/logs/**",
    "!**/*.config.{js,cjs}"
  ],
  coverageDirectory: "<rootDir>/coverage/server",
  coverageReporters: ["json", "lcov", "text-summary", "json-summary"],
  testResultsProcessor: "<rootDir>/jest.setup-test-result-processor.js",
  testEnvironment: "node", // Set to Node environment for server-side testing
  testMatch: ["**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest" // Use babel-jest to handle ESM syntax in JavaScript files
  }
};
