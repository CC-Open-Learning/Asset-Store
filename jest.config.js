export default {
  projects: [
    "<rootDir>/server/jest.config.js",
  ],
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    "**/src/**/*.{ts,tsx,js,jsx}", // Include all .ts, .tsx, .js, and .jsx files in any 'src' directory
    "!**/node_modules/**", // Exclude 'node_modules' directories
    "!**/coverage/**", // Exclude 'coverage' directories
    "!**/logs/**", // Exclude 'logs' directories
    "!**/public/**", // Exclude 'public' directories
    "!**/*.config.{ts,tsx,js,jsx}", // Exclude configuration files
  ],
};
