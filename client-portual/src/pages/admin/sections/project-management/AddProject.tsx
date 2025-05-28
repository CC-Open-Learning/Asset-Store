import { useState } from "react";

import Icons from "../../../../assets/icons/Icons";
import useAlert from "../../../../hooks/alert/useAlert";
import ProjectService from "../../../../services/projects/ProjectsService";
import { AlertType } from "../../../../store/contexts/alert/AlertContext";

interface AddProjectProps {
  getProjects: () => Promise<void>;
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * This is Add Project Popup component which helps the admin to add project title and project thumbnail.
 * @param addProjectProps The callback function to get the projects and set the modal state and mutator
 * for opening and closing the modal.
 */
export default function AddProject(addProjectProps: AddProjectProps) {
  // Destructure the props
  const { getProjects, setModalState } = addProjectProps;

  // const imageRef = useRef<MutableRefObject<File | null>>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imageUrl, setImageUrl] = useState<null | string>(null);
  const { addAlert } = useAlert();
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [title, setTitle] = useState<string>("");

  /**
   * The handleChange function is triggered when the user selects a file.
   * It checks if the file is a valid webp image and sets the imageFile and imageUrl state variables accordingly.
   * @param e The event object containing the file input change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Revoke previous URL if it exists
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    const file = e.target.files?.[0];
    if (file && file.type === "image/webp") {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    } else {
      addAlert!({
        alertMessage: "Please upload a valid webp file.",
        alertType: AlertType.Error
      });
    }
  };

  /**
   * This function open a preview of the uploaded image in a new tab.
   */
  const openPreview = () => {
    if (imageUrl) {
      window.open(imageUrl, "_blank");
    }
  };

  /**
   * This function validates the form inputs before submission.
   */
  const validateForm = () => {
    if (title === "") {
      addAlert!({
        alertMessage: "Please enter a title.",
        alertType: AlertType.Error
      });
      return false;
    } else if (!imageFile) {
      addAlert!({
        alertMessage: "Please upload a thumbnail.",
        alertType: AlertType.Error
      });
      return false;
    }
    return true;
  };

  /**
   * This function handles the form submission.
   * It validates the form, uploads the project using ProjectService, and resets the form if successful.
   */
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await ProjectService.uploadProject({
          file: imageFile!,
          title
        });

        // Check the response
        if (response?.success) {
          addAlert!({
            alertMessage: "Project created successfully!",
            alertType: AlertType.Success
          });

          // Reset the form
          setTitle("");
          setImageFile(null);
          setIsImageUploaded(false);
          setModalState(false);
          URL.revokeObjectURL(imageUrl!);
        } else {
          throw new Error("Failed to create project");
        }
      } catch (error: unknown) {
        URL.revokeObjectURL(imageUrl!);
        addAlert!({
          alertMessage: "Error uploading project. Please try again.",
          alertType: AlertType.Error
        });
      }
    }
  };

  return (
    <div className="flex size-full flex-col p-5" id="add-project-popup">
      <form className="flex size-full flex-col items-center justify-center">
        <div className="formDiv">
          <h1 className="text-center text-5xl font-bold text-yellow-80 md:text-2xl">
            Create a Project
          </h1>
        </div>
        <div className="formDiv">
          <label className="formLabel" htmlFor="title">
            Title
          </label>
          <input
            className="w-full rounded-md bg-general-40 px-3 py-2 text-4xl md:w-2/3 md:py-1 md:text-lg"
            id="title"
            onChange={e => {
              setTitle(e.target.value);
            }}
            type="text"
          />
        </div>
        <div className="formDiv">
          <label
            aria-label="Thumbnail"
            className="formLabel"
            htmlFor="thumbnail">
            Thumbnail
          </label>
          <div className="w-full flex-col items-center justify-center md:w-2/3">
            <label
              className="flex h-60 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-general-10 bg-general-40 md:h-40 md:w-full"
              htmlFor="dropzone-file">
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                {Icons.DropDownIcon}
                <div className="mb-2 text-2xl font-semibold text-general-10 md:text-sm">
                  Drag & drop to upload
                  <p className="text-center text-yellow-80">or browse</p>
                </div>
              </div>

              {/* ------------------------- Thumbnail upload box ------------------------- */}
              <input
                accept="image/webp"
                className="hidden"
                id="dropzone-file" // Don't change this without changing the htmlFor for thumbnail label
                onChange={e => {
                  handleChange(e);
                }}
                type="file"
              />
            </label>
            <div className="flex justify-between">
              <p className="py-2 text-xl text-general-50 md:text-sm">
                Supported formats: webp
              </p>
              {imageUrl ? (
                <p
                  className="py-2 text-xl text-general-10 hover:cursor-pointer hover:text-yellow-80 md:text-sm"
                  onClick={openPreview}>
                  {imageFile?.name}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* ----------------------------- Create Button ---------------------------- */}
        <div className="formDiv flex justify-center">
          <button
            className="rounded-md bg-yellow-80 px-20 py-6 text-3xl text-general-10 md:px-16 md:py-1 md:text-[0.9rem]"
            onClick={e => {
              e.preventDefault();
              void handleSubmit().then(() => {
                setImageUrl(null);
                void getProjects();
              });
            }}
            type="submit">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
