import type { AxiosRequestConfig } from "axios";

import type { Tag } from "../../types";
import AxiosService from "../axios/AxiosService";

const baseRoute = "/tags";

interface byKeywordParams {
  keyword?: string;
}

/**
 * Fetches tags based on a keyword search.
 *
 * This function makes a GET request to the `/tags` API endpoint and retrieves tags
 * that match the provided keyword(s).
 * @param byKeywordParams An object containing the keyword for the search.
 * @param byKeywordParams.keyword The keyword(s) to search for.
 * @returns The tags data (Tag[]) if successful, or an AxiosError or Error if the request fails.
 */
const byKeyword = async ({ keyword }: byKeywordParams): Promise<Tag[]> => {
  const queryParams: AxiosRequestConfig = {
    params: {
      keyword: keyword ? keyword.split(",").map(k => k.trim()) : []
    },

    /**
     * Serializes the query parameters for the request.
     * @param params The query parameters to serialize.
     */
    paramsSerializer: params => {
      const searchParams = new URLSearchParams();
      if (Array.isArray(params.keyword)) {
        searchParams.append(
          "keywords", // Changed from "keywords" to match the backend
          params.keyword.join(",").replace(/ /g, "_").toLowerCase()
        );
      }

      return searchParams.toString();
    }
  };

  return await AxiosService.GET<Tag[]>(baseRoute, queryParams);
};

const TagsService = {
  byKeyword
};

export default TagsService;
