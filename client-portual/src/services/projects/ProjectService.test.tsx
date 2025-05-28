import { describe, expect, test, vi } from "vitest";

import type { ErrorResponse } from "../axios/AxiosService";
import AxiosService from "../axios/AxiosService";
import ProjectsService from "./ProjectsService";
import type { SasTokenResponse } from "./ProjectsService";

// Mock AxiosService
vi.mock("../axios/AxiosService");

describe("projectsService", () => {
  describe("getSasToken", () => {
    test("should successfully retrieve SAS token", async () => {
      expect.assertions(2);

      const mockResponse: SasTokenResponse = {
        message: "SAS token retrieved successfully"
      };

      vi.mocked(AxiosService.GET).mockResolvedValueOnce(mockResponse);

      const response = await ProjectsService.getSasToken();

      expect(AxiosService.GET).toHaveBeenCalledWith(
        "/projects/projects-sas-token"
      );
      expect(response).toStrictEqual(mockResponse);
    });

    test("should handle error response", async () => {
      expect.assertions(2);

      const mockError: ErrorResponse = {
        message: "Failed to retrieve SAS token",
        success: false
      };

      vi.mocked(AxiosService.GET).mockResolvedValueOnce(mockError);

      const response = await ProjectsService.getSasToken();

      expect(AxiosService.GET).toHaveBeenCalledWith(
        "/projects/projects-sas-token"
      );
      expect(response).toStrictEqual(mockError);
    });
  });

  describe("deleteProject", () => {
    test("should make a DELETE request with correct query parameters", async () => {
      expect.assertions(2);

      const mockResponse = {
        message: "Project deleted successfully",
        success: true
      };
      const projectId = "123";

      vi.mocked(AxiosService.DELETE).mockResolvedValueOnce(mockResponse);

      const response = await ProjectsService.deleteProject({ id: projectId });

      expect(AxiosService.DELETE).toHaveBeenCalledWith("/projects", {
        params: { id: projectId },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        paramsSerializer: expect.any(Function)
      });
      expect(response).toStrictEqual(mockResponse);
    });

    test("should correctly serialize parameters", async () => {
      expect.assertions(1);

      const mockResponse = {
        message: "Project deleted successfully",
        success: true
      };
      const projectId = "123";

      vi.mocked(AxiosService.DELETE).mockResolvedValueOnce(mockResponse);

      await ProjectsService.deleteProject({ id: projectId });

      const [[url, config]] = vi.mocked(AxiosService.DELETE).mock.calls;
      const serializer = config?.paramsSerializer;
      const serializedParams =
        typeof serializer === "function" ? serializer({ id: projectId }) : null;

      expect(serializedParams).toBe("id=123");
    });

    test("should handle error response", async () => {
      expect.assertions(2);

      const mockError: ErrorResponse = {
        message: "Project not found",
        success: false
      };
      const projectId = "123";

      vi.mocked(AxiosService.DELETE).mockResolvedValueOnce(mockError);

      const response = await ProjectsService.deleteProject({ id: projectId });

      expect(AxiosService.DELETE).toHaveBeenCalledWith("/projects", {
        params: { id: projectId },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        paramsSerializer: expect.any(Function)
      });
      expect(response).toStrictEqual(mockError);
    });
  });
});
