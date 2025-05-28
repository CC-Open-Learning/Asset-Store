// Src/services/search/__mocks__/SearchService.ts
import type { Asset, Project } from "../../../types";

// Mock implementations with correct return types
export const byKeywordMock = jest.fn<
  Promise<Asset[]>,
  [{ keyword?: string }]
>();

export const byIdMock = jest.fn<Promise<Asset>, [{ id: string }]>();

export const getAllProjectsMock = jest.fn<Promise<Project[]>, []>();

// Create the mocked SearchService
export const MockedSearchService = {
  byId: byIdMock,
  byKeyword: byKeywordMock,
  getAllProjects: getAllProjectsMock
};

export default MockedSearchService;
