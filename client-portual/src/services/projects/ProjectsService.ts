import type { AxiosRequestConfig } from "axios";

import AxiosService from "../axios/AxiosService";

const baseRoute = "/projects";

export interface SasTokenResponse {
  message: string;
}

/**
 * Gets the project SAS token from the projects route using the axios service.
 */
const getSasToken = async (): Promise<SasTokenResponse> => {
  // Send request
  return await AxiosService.GET<SasTokenResponse>(
    `${baseRoute}/projects-sas-token`
  );
};

interface DeleteResponse {
  message: string;
  success: boolean;
}

/**
 * Deletes a project from the projects route using the axios service.
 * @param {object} props An object containing the project ID to delete.
 * @param {string} props.id The ID of the project to delete.
 * @returns An object with `message: string` and `success: boolean` if successful, or an AxiosError/Error if failed.
 */
const deleteProject = async ({
  id
}: {
  id: string;
}): Promise<DeleteResponse> => {
  const queryParams: AxiosRequestConfig = {
    params: { id },

    /**
     * Serializes the query parameters for the request.
     * @param params The query parameters to serialize.
     */
    paramsSerializer: params => {
      const projectParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null) projectParams.append(key, String(value));
      });
      return projectParams.toString();
    }
  };
  return await AxiosService.DELETE<DeleteResponse>(baseRoute, queryParams);
};

interface UploadResponse {
  message: string;
  success: string;
}

/**
 *  This function makes a POST request to upload a project file to the server.
 * @param root0 The object containing the file and title.
 * @param root0.file The file that user is uploading.
 * @param root0.title The title of the project being created.
 */
const uploadProject = async ({
  file,
  title
}: {
  file: Blob;
  title: string;
}) => {
  const queryParams: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  };
  const formData = new FormData();

  // The server expects the file to be named "imageFile" and
  // the project object to be named "project" with name and description fields
  formData.append("imageFile", file);

  // Create project object and stringify it for the server
  const projectData = {
    description: "",
    name: title
  };

  // Server expects a "project" field containing a JSON string
  formData.append("project", JSON.stringify(projectData));

  const response = await AxiosService.POST<UploadResponse>(
    baseRoute,
    formData,
    queryParams
  );

  return response;
};

const ProjectService = {
  deleteProject,
  getSasToken,
  uploadProject
};

export default ProjectService;
