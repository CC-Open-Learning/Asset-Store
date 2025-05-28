import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

import AxiosService from "../axios/AxiosService";

const baseRoute = "/asset";

interface SasTokenResponse {
  message: string;
}

/**
 * Gets a SAS token for displaying assets previews.
 */
const getSasToken = async (): Promise<SasTokenResponse> => {
  // Send request
  return await AxiosService.GET<SasTokenResponse>(
    `${baseRoute}/asset-sas-token`
  );
};
export interface DownloadResponse {
  message: string;
  url: string;
}

interface UploadResponse {
  message: string;
  success: string;
}

/**
 * Gets the full URL of the asset to enable downloading the asset.
 * Makes a GET request to the backend with the specified asset ID.
 * @param {object} params The parameters object.
 * @param {string} params.id The ID of the asset to download.
 * @returns A promise that resolves to a DownloadResponse containing the asset download info.
 */
const getAssetUrl = async ({
  id
}: {
  id: string;
}): Promise<DownloadResponse> => {
  const queryParams: AxiosRequestConfig = {
    params: {
      id
    },

    /**
     * Serializes the query parameters for the request.
     * @param params The query parameters to serialize.
     */
    paramsSerializer: params => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null) searchParams.append(key, String(value));
      });
      return searchParams.toString();
    }
  };
  return await AxiosService.GET<DownloadResponse>(
    `${baseRoute}/download`,
    queryParams
  );
};

/**
 * Upload Asset to the blob storage and stores the metadata to the database.
 * Makes a GET request to the backend with the specified asset ID.
 * @param UploadResponse Interface for the return value.
 * @param UploadResponse.assetObject Object for uploading.
 * @returns A promise that resolves to a DownloadResponse containing the asset download information.
 */
const uploadAsset = async ({
  assetObject
}: {
  assetObject: FormData;
}): Promise<UploadResponse> => {
  return await AxiosService.POST<UploadResponse>(baseRoute, assetObject, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export interface DeleteResponse {
  message: string;
  success: boolean;
}

/**
 * Deletes an asset from the database.
 * @param {object} params The parameters object.
 * @param {string} params.id The ID of the asset to delete.
 * @returns A promise that resolves to a DeleteResponse containing the deletion info.
 */
const deleteAsset = async ({ id }: { id: string }): Promise<DeleteResponse> => {
  const queryParams: AxiosRequestConfig = {
    params: {
      id
    },

    /**
     * Serializes the query parameters for the request.
     * @param params The query parameters to serialize.
     */
    paramsSerializer: params => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null) searchParams.append(key, String(value));
      });
      return searchParams.toString();
    }
  };
  return await AxiosService.DELETE<DeleteResponse>(baseRoute, queryParams);
};

const AssetService = {
  deleteAsset,
  getAssetUrl,
  getSasToken,
  uploadAsset
};

export default AssetService;
