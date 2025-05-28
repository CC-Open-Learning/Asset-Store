/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    reporters: ["html", "verbose", "junit", "json"],
    outputFile: {
      html: "./coverage/vitest/html-report.html",
      json: "./coverage/client-portual/test-results.json"
    },
    coverage: {
      enabled: true,
      all: true,
      include: ["src/**/*.ts", "src/**/*.tsx"], // All source files
      exclude: [
        "**/node_modules/**",
        "**/tests/**",
        "**/*.test.*",
        "**/__mocks__/**",
        "**/coverage/**",
        "**/dist/**",
        "**/logs/**",
        "**/*.config.*",
        "**/*.json",
        "**/*.setup.*",
        "**/*.d.ts",
        "**/*.css",
        "**/*.scss"
      ], // Exclude files
      reporter: ["text-summary", "lcov", "json-summary"], // Generate LCOV and summary reports
      reportsDirectory: "./coverage/client-portual",
      clean: true, // Clean previous coverage
      skipFull: false, // Include files with full coverage
      reportOnFailure: true // Ensure reports are created on failure
    }
  }
});
