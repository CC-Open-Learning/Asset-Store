import { useEffect, useState, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader.js"; // TGALoader for TGA textures
import * as THREE from "three";

/**
  Model component to load and display the model.
  Applies random or overridden color and handles model positioning and rotation.
 */
const Model = ({ url, fileType, onModelLoaded, colorOverride }) => {
  const [isAssetLoaded, setAssetLoaded] = useState(false);
  const [model, setModel] = useState(null);
  const [baseColor] = useState(() =>
    colorOverride
      ? new THREE.Color(colorOverride)
      : new THREE.Color(Math.random(), Math.random(), Math.random())
  );

  useEffect(() => {
    if (!url || isAssetLoaded) return;

    const loadModel = async (fileExtension, url) => {
      let loader;
      switch (fileExtension) {
        case "fbx":
          loader = new FBXLoader();
          break;
        case "gltf":
        case "glb":
          loader = new GLTFLoader();
          break;
        case "obj":
          loader = new OBJLoader();
          break;
        default:
          throw new Error("Unsupported format");
      }

      return new Promise((resolve, reject) => {
        loader.load(
          url,
          object => resolve(object),
          undefined,
          error => reject(error)
        );
      });
    };

    const applyBaseColor = object => {
      const tgaLoader = new TGALoader(); // Assuming you are using TGALoader

      // Function to process Mesh materials and geometry
      const processMesh = (mesh, tgaLoader) => {
        // Check if the material is an array (multi-material case)
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

        materials.forEach((material, index) => {
          const shadeFactor = 0.7 + Math.random() * 0.3;
          const shadeColor = baseColor
            .clone()
            .lerp(new THREE.Color(1, 1, 1), 1 - shadeFactor);

          material.color = shadeColor;
          material.clipShadows = true;
          material.needsUpdate = true;
        });
      };

      object.traverse(child => {
        // Check if the child is a Group (Object3D with children but not a Mesh)
        if (child instanceof THREE.Object3D && !child.isMesh) {
          // Traverse the group's children recursively
          child.children.forEach(groupChild => {
            if (groupChild.isMesh) {
              processMesh(groupChild, tgaLoader); // Process materials for each mesh
            }
          });
        }

        // Handle Meshes directly
        if (child.isMesh) {
          processMesh(child, tgaLoader); // Process materials for mesh
        }
      });
    };

    const loadAndApplyModel = async () => {
      try {
        const fileExtension = url.split(".").pop();
        const loadedModel = await loadModel(fileExtension, url);

        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        applyBaseColor(loadedModel);
        setAssetLoaded(true);
        setModel(loadedModel);

        onModelLoaded({ size, center, baseColor });
      } catch (error) {
        console.error("Failed to load model:", error);
      }
    };

    loadAndApplyModel();
  }, [url, isAssetLoaded, baseColor, onModelLoaded]);

  return model ? <primitive object={model} /> : null;
};

/**
 CameraController component to dynamically adjust camera based on the model size.
 */
const CameraController = ({ modelSize }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (!modelSize) return;

    const { size, center } = modelSize;
    const maxDimension = Math.max(size.x, size.y, size.z);
    const distance = maxDimension * 1.1;

    const angle = Math.PI / 3;
    const xPos = Math.cos(angle) * distance;
    const zPos = Math.sin(angle) * distance;

    camera.position.set(xPos, distance, zPos);
    camera.lookAt(center.x, center.y, center.z);

    camera.near = 0.001;
    camera.far = 10000;
    camera.fov = 55;
    camera.updateProjectionMatrix();
  }, [modelSize, camera]);

  return null;
};

/**
 Main App component to handle the rendering of the canvas, loading state, and the model.
 */
const App = () => {
  const [isAssetLoaded, setAssetLoaded] = useState(false);
  const [modelSize, setModelSize] = useState(null);
  const [fbxFilePath, setFbxFilePath] = useState(null); // State to hold the dynamic file path
  const [darkestColor, setDarkestColor] = useState("black");

  const port = import.meta.env.VITE_SERVER_PORT;

  // Set up a simple server inside the client to listen for a POST request
  useEffect(() => {
    const listenForPost = async () => {
      const server = new EventSource(`http://localhost:${port}/fbx-updates`);

      server.addEventListener("message", event => {
        const data = JSON.parse(event.data);
        const filename = data.filename;

        if (filename) {
          setFbxFilePath(`http://localhost:${port}/${filename}`);
          setAssetLoaded(true);
        }
      });

      server.onerror = error => {
        console.error("Error receiving updates:", error);
      };

      return () => {
        server.close();
      };
    };

    listenForPost();
  }, [port]);

  const handleModelLoaded = ({ size, center, baseColor }) => {
    setModelSize({ size, center });

    const darkest = baseColor.clone().lerp(new THREE.Color(0, 0, 0), 0.7);
    const darkestColor = `rgb(${darkest.r * 255}, ${darkest.g * 255}, ${
      darkest.b * 255
    })`;

    setDarkestColor(darkestColor);
    console.log(
      `MODEL_LOADED { "size": ${JSON.stringify(
        size
      )}, "center": ${JSON.stringify(center)}, "color": "${darkestColor}" }`
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        backgroundImage: `radial-gradient(circle, black 0%, ${darkestColor} 100%)`
      }}>
      {!isAssetLoaded ? (
        <div>Loading Model...</div>
      ) : (
        <>
          <Canvas
            gl={{ antialias: true }}
            style={{
              width: "100%",
              height: "100%"
            }}>
            <CameraController modelSize={modelSize} />
            <ambientLight intensity={0.7} />
            <directionalLight intensity={1.5} position={[0, 10, 5]} />
            <Suspense fallback={null}>
              <Model
                url={fbxFilePath}
                fileType={fbxFilePath.split(".").pop()}
                onModelLoaded={handleModelLoaded}
                //colorOverride={"#F4BE40"} //conestoga yellow
              />
            </Suspense>
          </Canvas>
        </>
      )}
    </div>
  );
};

export default App;
