/* eslint-disable react/no-unknown-property */
/* eslint-disable react/forbid-component-props */
import "./NotFound3D.css";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { type Color, Euler, type Group, Vector3 } from "three";

import ThreeService from "../../../services/three/ThreeService";

const FOUR_MODEL_PATH = `/assets/models/NumberFour.fbx`;
const ZERO_MODEL_PATH = `/assets/models/NumberZero.fbx`;

interface NotFound3DProps {
  className?: string;
  color: Color;
  numberModelUrl?: string;
}

/**
 * 404 page component.
 * @param NotFound3DProps The component props object.
 * @param NotFound3DProps.className The class name for the component.
 * @param NotFound3DProps.color The color for the component.
 * @param NotFound3DProps.numberModelUrl The optional prop number.
 */
function NotFound3D({ className, color, numberModelUrl }: NotFound3DProps) {
  const [firstFourModel, setFirstFourModel] = useState<Group | null>(null);
  const [thirdNumberModel, setThirdNumberModel] = useState<Group | null>(null);
  const [zeroModel, setZeroModel] = useState<Group | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const rotationAngleRef = useRef<number>(0);
  const isDragging = useRef(false);

  // Constants
  const scale = new Vector3(0.007, 0.007, 0.007);
  const originOffsetX = 1.65;
  const originOffsetY = -0.8;

  // Load models
  useEffect(() => {
    // Fours
    ThreeService.loadModel({
      /**
       * Callback to handle model loading progress.
       * @param xhr The XHR object.
       */
      onProgress(xhr) {
        const PERCENTAGE_MULTIPLIER = 100;
        const percentageLoaded = xhr.total
          ? (xhr.loaded / xhr.total) * PERCENTAGE_MULTIPLIER
          : 0;
        console.log(`Four model: ${percentageLoaded.toFixed(2)}% loaded`);
      },
      path: FOUR_MODEL_PATH
    })
      .then(model => {
        setFirstFourModel(model.clone());
        //If optional prop is not set, stores a clone of "4" model This is used as the second "4" in the animation
        if (!thirdNumberModel) {
          setThirdNumberModel(model.clone());
        }
      })
      .catch((error: unknown) => {
        console.error("Error loading Four model:", error);
      });

    // Zero
    ThreeService.loadModel({
      /**
       * Callback to handle model loading progress.
       * @param xhr The XHR object.
       */
      onProgress(xhr) {
        const PERCENTAGE_MULTIPLIER = 100;
        const percentageLoaded = xhr.total
          ? (xhr.loaded / xhr.total) * PERCENTAGE_MULTIPLIER
          : 0;
        console.log(`Zero model: ${percentageLoaded.toFixed(2)}% loaded`);
      },
      path: ZERO_MODEL_PATH
    })
      .then(model => {
        setZeroModel(model);
      })
      .catch((error: unknown) => {
        console.error("Error loading Zero model:", error);
      });

    // Conditionally load the "3" model based on NumberModelUrl or second 4 at the end
    if (numberModelUrl) {
      ThreeService.loadModel({
        /**
         * Callback to handle model loading progress.
         * @param xhr The XHR object.
         */
        onProgress(xhr) {
          const PERCENTAGE_MULTIPLIER = 100;
          const percentageLoaded = xhr.total
            ? (xhr.loaded / xhr.total) * PERCENTAGE_MULTIPLIER
            : 0;
          console.log(
            `Third number model: ${percentageLoaded.toFixed(2)}% loaded`
          );
        },
        path: numberModelUrl // Use NumberModelUrl for the three model
      })
        .then(model => {
          setThirdNumberModel(model.clone());
        })
        .catch((error: unknown) => {
          console.error("Error loading Third number:", error);
        });
    }
  }, [numberModelUrl]);

  // Setup models
  useEffect(() => {
    if (!firstFourModel || !thirdNumberModel || !zeroModel) {
      return;
    }

    // First Four
    ThreeService.setScale(firstFourModel, scale);
    ThreeService.setPosition(
      firstFourModel,
      new Vector3(-originOffsetX, originOffsetY, 0)
    );
    ThreeService.setColor(firstFourModel, color);

    // Third number (second 4 for 404 or 3 for 403)
    ThreeService.setScale(thirdNumberModel, scale);
    ThreeService.setPosition(
      thirdNumberModel,
      new Vector3(originOffsetX, originOffsetY, 0)
    );
    ThreeService.setColor(thirdNumberModel, color);

    // Zero
    ThreeService.setScale(zeroModel, scale);
    ThreeService.setPosition(zeroModel, new Vector3(0, originOffsetY, 0));
    ThreeService.setColor(zeroModel, color);
  }, [firstFourModel, thirdNumberModel, zeroModel]);
  // Animation
  useEffect(() => {
    if (!firstFourModel || !thirdNumberModel || !zeroModel || !isAnimating)
      return () => {};

    let animationFrameId = 0;
    let lastTime = performance.now();

    /**
     * Animates the models in a circular motion around the zero and spins the fours.
     * Uses time-based animation for smooth movement across different refresh rates.
     * @param currentTime The current time in milliseconds.
     */
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Update angle based on time (0.5 radians per second)
      rotationAngleRef.current += 0.5 * deltaTime;

      // Rotate first 4 around zero
      ThreeService.rotateAround(
        firstFourModel,
        zeroModel.position,
        originOffsetX, // Radius (distance from zero)
        rotationAngleRef.current + Math.PI, // Offset by PI to place it opposite to first 4
        [ThreeService.RotationAxis.Y]
      );

      // Rotate third number around zero (offset by PI for opposite position)
      ThreeService.rotateAround(
        thirdNumberModel,
        zeroModel.position,
        originOffsetX, // Radius (distance from zero)
        rotationAngleRef.current,
        [ThreeService.RotationAxis.Y]
      );

      // Spin fours
      ThreeService.setRotation(
        firstFourModel,
        new Euler(
          firstFourModel.rotation.x,
          rotationAngleRef.current,
          firstFourModel.rotation.z
        )
      );
      ThreeService.setRotation(
        thirdNumberModel,
        new Euler(
          thirdNumberModel.rotation.x,
          rotationAngleRef.current,
          thirdNumberModel.rotation.z
        )
      );

      // Request next animation frame
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start the animation
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAnimating]);

  return (
    <Canvas
      aria-hidden="true"
      className={className}
      gl={{ antialias: true }}
      id="notfound3d-canvas"
      onMouseDown={() => (isDragging.current = false)}
      onMouseMove={() => (isDragging.current = true)}
      onMouseUp={() => {
        if (!isDragging.current) {
          // Only toggle animation if it was a click (no dragging)
          setIsAnimating(prev => !prev);
        }
      }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 1]} />
        <directionalLight position={[0, 0, -1]} />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls
          dampingFactor={0.01}
          enablePan={false}
          enableZoom={false}
          maxDistance={5}
          maxPolarAngle={95 * (Math.PI / 180)}
          minDistance={5}
          minPolarAngle={85 * (Math.PI / 180)}
          panSpeed={0.3}
          rotateSpeed={0.3}
          target={new Vector3(0, -0.5, 0)}
          touches={{}}
        />
        <ThreeService.Model model={firstFourModel} />
        <ThreeService.Model model={zeroModel} />
        <ThreeService.Model model={thirdNumberModel} />
      </Suspense>
    </Canvas>
  );
}

export default NotFound3D;
