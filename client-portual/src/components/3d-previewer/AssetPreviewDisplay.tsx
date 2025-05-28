import { PresentationControls, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Psd from "@webtoon/psd";
import axios from "axios";
import JSZip from "jszip";
import { useRef, useState } from "react";
import type { Group, MeshPhongMaterial, Object3D, Scene } from "three";
import {
  DataTexture,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
  Texture,
  TextureLoader,
  Vector3
} from "three";
import {
  ColladaLoader,
  FBXLoader,
  GLTFLoader,
  OBJLoader,
  TGALoader,
  TTFLoader
} from "three-stdlib";

import Icons from "../../assets/icons/Icons";
import {
  modelFormats,
  productionFormats,
  textureFormats
} from "../../fileFormats";
import AssetService from "../../services/asset/AssetService";
import type { Asset } from "../../types";
import Ground from "./sub-components/Ground";
import { nextAsset, prevAsset } from "./utils/AssetCycling";
import CanvasUtilities from "./utils/CanvasUtilities";

//Type Declarations --------------------------------------------------

type AssetType = Group | Psd | Scene | Texture;
type TextureType = Psd | Texture;
type LoaderType =
  | ColladaLoader
  | FBXLoader
  | GLTFLoader
  | null
  | OBJLoader
  | TextureLoader
  | TGALoader
  | TTFLoader;

type AssetPreviewDisplayProps = {
  asset?: Asset;
};

/**
 * This component is used to display a preview of an asset.
 * @param props The props for the AssetPreviewDisplay component.
 */
export default function AssetPreviewDisplay(props: AssetPreviewDisplayProps) {
  //Constant Declarations --------------------------------------------------

  //Incoming asset that is being previewed
  const { asset } = props;

  //References the Canvas that is using THREE.js
  const canvasReference = useRef<HTMLCanvasElement | null>(null);

  //This reference holds all the loaded assets.
  const assetListRef = useRef<AssetType[]>([]);

  //This reference is the currently asset from the asset list that is being displayed.
  const displayedAsset = useRef<AssetType>();

  //Contains all the loaded textures. These textures can also be found in assetListRef
  const loadedTextures = useRef<TextureType[]>([]);

  //This references the "missing texture" texture that gets uploaded.
  const missingTexture = useRef<Texture>();

  //This references the file extension found in the downloaded asset file (usually a .zip).
  const fileExtensionRef = useRef<string>("");

  //This boolean state flags when the download function has been called.
  const [hasCalledDownload, setHasCalledDownload] = useState(false);

  //This useState tracks the index for the asset that is displayed.
  const [currentAssetIndex, setCurrentAssetIndex] = useState<number>(0);

  //This boolean state flags when the asset has fully completed loading.
  const [isAssetLoaded, setIsAssetLoaded] = useState(false);

  const X_POSITION = 0;
  const Y_POSITION = 1;
  const Z_POSITION = -1.5;

  //This useState holds the position for the name label text in world space.
  const [fileNameLabelPosition, setFileNameLabelPosition] = useState<Vector3>(
    new Vector3(X_POSITION, Y_POSITION, Z_POSITION)
  );

  const FILE_NAME_LABEL_SCALE = 0.5;

  //This useState holds the scale for the name label text in world space.
  const [fileNameLabelScale, setFileNameLabelScale] = useState<Vector3>(
    new Vector3(
      FILE_NAME_LABEL_SCALE,
      FILE_NAME_LABEL_SCALE,
      FILE_NAME_LABEL_SCALE
    )
  );

  const EXTENSION_START_INDEX = 1;
  const SUBSTRING_START_INDEX = 0;
  const MIN_LIST_LENGTH = 1;

  const canvasStyle = "border-2 border-yellow-80 h-full w-full";

  const buttonStyle =
    "bg-yellow-80 border border-white rounded-lg absolute p-2 cursor-pointer bottom-2 z-10";

  const [assetList, setAssetList] = useState<AssetType[]>([]);

  //Define the order of processing.
  const fileCategories = [
    {
      extensions: ["jpeg", "jpg", "png", "psd", "tga", "tiff", "webp"],
      priority: 1
    },
    {
      extensions: ["dae", "fbx", "glb", "gltf", "obj"],
      priority: 2
    },
    {
      extensions: ["3ds", "blend", "ma", "max", "mb"],
      priority: 3
    }
  ];

  /**
   * This function takes a filename and returns the file extension of it.
   * @param filename The name of the file.
   * @returns The file extension of the file (e.g. "jpg", "png", "zip", etc.).
   */
  function getFileExtension(filename: string): string {
    return filename
      .substring(filename.lastIndexOf(".") + EXTENSION_START_INDEX)
      .toLowerCase();
  }

  /**
   * This gets called to download the main asset file.
   * @param filename The name of the asset file.
   * @param id The id of the asset file.
   */
  async function downloadAsset(filename: string, id?: string) {
    const { url } = await AssetService.getAssetUrl({ id: id! });

    const response = await axios.get(url, {
      responseType: "arraybuffer"
    });

    //The response is then converted into a blob.
    const downloadedAsset = new Blob([response.data]);

    //Get the file extension of the downloaded asset.
    fileExtensionRef.current = getFileExtension(filename);

    //Convert the newly created blob into a File object.
    const assetFile = new File([downloadedAsset], filename, {
      type: response.headers["content-type"]
    });

    //This is were we will be saving the unzipped content in the case of the downloaded asset being a zip file.
    let unzippedContent;

    //Boolean to flag if the downloaded asset is a zip file.
    let isSupportZipFile = false;

    //Try to unzip the file
    try {
      unzippedContent = await JSZip.loadAsync(assetFile);
      isSupportZipFile = true;
    } catch (e) {
      //The unzip failed. The item was not a zip file or an unsupported zip.
      console.log("Item is not a zip file.");
      console.log(`Error: ${String(e)}`);
    }

    //Condition checks if the item is a zip file.
    if (
      unzippedContent !== undefined &&
      isSupportZipFile &&
      fileExtensionRef.current === "zip"
    ) {
      for (const category of fileCategories) {
        for (const file of Object.keys(unzippedContent.files)) {
          const fileExtension = getFileExtension(file);

          if (category.extensions.includes(fileExtension)) {
            const unzippedItem =
              await unzippedContent.files[file].async("blob");
            const fileName = file.substring(
              file.lastIndexOf("/") + EXTENSION_START_INDEX
            );
            const fileItem = new File([unzippedItem], fileName, {
              type: response.headers["content-type"]
            });

            await parseAsset(fileItem);
          }
        }
      }

      setIsAssetLoaded(true);
    } else {
      //When the file is not a supported zip file.
      await parseAsset(assetFile);
      setIsAssetLoaded(true);
    }
  }

  /**
   * This function assigns a texture to a material based on the name of the texture.
   * The names are compared in a case-insensitive manner.
   * @param texture The texture object containing image data to be applied to the material.
   * @param mat The material object that will have the texture applied to it.
   * @param materialRenderType The type of material to assign the texture to. Examples include "mat", "mat_alpha", "mat_metal_roughness", etc.
   */
  const assignTextureToMaterial = (
    texture: Texture,
    mat: MeshStandardMaterial,
    materialRenderType: string
  ) => {
    const textureFullName = texture.name.toLowerCase();

    if (
      textureFullName.includes("colour") ||
      textureFullName.includes("color") ||
      textureFullName.includes("diffuse") ||
      textureFullName.includes("albedo")
    ) {
      if (texture instanceof Texture) {
        if (materialRenderType.includes("alpha")) {
          mat.transparent = true;
          mat.alphaMap = texture;
        }
        mat.map = texture;
      }
    } else if (
      textureFullName.includes("ao") &&
      materialRenderType.includes("mat")
    ) {
      if (texture instanceof Texture) mat.aoMap = texture;
    } else if (
      textureFullName.includes("metal") &&
      materialRenderType.includes("mat")
    ) {
      if (texture instanceof Texture) mat.metalnessMap = texture;
    } else if (
      textureFullName.includes("normal") &&
      materialRenderType.includes("mat")
    ) {
      if (texture instanceof Texture) mat.normalMap = texture;
    } else if (
      textureFullName.includes("rough") &&
      materialRenderType.includes("mat")
    ) {
      if (texture instanceof Texture) mat.roughnessMap = texture;
    } else if (
      textureFullName.includes("ms") &&
      materialRenderType.includes("mat")
    ) {
      if (texture instanceof Texture) {
        mat.roughnessMap = texture;
        mat.metalnessMap = texture;
      }
    } else if (
      textureFullName.includes("mro") &&
      materialRenderType.includes("mat")
    ) {
      if (texture instanceof Texture) {
        mat.roughnessMap = texture;
        mat.metalnessMap = texture;
        mat.aoMap = texture;
      }
    } else if (
      textureFullName.includes("emission") ||
      (textureFullName.includes("emissive") &&
        materialRenderType.includes("mat"))
    ) {
      if (texture instanceof Texture) mat.emissiveMap = texture;
    }
  };

  /**
   * Handles assigning textures to materials for a mesh.
   * @param obj The mesh to have its materials updated.
   */
  const handleMeshMaterials = (obj: Mesh) => {
    const materials = Array.isArray(obj.material)
      ? obj.material
      : [obj.material];
    const newMaterials: MeshStandardMaterial[] = [];

    materials.forEach((material: MeshPhongMaterial) => {
      const mat = new MeshStandardMaterial({ name: material.name });
      const materialRenderType = mat.name
        .substring(mat.name.lastIndexOf("_") + EXTENSION_START_INDEX)
        .toLowerCase();
      const materialName = mat.name
        .substring(SUBSTRING_START_INDEX, mat.name.lastIndexOf("_"))
        .toLowerCase();

      loadedTextures.current.forEach(texture => {
        const textureName = texture.name
          .substring(SUBSTRING_START_INDEX, texture.name.lastIndexOf("_"))
          .toLowerCase();
        if (textureName.includes(materialName)) {
          assignTextureToMaterial(texture, mat, materialRenderType);
        }
      });

      mat.needsUpdate = true;
      newMaterials.push(mat);
    });

    obj.material =
      newMaterials.length > MIN_LIST_LENGTH ? newMaterials : newMaterials[0];
  };

  /**
   * This is called when a downloaded file needs to be parsed.
   * @param mainFile The main file that needs to be parsed.
   */
  function parseAsset(mainFile: File) {
    //Ensure the file is valid.
    if (mainFile === null) return;

    const assetName = mainFile.name;
    const assetFileExtension = getFileExtension(assetName);
    const fileURL = URL.createObjectURL(mainFile);

    //This will hold the loader that is being used based on the file type/extension.
    let loader: LoaderType = null;

    /**
     * This function takes a url and loads a texture from it.
     * It determines which loader to use based on the file extension.
     * It then sets the asset as loaded.
     */
    const loadTexture = () => {
      switch (assetFileExtension) {
        case "jpeg":
        case "jpg":
        case "png":
        case "webp":
          loader = new TextureLoader();
          break;
        case "tga":
          loader = new TGALoader();
          break;
        case "tiff":
          loader = new TTFLoader();
          break;
        default:
          return;
      }

      loader?.load(
        fileURL,
        object => {
          object.name = mainFile.name;
          loadedTextures.current.push(object);

          URL.revokeObjectURL(fileURL);
          setIsAssetLoaded(true);
        },
        error => {
          console.log(error, "texture fail");
          URL.revokeObjectURL(fileURL);
        }
      );
    };

    /**
     * This function takes a url and loads a model from it.
     * It determines which loader to use based on the file extension.
     * It then sets the asset as loaded.
     * It also goes through all the meshes in the model and uses the handleMeshMaterials function to set the material.
     */
    const loadModel = () => {
      switch (assetFileExtension) {
        case "dae":
          loader = new ColladaLoader();
          break;
        case "fbx":
          loader = new FBXLoader();
          break;
        case "glb":
        case "gltf":
          loader = new GLTFLoader();
          break;
        case "obj":
          loader = new OBJLoader();
          break;
        default:
          return;
      }

      loader?.load(
        fileURL,
        object => {
          const newObject = "scene" in object ? object.scene : object;
          newObject.name = mainFile.name;

          if (!["glb", "gltf"].includes(assetFileExtension)) {
            newObject.traverse((obj: Object3D) => {
              if (obj instanceof Mesh) {
                handleMeshMaterials(obj);
              }
            });
          }

          setAssetList(prevList => {
            const updatedList = [...prevList, newObject];
            if (updatedList.length === MIN_LIST_LENGTH) setIsAssetLoaded(true);
            return updatedList;
          });

          URL.revokeObjectURL(fileURL);
          setIsAssetLoaded(true);
        },
        error => {
          console.log(error, "model fail");
          URL.revokeObjectURL(fileURL);
        }
      );
    };

    /**
     * This function takes a .psd file and loads it into a texture.
     * It reads the file using a FileReader, parses it using the Psd library.
     */
    const loadPsd = () => {
      const reader = new FileReader();

      /**
       * This function parses the file content into an ArrayBuffer and processes it as a PSD file.
       * @param e The event triggered by the FileReader.
       */
      reader.onload = e => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const psdFile = Psd.parse(arrayBuffer);
        void psdFile.composite(true, true).then(item => {
          const dataTexture = new DataTexture(
            item,
            psdFile.width,
            psdFile.height,
            RGBAFormat
          );
          dataTexture.wrapS = RepeatWrapping;
          dataTexture.repeat.y = -1;
          dataTexture.offset.y = 1;
          dataTexture.needsUpdate = true;

          assetListRef.current.push(dataTexture);
          loadedTextures.current.push(dataTexture);

          setIsAssetLoaded(true);
        });
      };
      reader.readAsArrayBuffer(mainFile);
    };

    //Handle different file formats.
    if (textureFormats.includes(assetFileExtension)) {
      loadTexture();
    } else if (modelFormats.includes(assetFileExtension)) {
      loadModel();
    } else if (productionFormats.includes(assetFileExtension)) {
      switch (assetFileExtension) {
        case "psd":
          loadPsd();
          break;
        // Handle other production formats here...
        default:
          break;
      }
    }
  }

  //Check if the download has been already called and the asset list can only have 0 or 1 items to start with.
  //The first item is a initializing empty placeholder.
  if (assetList.length < 2 && !hasCalledDownload) {
    //Load in the "missing texture" texture.
    new TextureLoader().load("./missingtexture.png", data => {
      missingTexture.current = data;
    });

    if (asset !== undefined) {
      downloadAsset(asset.fileName, asset._id?.toString());
      //Download has now been called.
      setHasCalledDownload(true);
    }
  }

  return (
    <div
      className={`${canvasStyle} relative row-span-2`}
      style={{
        height: "100%",
        width: "100%"
      }}>
      {!isAssetLoaded || assetList[currentAssetIndex] === undefined ? (
        <div className="flex size-full items-center justify-center">
          <div className="size-16 animate-spin rounded-full border-4 border-yellow-80 border-t-transparent" />
        </div>
      ) : (
        <>
          <Canvas
            //This is used to set the background color of the 3D world space.
            gl={{ antialias: true }}
            //On created gl - set the background color of the 3D world space.
            onCreated={({ gl }) => {
              //Setting clear color
              gl.setClearColor("#000000");
            }}
            ref={canvasReference}>
            {/* Lighting */}
            <ambientLight color="white" intensity={0.7} />
            <directionalLight
              color="white"
              intensity={2}
              position={[0, 10, 7]}
            />

            {/* Presentation Controls allow the user to look around all side of the object. */}
            <PresentationControls
              azimuth={[-Infinity, Infinity]} // Horizontal limits
              config={{ friction: 26, mass: 1, tension: 85 }} // Spring config
              cursor={true} // Whether to toggle cursor style on drag
              enabled={true} // The controls can be disabled by setting this to false
              global={true} // Spin globally or by dragging the model
              polar={[-0.65, Math.PI / 2]} // Vertical limits
              rotation={[0.5, 0, 0]} // Default rotation
              snap={false} // Snap-back to center (can also be a spring config)
              speed={2} // Speed factor
              touch-action="none"
              zoom={1} // Zoom factor when half the polar-max is reached
            >
              {/* Utilities */}
              <CanvasUtilities
                canvasReference={canvasReference}
                loadedModel={assetList[currentAssetIndex] as Object3D}
              />

              {isAssetLoaded && assetList[currentAssetIndex] ? (
                <primitive
                  object={assetList[currentAssetIndex]}
                  ref={displayedAsset}
                  visible={true}
                />
              ) : null}

              {Ground(true)}
              {
                // The name of the displayed asset.
                <Text
                  anchorX="center"
                  anchorY="middle"
                  color="white"
                  fontSize={1}
                  position={fileNameLabelPosition}
                  scale={fileNameLabelScale}>
                  {/* Display the name of the asset file and if none: then no preview text is displayed */}
                  {assetList[currentAssetIndex] !== undefined
                    ? assetList[currentAssetIndex].name
                    : "NO PREVIEW AVAILABLE"}
                </Text>
              }
            </PresentationControls>
          </Canvas>

          {assetList.length > MIN_LIST_LENGTH && (
            <>
              <button
                className={`${buttonStyle} right-2`}
                onClick={() => {
                  nextAsset(currentAssetIndex, setCurrentAssetIndex, assetList);
                }}
                type="button">
                {Icons.ArrowRight}
              </button>

              <button
                className={`${buttonStyle} left-2`}
                onClick={() => {
                  prevAsset(currentAssetIndex, setCurrentAssetIndex, assetList);
                }}
                type="button">
                {Icons.ArrowLeft}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
