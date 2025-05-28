import fs from "fs";
import path from "path";

/**
 * Processes test results and writes them to a JSON file.
 * @param testResults The test results to process.
 */
export default function processor(testResults) {
  const outputFile = path.join(
    process.cwd(),
    "coverage/server/test-results.json"
  );

  // Ensure directory exists
  const dir = path.dirname(outputFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write test results to file
  fs.writeFileSync(outputFile, JSON.stringify(testResults, null, 2));

  return testResults;
}
