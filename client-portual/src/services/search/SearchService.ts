import type { AxiosRequestConfig } from "axios";

import type { Asset, Category, Project } from "../../types";
import AxiosService from "../axios/AxiosService";

const baseRoute = "/search";

interface byKeywordParams {
  keyword?: string;
}

/**
 * Fetches assets based on a keyword search.
 *
 * This function makes a GET request to the `/search` API endpoint and retrieves assets
 * that match the provided keyword(s).
 * @param byKeywordParams An object containing the keyword for the search.
 * @param byKeywordParams.keyword The keyword(s) to search for.
 * @returns The assets data (Asset[]) if successful, or an AxiosError or Error if the request fails.
 */
const byKeyword = async ({ keyword }: byKeywordParams): Promise<Asset[]> => {
  const queryParams: AxiosRequestConfig = {
    params: {
      keyword: keyword ? keyword.split(",").map(k => k.trim()) : [],
      select: "_id name updatedAt"
    },

    /**
     * Serializes the query parameters for the request.
     * @param params The query parameters to serialize.
     */
    paramsSerializer: params => {
      // Use URLSearchParams to serialize the params object
      const searchParams = new URLSearchParams();
      if (Array.isArray(params.keyword)) {
        searchParams.append(
          "keywords",
          params.keyword.join(",").replace(/ /g, "_").toLowerCase()
        );
      }
      if (Array.isArray(params.select)) {
        searchParams.append("select", params.select.join(","));
      }
      return searchParams.toString();
    }
  };
  // Use AxiosService to make the GET request

  return await AxiosService.GET<Asset[]>(baseRoute, queryParams);
};

interface byIdParams {
  id: string;
}

/**
 * Fetches assets based on an asset ID.
 *
 * This function makes a GET request to the `/search/asset` API endpoint and retrieves assets
 * that match the provided ID.
 * @param byIdParams An object containing the asset ID for the search.
 * @param byIdParams.id The ID of the asset to search for.
 * @returns The assets data (Asset[]) if successful, or an AxiosError or Error if the request fails.
 */
const byId = async ({ id }: byIdParams): Promise<Asset> => {
  const queryParams: AxiosRequestConfig = {
    params: {
      _id: id
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
  return await AxiosService.GET<Asset>(`${baseRoute}/asset`, queryParams);
};

/**
 * Gets all of the projects from the projects route using the axios service.
 */
const getAllProjects = async (): Promise<Project[]> => {
  // Use AxiosService to make the GET request
  return await AxiosService.GET<Project[]>(`${baseRoute}/projects`);
};

/**
 * This function makes a GET request to the `/search/terms` API endpoint and retrieves an array of terms
 * that match the asset, project, category or tag.
 * @param root0 // An object containing the keyword for the search.
 * @param root0.keyword // The keyword(s) to search for.
 */
const byTerm = async ({ keyword }: { keyword?: string }): Promise<string[]> => {
  const queryParams: AxiosRequestConfig = {
    // Assigning keyword param to input for /terms route to receive it
    params: {
      input: keyword ? keyword.split(",").map(k => k.trim()) : []
    },

    /**
     * Serializes the query parameters for the request.
     * @param params The query parameters to serialize.
     */
    paramsSerializer: params => {
      // Use URLSearchParams to serialize the params object
      const searchParams = new URLSearchParams();
      if (Array.isArray(params.input)) {
        searchParams.append(
          "input",
          params.input.join(",").replace(/ /g, "_").toLowerCase()
        );
      }
      return searchParams.toString();
    }
  };
  return await AxiosService.GET<string[]>(`${baseRoute}/terms`, queryParams);
};

/**
 * Gets all of the categories from the projects route using the axios service.
 */
const getAllCategories = async (): Promise<Category[]> => {
  // Use AxiosService to make the GET request
  return await AxiosService.GET<Category[]>(`${baseRoute}/categories`);
};

const SearchService = {
  byId,
  byKeyword,
  byTerm,
  getAllCategories,
  getAllProjects
};

export default SearchService;
