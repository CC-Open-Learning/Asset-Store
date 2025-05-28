// Src/hooks/sastoken/__mocks__/useSasToken.ts

import type { SasTokenContextType } from "../../../store/contexts/sastoken/SasTokenContext";

// Mock functions for fetching SAS tokens
export const mockFetchAssetSasToken = jest
  .fn()
  .mockResolvedValue("mock-asset-token");
export const mockFetchProjectSasToken = jest
  .fn()
  .mockResolvedValue("mock-project-token");

// Default mock context
export const defaultSasTokenContext: SasTokenContextType = {
  assetSasToken: "mock-asset-token",
  fetchAssetSasToken: mockFetchAssetSasToken,
  fetchProjectSasToken: mockFetchProjectSasToken,
  projectSasToken: "mock-project-token"
};

// Function to create a mock context with optional overrides

/**
 * @param overrides
 */
export const createSasTokenContextMock = (
  overrides: Partial<SasTokenContextType> = {}
): SasTokenContextType => {
  return { ...defaultSasTokenContext, ...overrides };
};

// Mock implementation of useSasToken
export const useSasToken = jest.fn().mockReturnValue(defaultSasTokenContext);
