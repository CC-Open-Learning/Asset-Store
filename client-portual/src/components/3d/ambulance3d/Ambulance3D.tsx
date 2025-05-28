/* eslint-disable react/forbid-component-props */
/* eslint-disable react/no-unknown-property */

import "./Ambulance3D.css";

import { Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { Color, Euler, type Group, Vector3 } from "three";

import ThreeService from "../../../services/three/ThreeService";

const AMBULANCE_MODEL_PATH = "/assets/models/Ambulance.glb";
const FULL_PROGRESS = 100;

interface CircleGridProps {
  radius?: number;
  rings?: number;
  segments?: number;
}

/**
 * CircleGrid component that creates a circular grid pattern.
 * @param props The component props.
 * @param props.radius The radius of the grid.
 * @param props.rings The number of concentric rings.
 * @param props.segments The number of segments in each ring.
 */
const CircleGrid: React.FC<CircleGridProps> = ({
  radius = 2.95,
  rings = 10,
  segments = 32
}) => {
  const gridRef = useRef<Group>(null);

  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.position.set(0, -0.6, 0);
    }
  });

  const ringStep = radius / rings;
  const radialStep = (Math.PI * 2) / segments;

  const ringsLines = Array.from({ length: rings }, (_, i) => {
    const r = ringStep * (i + 1);
    const points = Array.from({ length: segments + 1 }, (_, j) => {
      const angle = radialStep * j;
      return new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    });

    return (
      <Line
        color="gray"
        key={`ring-${i + 1}`}
        lineWidth={0.5}
        points={points}
      />
    );
  });

  const radialLines = Array.from({ length: segments }, (_, i) => {
    const angle = radialStep * i;
    const points = [
      new Vector3(0, 0, 0),
      new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
    ];

    return (
      <Line color="gray" key={`radial-${i}`} lineWidth={0.5} points={points} />
    );
  });

  return (
    <group ref={gridRef}>
      {ringsLines}
      {radialLines}
    </group>
  );
};

interface Ambulance3DProps {
  className?: string;
}

/**
 * Ambulance3D component to display a 3D model of an ambulance.
 * @param Ambulance3DProps The component props object.
 * @param Ambulance3DProps.className The class name for the component.
 */
function Ambulance3D({ className }: Ambulance3DProps) {
  const [ambulanceModel, setAmbulanceModel] = useState<Group | null>(null);
  const [progress, setProgress] = useState<number>(0); //loading progress
  const [isLoading, setIsLoading] = useState<boolean>(true); // loading bar visibility

  // Constants
  const scale = new Vector3(0.8, 0.8, 0.8);

  // Load ambulance model
  useEffect(() => {
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
        setProgress(percentageLoaded);
      },
      path: AMBULANCE_MODEL_PATH
    })
      .then(model => {
        setAmbulanceModel(model);
        setProgress(FULL_PROGRESS); //progress is set to 100 (when amb is loaded)
        setIsLoading(false); // Hide loading bar immediately after loading
      })
      .catch((error: unknown) => {
        console.error("Error loading Ambulance model:", error);
      });
  }, []);

  // Setup model
  useEffect(() => {
    if (!ambulanceModel) {
      return;
    }

    ThreeService.setScale(ambulanceModel, scale);
    ThreeService.setPosition(ambulanceModel, new Vector3(0, -0.6, 0));
    ThreeService.setRotation(ambulanceModel, new Euler(0, Math.PI / 2, 0));
  }, [ambulanceModel]);

  return (
    <div className="ambulance3d-container">
      {isLoading ? (
        //LoadingBar to display a progress bar while 3D Ambulance is loading.
        <div className="loading-bar-container">
          <div
            className="loading-bar"
            style={{ width: `${String(progress)}%` }}>
            <span className="loading-bar-text">
              Ambulance Model: {Math.round(progress)}%
            </span>
          </div>
        </div>
      ) : null}

      <Canvas
        camera={{ position: [0, 2, 10] }}
        className={className}
        gl={{ antialias: true }}
        id="ambulance3d-canvas">
        <Suspense fallback={null}>
          <ambientLight intensity={2} />
          <directionalLight intensity={1} position={new Vector3(1, 0, 1)} />
          <directionalLight intensity={1} position={new Vector3(-1, 0, -1)} />
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls
            dampingFactor={0.01}
            enablePan={false}
            enableZoom={false}
            maxDistance={5.2}
            maxPolarAngle={80 * (Math.PI / 180)}
            minDistance={5.2}
            minPolarAngle={80 * (Math.PI / 180)}
            panSpeed={0.3}
            rotateSpeed={0.3}
            target={new Vector3(0, 0, 0)}
            touches={{}}
          />
          <ThreeService.Model model={ambulanceModel} />
          <CircleGrid />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Ambulance3D;
