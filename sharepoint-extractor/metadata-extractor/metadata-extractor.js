const THREE = require("three");
const { FBXLoader } = require("three-stdlib");
const fs = require("fs");

// Creating mock window to avoid errors from FBXLoader when creating URL
global.window = {
  URL: {
    createObjectURL: () => {}
  }
};

// Creating mock document to avoid errors from FBXLoader when manipulating DOM Elements
global.document = {
  createElement: tag => {
    if (tag === "img") {
      return {
        addEventListener: () => {}
      };
    }
    return {};
  },
  createElementNS: (namespaceURI, name) => {
    if (name === "img") {
      return {
        addEventListener: () => {}
      };
    }
    return {};
  }
};

// Function to Load FBX, Read FBX and Parse Metadata
function loadFBXAndExtractMetadata(filePath) {
  try {
    // Read FBX using file system
    const fbxFile = fs.readFileSync(filePath);

    // Load FBX using FBXLoader
    const loader = new FBXLoader();
    const fbx = loader.parse(fbxFile.buffer);

    // Check if the model has a scene, use scene or model - OnLoad
    const root = fbx.scene || fbx;
    // console.log(root);

    //For Models
    let vertices = 0,
      edges = 0,
      triangles = 0,
      polygons = 0,
      lodCount = 0,
      rigType = "NONE",
      animationCount = 0;

    // Check if root object has animations
    if (fbx.animations && fbx.animations.length > 0) {
      animationCount = fbx.animations.length;
    }

    // Traverse through FBX model child to parse metadata
    root.traverse(child => {
      if (child.isMesh) {
        const geometry = child.geometry;

        // Calculate vertices, edges, triangles and polygons
        if (geometry.index !== null) {
          vertices += geometry.index.count;
          edges += geometry.index.count / 2;
          triangles += geometry.index.count / 3;
          polygons += geometry.index.count / 4;
        } else {
          vertices += geometry.attributes.position.count;
          edges += geometry.attributes.position.count / 2;
          triangles += geometry.attributes.position.count / 3;
          polygons += geometry.attributes.position.count / 4;
        }

        // Checking for rig type: NONE, FK or IK
        if (child.skeleton) {
          rigType = "FK";
          if (child.name.toUpperCase().includes("IK")) {
            rigType = "IK";
          }
        }
      }
    });

    // Extracting file details
    const fileName = filePath.split("\\").pop();
    const fileNameWithoutExt = fileName.split(".")[0];
    const titleCaseName = fileNameWithoutExt
      .split(".")[0]
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    const fileSize = fs.statSync(filePath).size;
    const fileExtension = fileName.split(".").pop();

    // If filename includes "LOD" naming convention, increase count
    if (fileName.includes("LOD")) {
      lodCount++;
    }

    // Store the Model Metadata
    const modelMetadata = {
      name: titleCaseName,
      fileName: fileName,
      fileSize: fileSize,
      format: fileExtension,
      model: {
        triCount: triangles,
        vertices: vertices,
        edges: edges,
        lodCount: lodCount,
        polygons: polygons,
        rigType: rigType,
        animationCount: animationCount
      }
    };

    // Return metadata in JSON format (proper format)
    return JSON.stringify(modelMetadata, null, 2);
  } catch (error) {
    console.error("Error passing the Metadata from FBX file:", error);
    return JSON.stringify({ error: error.message });
  }
}

// Get the file path from command line argument
const filePath = process.argv[2];
const metadata = loadFBXAndExtractMetadata(filePath);
console.log(metadata);
