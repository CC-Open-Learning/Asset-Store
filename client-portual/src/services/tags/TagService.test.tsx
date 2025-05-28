import { vi } from "vitest";

import type { Tag } from "../../types";
import AxiosService from "../axios/AxiosService";
import TagsService from "./TagsService";

// Mock AxiosService
vi.mock("../axios/AxiosService", () => ({
  default: {
    GET: vi.fn()
  }
}));

describe("tagsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("byKeyword", () => {
    const mockTags: Tag[] = [
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" }
    ];

    test("handles single keyword search", async () => {
      expect.assertions(2);

      vi.mocked(AxiosService.GET).mockResolvedValueOnce(mockTags);

      const result = await TagsService.byKeyword({ keyword: "test" });

      expect(AxiosService.GET).toHaveBeenCalledWith("/tags", {
        params: {
          keyword: ["test"]
        },
        paramsSerializer: expect.any(Function) as (
          params: Record<string, string[]>
        ) => string
      });
      expect(result).toEqual(mockTags);
    });

    test("handles multiple comma-separated keywords", async () => {
      expect.assertions(2);

      vi.mocked(AxiosService.GET).mockResolvedValueOnce(mockTags);

      const result = await TagsService.byKeyword({ keyword: "test1, test2" });

      expect(AxiosService.GET).toHaveBeenCalledWith("/tags", {
        params: {
          keyword: ["test1", "test2"]
        },
        paramsSerializer: expect.any(Function) as (
          params: Record<string, string[]>
        ) => string
      });
      expect(result).toEqual(mockTags);
    });

    test("handles empty keyword", async () => {
      expect.assertions(2);

      vi.mocked(AxiosService.GET).mockResolvedValueOnce([]);

      const result = await TagsService.byKeyword({ keyword: "" });

      expect(AxiosService.GET).toHaveBeenCalledWith("/tags", {
        params: {
          keyword: []
        },
        paramsSerializer: expect.any(Function) as (
          params: Record<string, string[]>
        ) => string
      });
      expect(result).toEqual([]);
    });

    test("handles undefined keyword", async () => {
      expect.assertions(2);

      vi.mocked(AxiosService.GET).mockResolvedValueOnce([]);

      const result = await TagsService.byKeyword({});

      expect(AxiosService.GET).toHaveBeenCalledWith("/tags", {
        params: {
          keyword: []
        },
        paramsSerializer: expect.any(Function) as (
          params: Record<string, string[]>
        ) => string
      });
      expect(result).toEqual([]);
    });

    test("handles API error", async () => {
      expect.assertions(1);

      const error = new Error("API Error");
      vi.mocked(AxiosService.GET).mockRejectedValueOnce(error);

      await expect(TagsService.byKeyword({ keyword: "test" })).rejects.toThrow(
        "API Error"
      );
    });
  });
});
