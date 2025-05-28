import AxiosService from "../axios/AxiosService";

const baseRoute = "/category";

export interface SasTokenResponse {
  message: string;
}

/**
 * Gets the category SAS token from the category route using the axios service.
 */
const getSasToken = async (): Promise<SasTokenResponse> => {
  // Send request
  return await AxiosService.GET<SasTokenResponse>(
    `${baseRoute}/category-sas-token`
  );
};

const CategoryService = {
  getSasToken
};

export default CategoryService;
