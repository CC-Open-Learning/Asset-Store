import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import axios from "axios";
import fs from "fs/promises";

dotenv.config();

// Load port and file path from environment variables
const PORT = process.env.VITE_SERVER_PORT || 4040;
let rootDirectory = process.env.ROOT_DIRECTORY || process.cwd();

const app = express();
app.use(cors());

let latestFilename = null; // Variable to store the filename
let lastLocation = {}; // Object to store the last found location for each filename

// Helper function to recursively search for a file in deeply nested directories
const findFileInDirectory = async (dir, filename) => {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        const found = await findFileInDirectory(filePath, filename);
        if (found) return found;
      } else if (file.name === filename) {
        // Update the last location for this filename
        lastLocation[filename] = dir;
        return filePath;
      }
    }
  } catch (err) {
    console.error(`Error reading directory: ${dir}`, err);
    return null;
  }

  return null;
};

// Updated file search logic that uses the last known location and updates it dynamically
const searchForFile = async filename => {
  // Check if we have a last known location for the filename
  if (lastLocation[filename]) {
    console.log(
      `Trying last known location for ${filename}: ${lastLocation[filename]}`
    );
    const foundInLastLocation = await findFileInDirectory(
      lastLocation[filename],
      filename
    );

    // If the file was found in the last known location, return it
    if (foundInLastLocation) {
      return foundInLastLocation;
    }

    // If not found, revert to the full directory search
    console.log(
      `File not found in last known location. Reverting to full directory search.`
    );
  }

  // Perform a full directory search if the last location was not successful
  return await findFileInDirectory(rootDirectory, filename);
};

// Send the latest filename via Server-Sent Events (SSE)
app.get("/fbx-updates", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (latestFilename) {
    res.write(`data: ${JSON.stringify({ filename: latestFilename })}\n\n`);
  }

  req.on("close", () => {
    res.end();
  });
});

// Serve a file directly by filename, searching through nested directories and updating last location dynamically
app.get("/:filename", async (req, res) => {
  try {
    const filePath = await searchForFile(req.params.filename);

    if (filePath) {
      console.log(`Serving file: ${filePath}`);

      // Update last location dynamically
      lastLocation[req.params.filename] = path.dirname(filePath);

      res.sendFile(filePath, err => {
        if (err) {
          console.error(`Error serving file: ${filePath}`, err);
          res.status(500).send("Error serving file");
        }
      });
    } else {
      console.error(`File not found: ${req.params.filename}`);
      res.status(404).send("File not found");
    }
  } catch (err) {
    console.error(`Error searching for file: ${req.params.filename}`, err);
    res.status(500).send("Error searching for file");
  }
});

// Set the root directory for serving files dynamically
app.post("/set-directory", express.json(), (req, res) => {
  const { directoryPath } = req.body;
  if (directoryPath && path.isAbsolute(directoryPath)) {
    rootDirectory = directoryPath;
    console.log(`Root directory set to: ${directoryPath}`);
    res.send(`Root directory set to ${directoryPath}`);
  } else {
    console.error(`Invalid directory path: ${directoryPath}`);
    res.status(400).send("Invalid directory path");
  }
});

// Receive and store the filename (no forwarding needed)
app.post("/forward-filename", express.json(), async (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    console.error("Filename is required but not provided.");
    return res.status(400).send("Filename is required");
  }

  // Store the filename for later retrieval
  latestFilename = filename;

  console.log(`Filename received and stored: ${filename}`);
  res.send(`Filename received and stored: ${filename}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
