import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  type Euler,
  Group,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3
} from "three";
import { FBXLoader, GLTFLoader, OBJLoader } from "three-stdlib";

/**
 * Sets the background color of a scene.
 * ⚠️ Not compatible with React Three Fiber. Use `Canvas` background props in Fiber instead.
 * @param {Scene} scene The scene to set the background color for.
 * @param {string | Color} color The background color to set.
 */
const setBackgroundColor = (scene: Scene, color: Color | string) => {
  scene.background = new Color(color);
};

/**
 * Creates a new scene with an optional background color.
 * ⚠️ Not compatible with React Three Fiber. Use `Canvas` background props in Fiber instead.
 * @param {string | Color} [backgroundColor] Background color for the scene.
 * @returns {Scene} The newly created scene.
 */
const createScene = (backgroundColor?: Color | string): Scene => {
  const scene = new Scene();
  if (backgroundColor) {
    scene.background = new Color(backgroundColor);
  }
  return scene;
};

/**
 * Creates a new Perspective or Orthographic camera based on parameters.
 * ⚠️ Not compatible with React Three Fiber. Use Fiber’s `<PerspectiveCamera />` or `<OrthographicCamera >`.
 * @param {number} [fov] Field of view for the perspective camera.
 * @param {number} [aspect] Aspect ratio of the camera.
 * @param {number} [near] Near clipping plane.
 * @param {number} [far] Far clipping plane.
 * @param {boolean} [orthographic] If true, creates an orthographic camera.
 * @returns {PerspectiveCamera | OrthographicCamera} The created camera.
 */
const createCamera = (
  fov: number,
  aspect: number,
  near: number,
  far: number,
  orthographic: boolean = false
): OrthographicCamera | PerspectiveCamera => {
  return orthographic
    ? new OrthographicCamera(-aspect, aspect, 1, -1, near, far)
    : new PerspectiveCamera(fov, aspect, near, far);
};

/**
 * Sets the position of a camera (works for both Perspective and Orthographic cameras).
 * ⚠️ Not compatible with React Three Fiber. Use Fiber’s `<Camera />` position props instead.
 * @param {PerspectiveCamera | OrthographicCamera} camera The camera to position.
 * @param {Vector3} position The new position for the camera.
 */
const setCameraPosition = (
  camera: OrthographicCamera | PerspectiveCamera,
  position: Vector3
) => {
  camera.position.copy(position);
};

/**
 * Sets the rotation of a camera (works for both camera types).
 * ⚠️ Not compatible with React Three Fiber. Use Fiber’s `<Camera />` rotation props instead.
 * @param {PerspectiveCamera | OrthographicCamera} camera The camera to rotate.
 * @param {Euler} rotation The new rotation for the camera.
 */
const setCameraRotation = (
  camera: OrthographicCamera | PerspectiveCamera,
  rotation: Euler
) => {
  camera.rotation.copy(rotation);
};

/**
 * Sets the field of view (FOV) for a PerspectiveCamera, ignored for OrthographicCamera.
 * ⚠️ Not compatible with React Three Fiber. Set `fov` directly on Fiber’s `<PerspectiveCamera />` props.
 * @param {PerspectiveCamera | OrthographicCamera} camera The camera to set the FOV for.
 * @param {number} fov The new FOV.
 */
const setCameraFov = (
  camera: OrthographicCamera | PerspectiveCamera,
  fov: number
) => {
  if (camera instanceof PerspectiveCamera) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
};

/**
 * Sets the camera to look at a specified target position (works for both camera types).
 * ⚠️ Not compatible with React Three Fiber. Use Fiber’s `<Camera />` lookAt function instead.
 * @param {PerspectiveCamera | OrthographicCamera} camera The camera to point.
 * @param {Vector3} target The target position to look at.
 */
const setLookAt = (
  camera: OrthographicCamera | PerspectiveCamera,
  target: Vector3
) => {
  camera.lookAt(target);
  camera.updateProjectionMatrix();
};

/**
 * Dynamically selects a loader based on the file extension.
 * @param {string} path The file path to determine the loader for.
 * @returns {FBXLoader | GLTFLoader | OBJLoader} The appropriate loader.
 */
const getLoader = (path: string) => {
  const extension = path.split(".").pop()?.toLowerCase();
  const manager = new LoadingManager();

  switch (extension!) {
    case "fbx":
      return new FBXLoader(manager);
    case "glb":
    case "gltf":
      return new GLTFLoader(manager);
    case "obj":
      return new OBJLoader(manager);
    default:
      throw new Error(`Unsupported model format: .${extension!}`);
  }
};

/**
 * Loads an FBX model from a specified path and resolves with the loaded Group object.
 * @param {object} params Parameters for model loading.
 * @param {string} params.path The path to the model file.
 * @param {(xhr: ProgressEvent<EventTarget>) => void} [params.onProgress] Optional progress callback.
 * @param {(event: ErrorEvent) => void} [params.onError] Optional error callback.
 * @returns {Promise<Group>} Promise resolving with the loaded model.
 */
const loadModel = ({
  onError,
  onProgress,
  path
}: {
  onError?: (event: ErrorEvent) => void;
  onProgress?: (xhr: ProgressEvent) => void;
  path: string;
}): Promise<Group> => {
  return new Promise((resolve, reject) => {
    try {
      const loader = getLoader(path);

      loader.load(
        path,
        object => {
          if (object instanceof Group) {
            // Handle Group-based loaders (FBXLoader, OBJLoader)
            resolve(object);
          } else if ("scene" in object) {
            // Handle GLTFLoader (GLTF object with a scene property)
            resolve(object.scene);
          }
        },
        onProgress,
        onError
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        onError?.(new ErrorEvent("error", { message: err.message }));
        reject(err);
      }
    }
  });
};

/**
 * Sets the color of a model's material and updates textures if they exist.
 * @param {Group | Mesh} object The object to color.
 * @param {Color | string} color The color to apply.
 */
const setColor = (object: Group | Mesh, color: Color | string) => {
  /**
   * Sets the color of a mesh's material and updates textures if they exist.
   * @param mesh The mesh to color and update.
   */
  const setMeshColor = (mesh: Mesh) => {
    const { material } = mesh;
    if (Array.isArray(material)) {
      // For meshes with multiple materials
      material.forEach(mat => {
        if ((mat as MeshStandardMaterial).isMeshStandardMaterial) {
          (mat as MeshStandardMaterial).color.set(color);
          (mat as MeshStandardMaterial).needsUpdate = true;
        }
      });
    } else if ((material as MeshStandardMaterial).isMeshStandardMaterial) {
      // Single material
      (material as MeshStandardMaterial).color.set(color);
      (material as MeshStandardMaterial).needsUpdate = true;
    } else {
      // Replace incompatible material
      mesh.material = new MeshStandardMaterial({
        color: new Color(color)
      });
      mesh.material.needsUpdate = true;
    }
  };

  if (object instanceof Group) {
    object.traverse(child => {
      if ((child as Mesh).isMesh) {
        setMeshColor(child as Mesh);
      }
    });
  } else if (object instanceof Mesh) {
    setMeshColor(object);
  }
};

/**
 * Sets the position of a model.
 * @param {Group} model The model to position.
 * @param {Vector3} position The new position for the model.
 */
const setPosition = (model: Group, position: Vector3) =>
  model.position.copy(position);

/**
 * Sets the rotation of a model using Euler angles.
 * @param {Group} model The model to rotate.
 * @param {Euler} rotation The new rotation for the model.
 */
const setRotation = (model: Group, rotation: Euler) => {
  model.rotation.copy(rotation);
};

/**
 * Sets the scale of a model.
 * @param {Group} model The model to scale.
 * @param {Vector3} scale The new scale for the model.
 */
const setScale = (model: Group, scale: Vector3) => model.scale.copy(scale);

/**
 * Enum representing possible rotation axes.
 */
enum RotationAxis {
  X = "x",
  Y = "y",
  Z = "z"
}

/**
 * Rotates a model around a specified pivot point on one or more axes.
 * @param {Group | Mesh} model The model to rotate.
 * @param {Vector3} pivot The pivot point around which to rotate the model.
 * @param {number} radius The distance from the pivot to the model.
 * @param {number} angle The angle of rotation.
 * @param {RotationAxis[]} axes The axes of rotation.
 * @param {Vector3} [lookAtTarget] Optional parameter for the model to look at a specific target.
 */
const rotateAround = (
  model: Group | Mesh,
  pivot: Vector3,
  radius: number,
  angle: number,
  axes: RotationAxis[],
  lookAtTarget?: Vector3
) => {
  const sinAngle = Math.sin(angle);
  const cosAngle = Math.cos(angle);
  const { x, y, z } = pivot;

  // Start with the original pivot position
  let newX = x;
  let newY = y;
  let newZ = z;

  // Apply cohesive rotation based on selected axes
  if (
    axes.includes(RotationAxis.X) &&
    axes.includes(RotationAxis.Y) &&
    axes.includes(RotationAxis.Z)
  ) {
    // Rotation around all three axes
    newX += radius * cosAngle;
    newY += radius * cosAngle;
    newZ += radius * sinAngle;
  } else if (axes.includes(RotationAxis.X) && axes.includes(RotationAxis.Y)) {
    // Rotation around X and Y axes
    newX += radius * cosAngle;
    newY += radius * sinAngle;
    newZ += radius * sinAngle;
  } else if (axes.includes(RotationAxis.X) && axes.includes(RotationAxis.Z)) {
    // Rotation around X and Z axes
    newX += radius * cosAngle;
    newY += radius * sinAngle;
    newZ += radius * cosAngle;
  } else if (axes.includes(RotationAxis.Y) && axes.includes(RotationAxis.Z)) {
    // Rotation around Y and Z axes
    newX += radius * sinAngle;
    newY += radius * cosAngle;
    newZ += radius * cosAngle;
  } else {
    // Single axis rotations
    if (axes.includes(RotationAxis.X)) {
      // X-axis rotation affects Y and Z
      newY += radius * cosAngle;
      newZ += radius * sinAngle;
    }
    if (axes.includes(RotationAxis.Y)) {
      // Y-axis rotation affects X and Z
      newX += radius * cosAngle;
      newZ += radius * sinAngle;
    }
    if (axes.includes(RotationAxis.Z)) {
      // Z-axis rotation affects X and Y
      newX += radius * cosAngle;
      newY += radius * sinAngle;
    }
  }

  // Update the model's position
  model.position.set(newX, newY, newZ);

  // Optionally set the model to look at a specific target if provided
  if (lookAtTarget) {
    model.lookAt(lookAtTarget);
  }
};

/**
 * Adds ambient lighting to a scene with a specified color and intensity.
 * ⚠️ Not compatible with React Three Fiber. Use Fiber’s `<ambientLight />` instead.
 * @param {Scene} scene The scene to add the light to.
 * @param {Color | string} color The color of the ambient light, which can be a Color object or a string representing a color.
 * @param {number} intensity The intensity of the ambient light, typically between 0 and 1.
 * @returns {AmbientLight} The added ambient light.
 */
const addAmbientLight = (
  scene: Scene,
  color: Color | string = "#ffffff",
  intensity = 0.5
): AmbientLight => {
  const ambientLight = new AmbientLight(color, intensity);
  scene.add(ambientLight);
  return ambientLight;
};

/**
 * Adds directional lighting to a scene with a specified color, intensity, and position.
 * ⚠️ Not compatible with React Three Fiber. Use Fiber’s `<directionalLight />` instead.
 * @param {Scene} scene The scene to add the light to.
 * @param {Color | string} color The color value for the directional light, which can be a Color object or a string representing a color.
 * @param {number} intensity The intensity of the directional light, typically between 0 and 1.
 * @param {Vector3} position The position of the directional light, which determines the direction of the light.
 * @returns {DirectionalLight} The added directional light.
 */
const addDirectionalLight = (
  scene: Scene,
  color: Color | string = "#ffffff",
  intensity = 1,
  position: Vector3 = new Vector3(10, 10, 10)
) => {
  const directionalLight = new DirectionalLight(color, intensity);
  directionalLight.position.copy(position);
  scene.add(directionalLight);
  return directionalLight;
};

/**
 * Calculates the bounding box of a model and returns its size and center.
 * @param {Group | Mesh} object The object to calculate dimensions for.
 * @returns {object} An object with size and center properties.
 */
const calculateDimensions = (object: Group | Mesh) => {
  const box = new Box3().setFromObject(object);

  return {
    center: box.getCenter(new Vector3()),
    size: box.getSize(new Vector3())
  };
};

interface ModelProps {
  model: Group | null;
}

/**
 * Component to add a model to the scene.
 * @param ModelProps The component props object.
 * @param ModelProps.model The model to add to the scene.
 */
const Model = ({ model }: ModelProps) => {
  const { scene } = useThree();

  useEffect(() => {
    if (model) {
      scene.add(model);
      return () => {
        scene.remove(model);
      };
    }
    return undefined;
  }, [model, scene]);

  return null;
};

const ThreeService = {
  addAmbientLight,
  addDirectionalLight,
  calculateDimensions,
  createCamera,
  createScene,
  getLoader,
  loadModel,
  Model,
  rotateAround,
  RotationAxis,
  setBackgroundColor,
  setCameraFov,
  setCameraPosition,
  setCameraRotation,
  setColor,
  setLookAt,
  setPosition,
  setRotation,
  setScale
};

export default ThreeService;
