import { useEffect, useRef, useState } from "react";

import Icons from "../../../../assets/icons/Icons";
import useAlert from "../../../../hooks/alert/useAlert";
import AssetService from "../../../../services/asset/AssetService";
import SearchService from "../../../../services/search/SearchService";
import TagsService from "../../../../services/tags/TagsService";
import UtilService from "../../../../services/util/UtilService";
import { AlertType } from "../../../../store/contexts/alert/AlertContext";
import type { Model, Project, Tag } from "../../../../types";

/**
 * This function is for the upload asset page.
 */
export default function UploadAsset() {
  const [isOpen, setIsOpen] = useState(false);

  const [modelSpecs, setModelSpecs] = useState(false);
  const [triangles, setTriangles] = useState<number | string>(0);
  const [polygons, setPolygons] = useState<number | string>(0);
  const [vertices, setVertices] = useState<number | string>(0);
  const [rigType, setRigType] = useState<string>("NONE");

  const [title, setTitle] = useState<string>("");
  const [mainFile, setMainFile] = useState<File>();
  const [previewImage, setPreviewImage] = useState<File[] | null>(null);
  const [description, setDescription] = useState<string>("");
  const [project, setProject] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [proj, setProj] = useState<Project[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const allowedExtensionsMainFile = [
    "fbx",
    "glb",
    "dae",
    "obj",
    "zip",
    "png",
    "jpeg",
    "jpg",
    "tiff",
    "tga",
    "webp",
    "blend",
    "ma",
    "mb",
    "psd",
    "spp",
    "mp4",
    "mp3"
  ];

  const allowedExtensionsPreviewImage = ["jpg", "jpeg", "png", "webp"];

  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [errorMessagePreview, setErrorMessagePreview] = useState<null | string>(
    null
  );
  const { addAlert } = useAlert();

  const [tagSearchValue, setTagSearchValue] = useState("");

  /**
   * This function checks if the tag is valid.
   * It only allows lowercase letters.
   * @param tag The tag to be validated.
   * @returns {boolean} True if the tag is valid, false otherwise.
   */
  const isValidTag = (tag: string): boolean => {
    // Only allow lowercase letters
    const tagRegex = /^[a-z]+$/;
    return tagRegex.test(tag);
  };

  /**
   *This function gets the all the projects using the SearchService.
   */
  const getProjects = async () => {
    //Call the search service to get assets
    const result = await SearchService.getAllProjects();
    if (Array.isArray(result)) {
      setProj(result);
    }
  };
  useEffect(() => {
    getProjects().catch((error: unknown) => {
      console.error("Error fetching Projects:", error);
    });
  }, []);

  useEffect(() => {
    /**
     *  This function handles the click event outside the search container.
     *  If the click is outside the search container, it hides the suggestions.
     * @param event The mouse event.
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   *  This function handles the input change event for the tag input field.
   * It fetches tag suggestions based on the input value and updates the state.
   * @param event The change event.
   */
  const handleTagInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase(); // Force lowercase
    setTagSearchValue(value);

    if (value.length > 0) {
      // Show error if user types invalid characters
      if (!isValidTag(value)) {
        addAlert?.({
          alertMessage:
            "Tags can only contain lowercase letters, no spaces or special characters",
          alertType: AlertType.Error
        });
      }

      const suggestions = await TagsService.byKeyword({ keyword: value });
      setTagSuggestions(suggestions.filter(tag => !tags.includes(tag.name)));
      setShowSuggestions(true);
    } else {
      setTagSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * To change the title.
   * @param event React.ChangeEvent.
   */
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //set the new title
    setTitle(event.target.value);
  };

  /**
   * To change the main file to be uploaded.
   * @param event React.ChangeEvent.
   */
  const handleMainFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Validate the file
    if (event.target.files) {
      const [file] = event.target.files;
      const retValue = UtilService.validateFile(
        file,
        allowedExtensionsMainFile,
        1
      );

      if (retValue.isValid) {
        // Set the new main file
        setMainFile(file);
        setErrorMessage(null); // Clear error message if validation is successful

        // Check if the file extension is .zip and set model specs to true
        if (file.name.endsWith(".zip")) {
          setModelSpecs(true); // Set model specs to true if file is a .zip
        } else {
          setModelSpecs(false); // Set model specs to true if file is a .zip
        }
      } else if (retValue.message) {
        setErrorMessage(retValue.message); // Set the error message if validation fails
      }
    }

    event.target.value = ""; // Reset input
  };

  /**
   * To change the previewImages to be uploaded.
   * @param event React.ChangeEvent.
   */
  const handlePreviewImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    //Check the number of image
    if (previewImage?.length === 10) {
      setErrorMessagePreview("Maximum number of files exceeded (10)");
      return;
    }
    setErrorMessagePreview(null);

    const { files } = event.target;

    if (!files) {
      setPreviewImage([]);
      event.target.value = ""; // Reset input
      return;
    }
    //validate the file
    const newFilesArray = Array.from(files);
    const validationResult = UtilService.validateFile(
      newFilesArray,
      allowedExtensionsPreviewImage,
      10,
      50
    );

    if (!validationResult.isValid) {
      setErrorMessagePreview(
        validationResult.message ?? "Invalid files selected"
      );
      event.target.value = ""; // Reset input
      return;
    }
    //proceed and add the new image to the array of files
    setPreviewImage(prev => {
      const existingFiles = Array.isArray(prev) ? prev : [];
      const filteredFiles = newFilesArray.filter(
        file =>
          !existingFiles.some(existingFile => existingFile.name === file.name)
      );

      return [...existingFiles, ...filteredFiles];
    });

    event.target.value = ""; // Reset input
  };

  /**
   * To change the description to be uploaded.
   * @param event React.ChangeEvent.
   */
  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    //set the new description
    setDescription(event.target.value);
  };

  /**
   * To change the triangles input.
   * @param event React.ChangeEvent.
   */
  const handleTrianglesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTriangles(event.target.value);
  };

  /**
   * To change the polygons input.
   * @param event React.ChangeEvent.
   */
  const handlePolygonsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPolygons(event.target.value);
  };

  /**
   * To change the vertices input.
   * @param event React.ChangeEvent.
   */
  const handleVerticesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVertices(event.target.value);
  };

  /**
   * To change the rigType input.
   * @param event React.ChangeEvent.
   */
  const handleRigTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRigType(event.target.value);
  };

  /**
   * Clear all states.
   */
  const clearStates = () => {
    setTriangles(0);
    setPolygons(0);
    setVertices(0);
    setRigType("NONE");
    setTitle("");
    setMainFile(undefined);
    setPreviewImage(null);
    setDescription("");
    setTags([]);
    setProject([]);
    setModelSpecs(false);
    setIsOpen(false);
  };

  /**
   * Upload a new asset
   * Form the upload data and use the upload service to pass the FormData.
   */
  const uploadAsset = async () => {
    try {
      // Input checks
      if (!title) {
        addAlert?.({
          alertMessage: "Title is required",
          alertType: AlertType.Error
        });
        return;
      }

      if (!mainFile) {
        addAlert?.({
          alertMessage: "Main File is required",
          alertType: AlertType.Error
        });
        return;
      }
      if (modelSpecs && (!vertices || !triangles || !polygons || !rigType)) {
        addAlert?.({
          alertMessage: "Model Specifications required",
          alertType: AlertType.Error
        });
        return;
      }

      // Compose the model object
      const model: Model = {
        animationCount: 0,
        edges: 0,
        lodCount: 0,
        polygons: Number(polygons),
        rigType,
        textureCount: 0,
        triCount: Number(triangles),
        vertices: Number(vertices)
      };

      const formData = new FormData();

      // Append the main file
      formData.append("mainFile", mainFile);

      // Append each preview image file
      if (previewImage && previewImage.length > 0) {
        previewImage.forEach(file => {
          formData.append("previewImages", file); // Correctly append each file
        });
      }

      // Append additional metadata
      formData.append("name", title);
      formData.append("description", description);
      formData.append("projects", JSON.stringify(project)); // Pass array as JSON
      formData.append("tags", JSON.stringify(tags)); // Pass array as JSON

      // Append the model object as JSON
      formData.append("model", JSON.stringify(model));
      addAlert?.({
        alertMessage: "Uploading Asset....",
        alertType: AlertType.Success
      });

      // Call the service to upload the asset
      const response = await AssetService.uploadAsset({
        assetObject: formData
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      // Success
      addAlert?.({
        alertMessage: "Asset uploaded successfully!",
        alertType: AlertType.Success
      });
      clearStates();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (error as any).message
      ) {
        const messageError = (error as { message: string }).message;

        addAlert?.({
          alertMessage: messageError,
          alertType: AlertType.Error
        });
      } else {
        // Handle unexpected error structures
        addAlert?.({
          alertMessage: "An unexpected error occurred",
          alertType: AlertType.Error
        });
      }
    }
  };

  /**
   * This function adds a data to the list.
   * @param list List of string to be displayed.
   * @param value Value the will be added to the list.
   */
  const addToList = (list: string, value: string) => {
    if (list === "tag") {
      const sanitizedTag = value.toLowerCase();
      if (!isValidTag(sanitizedTag)) {
        addAlert?.({
          alertMessage:
            "Tags can only contain lowercase letters, no spaces or special characters",
          alertType: AlertType.Error
        });
        return;
      }

      setTags(prev => {
        if (!prev.includes(sanitizedTag)) {
          return [...prev, sanitizedTag];
        }
        return prev;
      });
    } else if (list === "project") {
      const trimmedValue = value.trim(); // Remove leading and trailing spaces

      setProject(prev => {
        if (!prev.includes(trimmedValue)) {
          return [...prev, trimmedValue];
        }
        return prev;
      });
    }
  };

  /**
   * This function removes a string to the list.
   * @param list List of string.
   * @param name Name to be removed.
   */
  const removeFromList = (list: string, name: string) => {
    if (list === "project") {
      setProject(prev => prev.filter(item => item !== name));
    } else if (list === "tag") {
      setTags(prev => prev.filter(item => item !== name));
    } else if (list === "mainFile") {
      setMainFile((prev: File | undefined) =>
        prev?.name === name ? undefined : prev
      );
      setModelSpecs(false);
      setIsOpen(false);

      setTriangles(0);
      setPolygons(0);
      setVertices(0);
      setRigType("NONE");
    } else if (list === "previewImage") {
      setPreviewImage((prev: File[] | null) =>
        prev?.some(file => file.name === name) ? [] : prev
      );
    }
  };

  return (
    <div className="flex size-full flex-col p-5" id="upload-asset">
      <div className="flex size-full flex-col items-center justify-center">
        <div className="formDiv">
          <h1 className="text-center text-5xl font-bold text-yellow-80 md:text-2xl">
            Upload an Asset
          </h1>
        </div>
        <div className="formDiv">
          <label className="formLabel" htmlFor="title">
            Title
          </label>
          <input
            className="formInput"
            id="title"
            onChange={handleTitleChange}
            placeholder="Enter name"
            type="text"
            value={title}
          />
        </div>
        <div className="formDiv">
          <label className="formLabel" htmlFor="mainFile">
            Main File
          </label>
          <div className="w-full flex-col items-center justify-center md:w-2/3">
            <label
              className="flex h-60 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-general-10 bg-general-40 md:h-40 md:w-full"
              htmlFor="main-file">
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                {Icons.DropDownIcon}
                <div className="mb-2 text-2xl font-semibold text-general-10 md:text-sm">
                  <p className="text-center text-yellow-80">Browse to Upload</p>
                </div>
              </div>
              <input
                className="hidden"
                id="main-file"
                onChange={handleMainFileChange}
                type="file"
              />
            </label>
            <div className="flex-col py-2 text-xl text-general-50 md:flex md:flex-row md:justify-between md:text-xs">
              <p>Supported formats: zip, png, jpeg, mp4, mp3</p>
            </div>
            {errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : null}
            {/* Display error message */}
            {mainFile ? (
              <div className="flex-col">
                <div>
                  <div className="flex flex-nowrap">
                    <span className="file-name m-1.5 rounded-full bg-general-40 px-3 text-white">
                      {mainFile?.name} (
                      {UtilService.formatBytes(mainFile?.size)})
                      <button
                        className="ml-2 h-[70%] rounded-full bg-yellow-80 px-1.5 pb-1.5 leading-none text-general-10"
                        onClick={() => {
                          removeFromList("mainFile", mainFile.name);
                        }}
                        type="button">
                        x
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {modelSpecs ? (
          <div className="formDiv" id="model-specs">
            <label className="formLabel" />
            <div className="w-full md:w-1/2">
              <button
                className="flex w-full items-center justify-between rounded-md bg-general-40 px-4 py-2 text-left text-white"
                onClick={() => {
                  setIsOpen(!isOpen);
                }}
                type="button">
                <span>Model Specs</span>
                <span className="text-yellow-70">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen ? (
                <div className="mt-2 rounded-md bg-general-40 p-4 shadow-md">
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium text-general-10"
                      htmlFor="triangles">
                      Triangles
                    </label>
                    <input
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-general-90 shadow-sm focus:border-yellow-70 focus:outline-none focus:ring-yellow-80"
                      id="triangles"
                      onChange={handleTrianglesChange}
                      type="number"
                      value={triangles}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium text-general-10"
                      htmlFor="vertices">
                      Vertices
                    </label>
                    <input
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-general-90 shadow-sm focus:border-yellow-70 focus:outline-none focus:ring-yellow-80"
                      id="vertices"
                      onChange={handleVerticesChange}
                      type="number"
                      value={vertices}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium text-general-10"
                      htmlFor="polygons">
                      Polygons
                    </label>
                    <input
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-general-90 shadow-sm focus:border-yellow-70 focus:outline-none focus:ring-yellow-80"
                      id="polygons"
                      onChange={handlePolygonsChange}
                      type="number"
                      value={polygons}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-general-10"
                      htmlFor="rigType">
                      Rig Type
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-general-90 shadow-sm focus:border-yellow-70 focus:outline-none focus:ring-yellow-80"
                      id="rigType"
                      onChange={handleRigTypeChange}
                      value={rigType}>
                      <option value="NONE">NONE</option>
                      <option value="IK">IK</option>
                      <option value="FK">FK</option>
                    </select>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="formDiv">
          <label className="formLabel" htmlFor="previewImage">
            Preview Images
          </label>
          <div className="w-full flex-col items-center justify-center md:w-2/3">
            <label
              className="flex h-60 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-general-10 bg-general-40 md:h-40 md:w-full"
              htmlFor="previewImage">
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                {Icons.DropDownIcon}
                <div className="mb-2 text-2xl font-semibold text-general-10 md:text-sm">
                  <p className="text-center text-yellow-80">Browse to Upload</p>
                </div>
              </div>
              <input
                className="hidden"
                id="previewImage"
                onChange={handlePreviewImageChange}
                type="file"
              />
            </label>
            <div className="flex-col py-2 text-xl text-general-50 md:flex md:flex-row md:justify-between md:text-xs">
              <p>Supported formats: png, jpeg, jpg, webp</p>
            </div>
            {errorMessagePreview ? (
              <p className="text-red-500">{errorMessagePreview}</p>
            ) : null}{" "}
            <div className="flex-col">
              <div>
                {previewImage?.map(preview => (
                  <div className="flex flex-nowrap" key={preview.name}>
                    <span className="m-1.5 rounded-full bg-general-40 px-3 text-white">
                      {preview.name} ({UtilService.formatBytes(preview.size)})
                      <button
                        className="ml-2 h-[70%] rounded-full bg-yellow-80 px-1.5 pb-1.5 leading-none text-general-10"
                        onClick={() => {
                          removeFromList("previewImage", preview.name);
                        }}
                        type="button">
                        x
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="formDiv">
          <label className="formLabel" htmlFor="description">
            Description
          </label>
          <textarea
            className="formInput"
            cols={2}
            id="description"
            name="description"
            onChange={handleDescriptionChange}
            rows={2}
            value={description}
          />
        </div>
        <div className="formDiv">
          <label className="formLabel" htmlFor="Project">
            Project
          </label>
          <div className="flex w-full flex-col md:w-1/2">
            <div className="flex w-full gap-2">
              <select
                className="formInput w-full"
                id="Project"
                onChange={e => {
                  addToList("project", e.target.value);
                }}>
                <option disabled selected value="">
                  Select a project
                </option>
                {proj.map(projectList => (
                  <option key={projectList.name} value={projectList.name}>
                    {projectList.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Display selected projects */}
            <div className="mt-2 flex flex-wrap gap-2">
              {project.map(projectList => (
                <span
                  className="inline-flex items-center rounded-full bg-general-40 px-3 py-1 text-white"
                  id="project-list"
                  key={projectList}>
                  <span className="project-name">{projectList}</span>
                  <button
                    className="active:bg-yellow-60 ml-2 h-[70%] rounded-full bg-yellow-80 px-1.5 pb-1.5 leading-none text-general-10 transition-all duration-200 hover:bg-yellow-70 hover:text-white"
                    onClick={() => {
                      removeFromList("project", projectList);
                    }}
                    type="button">
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="formDiv">
          <label className="formLabel" htmlFor="tags">
            Tags
          </label>
          <div className="flex w-full flex-col md:w-1/2">
            <div className="flex w-full">
              {/* Search existing tags input */}
              <div className="relative w-full" ref={searchContainerRef}>
                <input
                  className="formInput w-full"
                  id="tag-search"
                  onChange={e => void handleTagInput(e)}
                  onFocus={() => {
                    if (tagSearchValue && tagSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Search or create tags"
                  type="text"
                  value={tagSearchValue}
                />
                {/* Tag suggestions dropdown */}
                {showSuggestions && tagSearchValue.length > 0 ? (
                  <div className="absolute inset-x-0 z-10 mt-1 rounded-md border border-general-40 bg-general-90">
                    <ul className="max-h-60 overflow-auto py-1">
                      {!tagSuggestions.some(
                        tag =>
                          tag.name.toLowerCase() ===
                          tagSearchValue.toLowerCase()
                      ) &&
                        tagSearchValue.length > 0 && (
                          <li
                            className="tag-suggestion cursor-pointer px-4 py-2 text-white hover:bg-general-40"
                            onClick={() => {
                              const sanitizedTag = tagSearchValue.toLowerCase();
                              if (!isValidTag(sanitizedTag)) {
                                addAlert?.({
                                  alertMessage:
                                    "Tags can only contain lowercase letters, no spaces or special characters",
                                  alertType: AlertType.Error
                                });
                                return;
                              }

                              if (!tags.includes(sanitizedTag)) {
                                addToList("tag", sanitizedTag);
                              }
                              setTagSearchValue("");
                              setShowSuggestions(false);
                            }}>
                            {`Create '${tagSearchValue.toLowerCase()}'`}
                          </li>
                        )}
                      {tagSuggestions.map(tag => (
                        <li
                          className="tag-suggestion cursor-pointer px-4 py-2 text-white hover:bg-general-40"
                          key={tag._id.toString()}
                          onClick={() => {
                            if (!tags.includes(tag.name)) {
                              addToList("tag", tag.name);
                            }
                            setTagSuggestions(prev =>
                              prev.filter(t => t._id !== tag._id)
                            );
                            setShowSuggestions(false);
                            setTagSearchValue("");
                          }}>
                          {tag.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Display selected tags */}
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map(tagList => (
                <span
                  className="tag-item inline-flex items-center rounded-full bg-general-40 px-3 py-1 text-general-10"
                  id="tag-list"
                  key={tagList}>
                  {tagList}
                  <button
                    className="remove-tag-button active:bg-yellow-60 ml-2 h-[70%] rounded-full bg-yellow-80 px-1.5 pb-1.5 leading-none text-general-10 transition-all duration-200 hover:bg-yellow-70 hover:text-white"
                    onClick={() => {
                      removeFromList("tag", tagList);
                      // Re-run search to show removed tag in suggestions again
                      void handleTagInput({
                        target: { value: tagSearchValue }
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    type="button">
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16 flex justify-center">
          <button
            className="my-10 rounded-md bg-general-10 px-20 py-6 text-3xl font-bold text-yellow-70 md:my-5 md:px-16 md:py-[0.7rem] md:text-lg"
            id="submit-button"
            onClick={() => void uploadAsset()}
            type="button">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
