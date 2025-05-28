import { Canvas } from "@react-three/fiber";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  BoxGeometry,
  type Color,
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3
} from "three";

import ThreeService from "./ThreeService";

vi.mock("three-stdlib", () => {
  /**
   * Creates a mock group with a single mesh.
   */
  const createMockGroup = () => {
    const mockGroup = new Group();
    const mockMesh = new Mesh(new BoxGeometry(1, 1, 1));
    mockGroup.add(mockMesh);
    return mockGroup;
  };

  const mockLoader = vi.fn().mockReturnValue({
    load: vi
      .fn()
      .mockImplementation(
        (
          path: string,
          onLoad: (group: { scene: Group } | Group) => void,
          onProgress?: (event: ProgressEvent) => void,
          onError?: (error: ErrorEvent) => void
        ) => {
          if (path.endsWith(".txt")) {
            onError?.(
              new ErrorEvent("error", { message: "Unsupported file type" })
            );
            return;
          }

          if (onProgress) {
            const progressEvent = new ProgressEvent("progress", {
              lengthComputable: true,
              loaded: 50,
              total: 100
            });
            onProgress(progressEvent);
          }

          if (path.endsWith(".gltf") || path.endsWith(".glb")) {
            // GLTF files return an object with a scene property
            onLoad({ scene: createMockGroup() });
          } else {
            // FBX and OBJ files return a Group directly
            onLoad(createMockGroup());
          }
        }
      )
  });

  return {
    FBXLoader: mockLoader,
    GLTFLoader: mockLoader,
    OBJLoader: mockLoader
  };
});

vi.mock("@react-three/fiber", async () => {
  const actual = await vi.importActual("@react-three/fiber");
  return {
    ...actual,

    /**
     * Wraps the given React node in a Canvas provider for testing.
     * @param ReactNode The React node to wrap.
     * @param ReactNode.children The children to wrap.
     */
    Canvas: ({ children }: { children: ReactNode }) => <div>{children}</div>,

    /**
     * Mock useThree hook.
     */
    useThree: () => {
      const div = document.createElement("div");
      div.id = "model";

      return {
        scene: {
          /**
           * Adds the model to the scene as a child div.
           */
          add: () => {
            document.querySelector("div")?.appendChild(div);
          },

          /**
           * Removes the model from the scene.
           */
          remove: () => {
            document.getElementById("model")?.remove();
          }
        }
      };
    }
  };
});

describe("threeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("model", () => {
    describe("render", () => {
      test("should add model to scene", async () => {
        expect.assertions(1);

        const model = await ThreeService.loadModel({ path: "test.fbx" });

        const { container } = render(
          <Canvas>
            <ThreeService.Model model={model} />
          </Canvas>
        );

        // Check if model div is added
        expect(container.querySelector("#model")).toBeInTheDocument();
      });

      test("should remove model from scene", async () => {
        expect.assertions(1);

        const model = await ThreeService.loadModel({ path: "test.fbx" });

        const { container, unmount } = render(
          <Canvas>
            <ThreeService.Model model={model} />
          </Canvas>
        );

        // Unmount should remove the model
        unmount();

        expect(container.querySelector("#model")).not.toBeInTheDocument();
      });

      test("should return null if no model is provided", () => {
        expect.assertions(1);

        const { container } = render(
          <Canvas>
            <ThreeService.Model model={null} />
          </Canvas>
        );

        expect(container.querySelector("#model")).not.toBeInTheDocument();
      });
    });

    describe("loadModel", () => {
      test("should load an fbx model successfully", async () => {
        expect.assertions(3);

        const model = await ThreeService.loadModel({ path: "test.fbx" });

        expect(model).toBeInstanceOf(Group);
        expect(model.children).toHaveLength(1);
        expect(model.children[0]).toBeInstanceOf(Mesh);
      });

      test("should load a GLTF model and return its scene", async () => {
        expect.assertions(3);

        const model = await ThreeService.loadModel({ path: "test.gltf" });

        expect(model).toBeInstanceOf(Group);
        expect(model.children).toHaveLength(1);
        expect(model.children[0]).toBeInstanceOf(Mesh);
      });

      test("should load a GLB model and return its scene", async () => {
        expect.assertions(3);

        const model = await ThreeService.loadModel({ path: "test.glb" });

        expect(model).toBeInstanceOf(Group);
        expect(model.children).toHaveLength(1);
        expect(model.children[0]).toBeInstanceOf(Mesh);
      });

      test("should load an OBJ model successfully", async () => {
        expect.assertions(3);

        const model = await ThreeService.loadModel({ path: "test.obj" });

        expect(model).toBeInstanceOf(Group);
        expect(model.children).toHaveLength(1);
        expect(model.children[0]).toBeInstanceOf(Mesh);
      });

      test("should throw an error for unsupported file type", async () => {
        expect.assertions(1);

        vi.spyOn(console, "error").mockImplementation(() => {});

        await expect(
          ThreeService.loadModel({ path: "test.txt" })
        ).rejects.toBeInstanceOf(Error);
      });

      test("should handle progress callback", async () => {
        expect.assertions(1);

        const mockProgress = vi.fn();

        await ThreeService.loadModel({
          onProgress: mockProgress,
          path: "test.fbx"
        });

        expect(mockProgress).toHaveBeenCalledWith(expect.any(ProgressEvent));
      });

      test("should handle error when loading model", async () => {
        expect.assertions(2);

        const mockError = vi.fn();

        const modelPromise = ThreeService.loadModel({
          onError: mockError,
          path: "test.txt"
        });

        await expect(modelPromise).rejects.toBeInstanceOf(Error);
        expect(mockError).toHaveBeenCalledWith(expect.any(ErrorEvent));
      });
    });

    describe("setPosition", () => {
      test("should set position on a model", () => {
        expect.assertions(3);

        const group = new Group();
        const mesh = new Mesh();
        group.add(mesh);
        const position = new Vector3(1, 2, 3);

        ThreeService.setPosition(group, position);

        // Compare individual components and order instead of the whole object
        expect(group.position.x).toStrictEqual(position.x);
        expect(group.position.y).toStrictEqual(position.y);
        expect(group.position.z).toStrictEqual(position.z);
      });
    });

    describe("setRotation", () => {
      test("should set rotation on a model", () => {
        expect.assertions(3);

        const group = new Group();
        const mesh = new Mesh();
        group.add(mesh);
        const rotation = new Euler(1, 2, 3);

        ThreeService.setRotation(group, rotation);

        // Compare individual components and order instead of the whole object
        expect(group.rotation.x).toStrictEqual(rotation.x);
        expect(group.rotation.y).toStrictEqual(rotation.y);
        expect(group.rotation.z).toStrictEqual(rotation.z);
      });
    });

    describe("setScale", () => {
      test("should set scale on a model", () => {
        expect.assertions(3);

        const group = new Group();
        const mesh = new Mesh();
        group.add(mesh);
        const scale = new Vector3(1, 2, 3);

        ThreeService.setScale(group, scale);

        // Compare individual components and order instead of the whole object
        expect(group.scale.x).toStrictEqual(scale.x);
        expect(group.scale.y).toStrictEqual(scale.y);
        expect(group.scale.z).toStrictEqual(scale.z);
      });
    });

    describe("setColor", () => {
      test("should set color on a mesh", () => {
        expect.assertions(2);

        const mesh = new Mesh();
        const color = "#00ff00";

        ThreeService.setColor(mesh, color);

        const material = mesh.material as MeshStandardMaterial;

        expect(material).toBeDefined();
        expect(material.color.getHexString()).toStrictEqual(
          color.replace("#", "")
        );
      });

      test("should set color on a group", () => {
        expect.assertions(2);

        const group = new Group();
        const mesh = new Mesh();
        mesh.material = new MeshStandardMaterial();
        group.add(mesh);
        const color = "#00ff00";

        ThreeService.setColor(group, color);

        const firstChild = group.children[0] as Mesh;
        const material = firstChild.material as MeshStandardMaterial;

        expect(material).toBeDefined();
        expect(material.color.getHexString()).toStrictEqual(
          color.replace("#", "")
        );
      });

      test("should set color on an array of meshes", () => {
        expect.assertions(4);

        const group = new Group();
        const mesh1 = new Mesh();
        const mesh2 = new Mesh();
        group.add(mesh1, mesh2);
        const color = "#00ff00";

        ThreeService.setColor(group, color);

        const firstChild = group.children[0] as Mesh;
        const material1 = firstChild.material as MeshStandardMaterial;
        const secondChild = group.children[1] as Mesh;
        const material2 = secondChild.material as MeshStandardMaterial;

        expect(material1).toBeDefined();
        expect(material1.color.getHexString()).toStrictEqual(
          color.replace("#", "")
        );
        expect(material2).toBeDefined();
        expect(material2.color.getHexString()).toStrictEqual(
          color.replace("#", "")
        );
      });

      test("should set color on a mesh with multiple materials", () => {
        expect.assertions(3);

        const group = new Group();
        const mesh = new Mesh();
        const material1 = new MeshStandardMaterial();
        const material2 = new MeshStandardMaterial();
        mesh.material = [material1, material2];
        group.add(mesh);
        const color = "#00ff00";

        ThreeService.setColor(group, color);

        const firstChild = group.children[0] as Mesh;
        const materials = firstChild.material as MeshStandardMaterial[];

        expect(materials).toHaveLength(2);
        expect(materials[0].color.getHexString()).toStrictEqual(
          color.replace("#", "")
        );
        expect(materials[1].color.getHexString()).toStrictEqual(
          color.replace("#", "")
        );
      });
    });

    describe("rotateAround", () => {
      test("should rotate a mesh around X axis", () => {
        expect.assertions(3);

        const mesh = new Mesh();
        const pivot = new Vector3(1, 2, 3);
        const radius = 5;
        const angle = Math.PI / 2; // 90 degrees
        const axes = [ThreeService.RotationAxis.X];

        ThreeService.rotateAround(mesh, pivot, radius, angle, axes);

        // At 90 degrees rotation around X axis:
        // x = pivot.x (X rotation doesn't affect X coordinate)
        // y = pivot.y + radius * cos(90°) = pivot.y + radius * 0 = pivot.y
        // z = pivot.z + radius * sin(90°) = pivot.z + radius * 1 = pivot.z + radius
        expect(mesh.position.x).toBeCloseTo(pivot.x);
        expect(mesh.position.y).toBeCloseTo(pivot.y + radius * Math.cos(angle));
        expect(mesh.position.z).toBeCloseTo(pivot.z + radius * Math.sin(angle));
      });

      test("should rotate a mesh around Y axis", () => {
        expect.assertions(3);

        const mesh = new Mesh();
        const pivot = new Vector3(1, 2, 3);
        const radius = 5;
        const angle = Math.PI / 2; // 90 degrees
        const axes = [ThreeService.RotationAxis.Y];

        ThreeService.rotateAround(mesh, pivot, radius, angle, axes);

        // At 90 degrees rotation around Y axis:
        // x = pivot.x + radius * cos(90°) = pivot.x + radius * 0 = pivot.x
        // y = pivot.y (Y rotation doesn't affect Y coordinate)
        // z = pivot.z + radius * sin(90°) = pivot.z + radius * 1 = pivot.z + radius
        expect(mesh.position.x).toBeCloseTo(pivot.x + radius * Math.cos(angle));
        expect(mesh.position.y).toBeCloseTo(pivot.y);
        expect(mesh.position.z).toBeCloseTo(pivot.z + radius * Math.sin(angle));
      });

      test("should rotate a mesh around Z axis", () => {
        expect.assertions(3);

        const mesh = new Mesh();
        const pivot = new Vector3(1, 2, 3);
        const radius = 5;
        const angle = Math.PI / 2; // 90 degrees
        const axes = [ThreeService.RotationAxis.Z];

        ThreeService.rotateAround(mesh, pivot, radius, angle, axes);

        // At 90 degrees rotation around Z axis:
        // x = pivot.x + radius * cos(90°) = pivot.x + radius * 0 = pivot.x
        // y = pivot.y + radius * sin(90°) = pivot.y + radius * 1 = pivot.y + radius
        // z = pivot.z (Z rotation doesn't affect Z coordinate)
        expect(mesh.position.x).toBeCloseTo(pivot.x + radius * Math.cos(angle));
        expect(mesh.position.y).toBeCloseTo(pivot.y + radius * Math.sin(angle));
        expect(mesh.position.z).toBeCloseTo(pivot.z);
      });

      test("should rotate a mesh around X and Y axes", () => {
        expect.assertions(3);

        const mesh = new Mesh();
        const pivot = new Vector3(0, 0, 0);
        const radius = 5;
        const angle = Math.PI / 4; // 45 degrees
        const axes = [ThreeService.RotationAxis.X, ThreeService.RotationAxis.Y];

        ThreeService.rotateAround(mesh, pivot, radius, angle, axes);

        // For X and Y rotation combined:
        // Both X and Y contribute to the rotation, resulting in a combined movement
        expect(mesh.position.x).toBeCloseTo(radius * Math.cos(angle));
        expect(mesh.position.y).toBeCloseTo(radius * Math.cos(angle));
        expect(mesh.position.z).toBeCloseTo(radius * Math.sin(angle));
      });

      test("should rotate a mesh around X and Z axes", () => {
        expect.assertions(3);

        const mesh = new Mesh();
        const pivot = new Vector3(0, 0, 0);
        const radius = 5;
        const angle = Math.PI / 4; // 45 degrees
        const axes = [ThreeService.RotationAxis.X, ThreeService.RotationAxis.Z];

        ThreeService.rotateAround(mesh, pivot, radius, angle, axes);

        // For X and Z rotation combined:
        // Both X and Z contribute to the rotation, resulting in a combined movement
        expect(mesh.position.x).toBeCloseTo(radius * Math.cos(angle));
        expect(mesh.position.y).toBeCloseTo(radius * Math.sin(angle));
        expect(mesh.position.z).toBeCloseTo(radius * Math.cos(angle));
      });

      test("should rotate a mesh around Y and Z axes", () => {
        expect.assertions(3);

        const mesh = new Mesh();
        const pivot = new Vector3(0, 0, 0);
        const radius = 5;
        const angle = Math.PI / 4; // 45 degrees
        const axes = [ThreeService.RotationAxis.Y, ThreeService.RotationAxis.Z];

        ThreeService.rotateAround(mesh, pivot, radius, angle, axes);

        // For Y and Z rotation combined:
        // Both Y and Z contribute to the rotation, resulting in a combined movement
        expect(mesh.position.x).toBeCloseTo(radius * Math.sin(angle));
        expect(mesh.position.y).toBeCloseTo(radius * Math.cos(angle));
        expect(mesh.position.z).toBeCloseTo(radius * Math.cos(angle));
      });

      test("should rotate a mesh around all three axes", () => {
        expect.assertions(3);

        const mesh = new Mesh();
        const pivot = new Vector3(0, 0, 0);
        const radius = 5;
        const angle = Math.PI / 4; // 45 degrees
        const axes = [
          ThreeService.RotationAxis.X,
          ThreeService.RotationAxis.Y,
          ThreeService.RotationAxis.Z
        ];

        ThreeService.rotateAround(mesh, pivot, radius, angle, axes);

        // For all three axes combined:
        // Each axis contributes to the rotation equally
        expect(mesh.position.x).toBeCloseTo(radius * Math.cos(angle));
        expect(mesh.position.y).toBeCloseTo(radius * Math.cos(angle));
        expect(mesh.position.z).toBeCloseTo(radius * Math.sin(angle));
      });

      test("should rotate a group around all three axes", () => {
        expect.assertions(3);

        const group = new Group();
        const pivot = new Vector3(0, 0, 0);
        const radius = 5;
        const angle = Math.PI / 4; // 45 degrees
        const axes = [
          ThreeService.RotationAxis.X,
          ThreeService.RotationAxis.Y,
          ThreeService.RotationAxis.Z
        ];

        ThreeService.rotateAround(group, pivot, radius, angle, axes);

        // For all three axes combined:
        // Each axis contributes to the rotation equally
        expect(group.position.x).toBeCloseTo(radius * Math.cos(angle));
        expect(group.position.y).toBeCloseTo(radius * Math.cos(angle));
        expect(group.position.z).toBeCloseTo(radius * Math.sin(angle));
      });

      test("should handle lookAtTarget", () => {
        expect.assertions(1);

        const mesh = new Mesh();
        const pivot = new Vector3(0, 0, 0);
        const radius = 5;
        const angle = 0;
        const axes = [ThreeService.RotationAxis.Y];
        const lookAtTarget = new Vector3(10, 10, 10);

        const lookAtSpy = vi.spyOn(mesh, "lookAt");

        ThreeService.rotateAround(
          mesh,
          pivot,
          radius,
          angle,
          axes,
          lookAtTarget
        );

        expect(lookAtSpy).toHaveBeenCalledWith(lookAtTarget);
      });
    });

    describe("calculateDimensions", () => {
      test("should calculate dimensions of a mesh", () => {
        expect.assertions(4);

        // Create a mesh with specific dimensions
        const geometry = new BoxGeometry(2, 3, 4); // width: 2, height: 3, depth: 4
        const mesh = new Mesh(geometry);
        mesh.position.set(1, 1, 1); // Set center position

        const dimensions = ThreeService.calculateDimensions(mesh);

        // Size should be 2x3x4
        expect(dimensions.size.x).toStrictEqual(2);
        expect(dimensions.size.y).toStrictEqual(3);
        expect(dimensions.size.z).toStrictEqual(4);

        // Center should be at 1,1,1
        expect(dimensions.center).toStrictEqual(new Vector3(1, 1, 1));
      });
    });
  });

  describe("scene", () => {
    describe("createScene", () => {
      test("should create a scene with background color", () => {
        expect.assertions(2);

        const backgroundColor = "#ff0000";
        const scene = ThreeService.createScene(backgroundColor);

        expect(scene).toBeInstanceOf(Scene);
        expect((scene.background as Color).getHexString()).toStrictEqual(
          backgroundColor.replace("#", "")
        );
      });
    });

    describe("setBackgroundColor", () => {
      test("should set background color of a scene", () => {
        expect.assertions(2);

        const scene = new Scene();
        const backgroundColor = "#00ff00";

        ThreeService.setBackgroundColor(scene, backgroundColor);

        expect((scene.background as Color).getHexString()).toStrictEqual(
          backgroundColor.replace("#", "")
        );
        expect(scene.children).toHaveLength(0);
      });
    });

    describe("addAmbientLight", () => {
      test("should add ambient light with custom parameters", () => {
        expect.assertions(3);

        const scene = new Scene();
        const color = "#ff0000";
        const intensity = 0.8;
        const light = ThreeService.addAmbientLight(scene, color, intensity);

        expect(light.color.getHexString()).toStrictEqual(
          color.replace("#", "")
        );
        expect(light.intensity).toStrictEqual(intensity);
        expect(scene.children).toContain(light);
      });
    });

    describe("addDirectionalLight", () => {
      test("should add directional light with custom parameters", () => {
        expect.assertions(4);

        const scene = new Scene();
        const position = new Vector3(1, 2, 3);

        const color = "#00ff00";
        const intensity = 0.6;

        const light = ThreeService.addDirectionalLight(
          scene,
          color,
          intensity,
          position
        );

        expect(light.color.getHexString()).toStrictEqual(
          color.replace("#", "")
        );
        expect(light.intensity).toStrictEqual(intensity);
        expect(light.position).toStrictEqual(position);
        expect(scene.children).toContain(light);
      });
    });
  });

  describe("camera", () => {
    describe("createCamera", () => {
      test("should create perspective camera with custom parameters", () => {
        expect.assertions(5);

        const camera = ThreeService.createCamera(75, 1.5, 0.1, 1000);

        expect(camera).toBeInstanceOf(PerspectiveCamera);
        expect((camera as PerspectiveCamera).fov).toBe(75);
        expect((camera as PerspectiveCamera).aspect).toBe(1.5);
        expect((camera as PerspectiveCamera).near).toBe(0.1);
        expect((camera as PerspectiveCamera).far).toBe(1000);
      });

      test("should create orthographic camera with custom parameters", () => {
        expect.assertions(7);

        const camera = ThreeService.createCamera(75, 1.5, 0.1, 1000, true);

        expect(camera).toBeInstanceOf(OrthographicCamera);
        expect((camera as OrthographicCamera).left).toBe(-1.5);
        expect((camera as OrthographicCamera).right).toBe(1.5);
        expect((camera as OrthographicCamera).top).toBe(1);
        expect((camera as OrthographicCamera).bottom).toBe(-1);
        expect((camera as OrthographicCamera).near).toBe(0.1);
        expect((camera as OrthographicCamera).far).toBe(1000);
      });
    });

    describe("setCameraPosition", () => {
      test("should set camera position", () => {
        expect.assertions(3);

        const camera = ThreeService.createCamera(75, 1.5, 0.1, 1000);
        const position = new Vector3(1, 2, 3);

        ThreeService.setCameraPosition(camera, position);

        expect(camera.position.x).toBe(1);
        expect(camera.position.y).toBe(2);
        expect(camera.position.z).toBe(3);
      });
    });

    describe("setCameraRotation", () => {
      test("should set camera rotation", () => {
        expect.assertions(3);

        const camera = ThreeService.createCamera(75, 1.5, 0.1, 1000);
        const rotation = new Euler(0, Math.PI / 2, 0);

        ThreeService.setCameraRotation(camera, rotation);

        expect(camera.rotation.x).toBe(0);
        expect(camera.rotation.y).toBe(Math.PI / 2);
        expect(camera.rotation.z).toBe(0);
      });
    });

    describe("setLookAt", () => {
      test("should set camera look at target", () => {
        expect.assertions(3);

        const camera = ThreeService.createCamera(75, 1.5, 0.1, 1000);
        const target = new Vector3(1, 1, 1); // Look diagonally

        // Position camera at origin looking at negative Z (default)
        camera.position.set(0, 0, 0);
        camera.rotation.set(0, 0, 0);
        camera.updateMatrixWorld();

        ThreeService.setLookAt(camera, target);

        // Get normalized direction vector
        const direction = camera.getWorldDirection(new Vector3());
        const expectedDirection = target.clone().normalize();

        // Compare components individually with rounding
        expect(direction.x.toFixed(6)).toBe(expectedDirection.x.toFixed(6));
        expect(direction.y.toFixed(6)).toBe(expectedDirection.y.toFixed(6));
        expect(direction.z.toFixed(6)).toBe(expectedDirection.z.toFixed(6));
      });
    });

    describe("setCameraFov", () => {
      test("should set camera fov", () => {
        expect.assertions(1);

        const camera = ThreeService.createCamera(75, 1.5, 0.1, 1000);
        const fov = 60;

        ThreeService.setCameraFov(camera, fov);

        expect((camera as PerspectiveCamera).fov).toStrictEqual(60);
      });
    });
  });
});
