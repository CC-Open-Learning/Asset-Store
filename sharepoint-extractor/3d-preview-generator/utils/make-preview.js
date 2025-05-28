import puppeteer from "puppeteer";
import { promises as fs } from "fs";

/**
 Main function to launch Puppeteer, load a page, capture a screenshot, log the result as JSON, and optionally save the screenshot as both a PNG file and a JSON file.
 */
(async () => {
  let browser;
  const saveToFile = false; // Set this to true if you want to save the screenshot to a file, false to skip
  const fileName = "screenshot"; // Name of the PNG file to save
  const format = "webp"; // Format of the screenshot (png, jpeg, webp)

  try {
    browser = await puppeteer.launch({
      args: [
        "--disable-web-security",
        "--allow-file-access-from-files",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const page = await browser.newPage();

    /**
     * Capture console logs and errors from the browser context.
     * Log error messages separately from regular logs.
     */
    page.on("console", (msg) => {
      const message = msg.text();
      if (msg.type() === "error") {
        console.error(`PAGE ERROR: ${message}`);
      } else {
        console.log(`PAGE LOG: ${message}`);
      }
    });

    /**
     * Capture page errors and log them.
     */
    page.on("pageerror", (err) => {
      console.error(`PAGE ERROR: ${err.toString()}`);
    });

    try {
      // Set viewport size and device scale factor
      await page.setViewport({
        width: 1920, // Set the desired width of the screenshot
        height: 1080, // Set the desired height of the screenshot
        deviceScaleFactor: 2, // Increase this to 2 or more for higher DPI (2 for Retina-like quality)
      });

      // Load the HTML content from a local server
      await page.goto(`http://localhost:4000`, {
        waitUntil: "networkidle2",
      });

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Optional delay to wait for data loading
    } catch (err) {
      console.error(`Failed to load the page: ${err.message}`);
    }
    try {
      // Take the screenshot
      const screenshotBuffer = await page.screenshot({
        encoding: "base64", // Encode the screenshot as base64
        type: format, // Use PNG for lossless quality
      });
      // Output the screenshot as a JSON object, using JSON.stringify to avoid [object Object]
      const output = {
        status: "success",
        screenshotBase64: screenshotBuffer.toString(),
      };
      console.log(JSON.stringify(output, null, 2)); // Pretty-print the JSON output

      // Optionally write the base64 string as JSON and the PNG file
      if (saveToFile) {
        const jsonOutput = JSON.stringify(output, null, 2);
        // Save the JSON to a file
        await fs.writeFile("screenshotBase64.json", jsonOutput);
        console.log(
          "Base64-encoded screenshot has been saved as JSON to screenshotBase64.json"
        );

        // Save the screenshot as a PNG file
        await page.screenshot({
          path: fileName + "." + format,
          type: format,
          omitBackground: true,
        });
        console.log(
          `Screenshot has been saved as ${format} to ${fileName}.${format}`
        );
      }
    } catch (err) {
      console.error(`Failed to take a screenshot: ${err.message}`);
      const errorOutput = {
        status: "error",
        message: err.message,
      };
      console.log(JSON.stringify(errorOutput, null, 2));
    }
  } catch (err) {
    console.error(`Error in Puppeteer process: ${err.message}`);
    const errorOutput = {
      status: "error",
      message: err.message,
    };
    console.log(JSON.stringify(errorOutput, null, 2));
  } finally {
    // Ensure the browser instance is closed after execution
    if (browser) {
      await browser.close();
    }
  }
})();
