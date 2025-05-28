import type { SasTokenResponse } from "../ProjectsService";

// Mock implementation of getSasToken
export const getSasTokenMock = jest.fn<Promise<SasTokenResponse>, []>();

// Mocked ProjectService
const MockedProjectService = {
  getSasToken: getSasTokenMock
};

export default MockedProjectService;
