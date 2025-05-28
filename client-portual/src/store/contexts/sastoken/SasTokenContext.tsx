import type { ReactNode } from "react";
import { createContext, useState } from "react";

import AssetService from "../../../services/asset/AssetService";
import CategoryService from "../../../services/category/CategoryService";
import ProjectService from "../../../services/projects/ProjectsService";

export interface SasTokenContextType {
  assetSasToken: string;
  categorySasToken: string;
  fetchAssetSasToken?: () => Promise<string>;
  fetchCategorySasToken?: () => Promise<string>;
  fetchProjectSasToken?: () => Promise<string>;
  projectSasToken: string;
}

// Creates the context with default values
export const SasTokenContext = createContext<SasTokenContextType>({
  assetSasToken: "",
  categorySasToken: "",
  fetchAssetSasToken: undefined,
  fetchCategorySasToken: undefined,
  fetchProjectSasToken: undefined,
  projectSasToken: ""
});

/**
 * Provider that wraps the application and provides the context.
 * @param ReactNode The children prop.
 * @param ReactNode.children The children components.
 */
export const SasTokenProvider = ({ children }: { children: ReactNode }) => {
  const [assetSasToken, setAssetSasToken] = useState<string>("");
  const [categorySasToken, setCategorySasToken] = useState<string>("");
  const [projectSasToken, setProjectSasToken] = useState<string>("");

  /**
   * Fetches a new asset SAS token dynamically.
   */
  const fetchAssetSasToken = async () => {
    try {
      const result = await AssetService.getSasToken();
      setAssetSasToken(result.message); // Update the context state
    } catch (error) {
      setAssetSasToken("");
      console.error("Error fetching Asset SAS token:", error);
    }
  };

  /**
   * Fetches a new project SAS token dynamically.
   */
  const fetchProjectSasToken = async () => {
    try {
      const result = await ProjectService.getSasToken();
      setProjectSasToken(result.message); // Update the context state
    } catch (error) {
      setProjectSasToken("");
      console.error("Error fetching Project SAS token:", error);
    }
  };

  /**
   * Fetches a new category SAS token dynamically.
   */
  const fetchCategorySasToken = async () => {
    try {
      const result = await CategoryService.getSasToken();
      setCategorySasToken(result.message); // Update the context state
      return result.message;
    } catch (error) {
      setCategorySasToken("");
      console.error("Error fetching Category SAS token:", error);
      throw error;
    }
  };

  return (
    <SasTokenContext.Provider
      value={{
        assetSasToken,
        categorySasToken,
        fetchAssetSasToken,
        fetchCategorySasToken,
        fetchProjectSasToken,
        projectSasToken
      }}>
      {children}
    </SasTokenContext.Provider>
  );
};
