import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { Box3, PerspectiveCamera, Sphere, Vector3 } from "three";
import type { Object3D } from "three";

interface CanvasUtilitiesProps {
  canvasReference: RefObject<HTMLCanvasElement>;
  loadedModel: Object3D;
}

const ZOOM_SPEED = 0.003;
const DEG_TO_RAD = 180;
const HALF_DIVISOR = 2;
const DEFAULT_CAMERA_OFFSET = 1.75;
const TINY_MODEL_THRESHOLD = 0.3;
const TINY_MODEL_TARGET_SIZE = 1;
const LARGE_MODEL_THRESHOLD = 15;
const LARGE_MODEL_TARGET_SIZE = 7;

/**
 * Adjusts the camera's position and orientation to fit an object.
 * It takes an object, a camera, and an offset as parameters.
 * The offset is used to set the camera's distance from the object's center.
 * The function calculates the bounding box of the object and sets the camera's position and orientation
 * so that the entire object is visible in the camera's field of view.
 * If the object is too small, it scales the object up to a target size.
 * The camera's position is then adjusted based on the new size of the object.
 * @param {Object3D} object The object to adjust the camera for.
 * @param {PerspectiveCamera} camera The perspective camera whose position and orientation will be adjusted to fit the object.
 * @param {number} [offset] The offset to use for the camera's distance from the object's center.
 */
function adjustCameraToFitObject(
  object: Object3D,
  camera: PerspectiveCamera,
  offset = DEFAULT_CAMERA_OFFSET
) {
  //Guard clause: Ensure the object is valid and has the required method. Prevents runtime errors.
  if (!object || typeof object.updateWorldMatrix !== "function") {
    //eslint-disable-next-line no-console
    console.warn("Invalid object passed to adjustCameraToFitObject:", object);
    return;
  }
  const tempVec = new Vector3();

  //Create a bounding box that encapsulates the entire object and all its children.
  const boundingBox = new Box3().setFromObject(object);

  //Generate a bounding sphere from the bounding box to get the overall radius and center of the object.
  const { center, radius } = boundingBox.getBoundingSphere(new Sphere());

  const size = boundingBox.getSize(tempVec.clone());

  //Convert the camera's vertical field of view to radians (this is necessary because JavaScript's Math functions use radians).
  const fov = camera.fov * (Math.PI / DEG_TO_RAD);

  /**
   * Calculates the Z position of the camera based on the radius and field of view.
   * @param {number} r The radius of the bounding sphere.
   * @returns {number} The calculated Z position for the camera.
   */
  const getCameraZ = (r: number) =>
    Math.abs(r / Math.sin(fov / HALF_DIVISOR)) * offset;

  //Calculate initial camera Z position based on the current radius.
  let cameraZ = getCameraZ(radius);

  //Find the largest dimension of the model (used to decide if we should scale it).
  const maxDim = Math.max(size.x, size.y, size.z);

  //Scale the object up if it's too small or down if it's too large.
  if (maxDim < TINY_MODEL_THRESHOLD || maxDim > LARGE_MODEL_THRESHOLD) {
    const targetSize =
      maxDim < TINY_MODEL_THRESHOLD
        ? TINY_MODEL_TARGET_SIZE
        : LARGE_MODEL_TARGET_SIZE;
    const scaleMultiplier = targetSize / maxDim;
    object.scale.multiplyScalar(scaleMultiplier);

    //After scaling, update the bounding box and sphere to reflect the new size.
    const { center: newCenter, radius: newRadius } = new Box3()
      .setFromObject(object)
      .getBoundingSphere(new Sphere());

    //Recalculate camera distance using the new radius.
    cameraZ = getCameraZ(newRadius);

    camera.position.set(newCenter.x, newCenter.y, cameraZ + newCenter.z);
    camera.lookAt(newCenter);
  } else {
    camera.position.set(center.x, center.y, cameraZ + center.z);
    camera.lookAt(center);
  }

  camera.updateProjectionMatrix();
}

/**
 * CanvasUtilities is a helper component that enhances user interaction with a Three.js canvas.
 * It manages event listeners for the canvas element, allowing for dynamic camera zoom control using the mouse wheel.
 * Additionally, it detects when the user's mouse enters or leaves the canvas, enabling or disabling interactions accordingly.
 * Features:
 * - Adjusts the camera's zoom based on mouse wheel input.
 * - Detects when the mouse enters or leaves the canvas to enable/disable zooming.
 * - Ensures proper event listener cleanup to prevent memory leaks.
 * @param {RefObject<HTMLCanvasElement>} canvasReference A reference to the canvas element.
 * @returns {null} This component does not render anything.
 */
const CanvasUtilities: React.FC<CanvasUtilitiesProps> = ({
  canvasReference,
  loadedModel
}) => {
  const { camera } = useThree();
  const isInteracting = useRef(false);

  if (camera instanceof PerspectiveCamera) {
    adjustCameraToFitObject(loadedModel, camera);
  }

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      camera.position.z += event.deltaY * ZOOM_SPEED;
      camera.updateProjectionMatrix();
    },
    [camera]
  );

  const handleMouseEnter = useCallback(() => {
    isInteracting.current = true;
    window.addEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseLeave = useCallback(() => {
    isInteracting.current = false;
    window.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const canvas = canvasReference.current;
    if (!canvas) {
      return undefined;
    }

    /**
     * Checks if the mouse is initially inside the canvas element and
     * accordingly adds or removes the wheel event listener.
     * @param {MouseEvent} event The mouse event object.
     */
    const checkInitialMousePosition = (event: MouseEvent) => {
      const { bottom, left, right, top } = canvas.getBoundingClientRect();
      const { clientX, clientY } = event;

      if (
        clientX >= left &&
        clientX <= right &&
        clientY >= top &&
        clientY <= bottom
      ) {
        handleMouseEnter();
      } else {
        handleMouseLeave();
      }
    };

    window.addEventListener("mousemove", checkInitialMousePosition, {
      once: true
    });
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousemove", checkInitialMousePosition);
    };
  }, [canvasReference, handleMouseEnter, handleMouseLeave]);

  return null;
};

export default CanvasUtilities;
