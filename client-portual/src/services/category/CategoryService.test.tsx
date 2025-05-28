import AxiosService from "../axios/AxiosService";
import CategoryService from "./CategoryService";

// Mock the axios service
vi.mock("../axios/AxiosService");

describe("categoryService", () => {
  const mockedAxiosService = vi.mocked(AxiosService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSasToken", () => {
    test("should call AxiosService.GET with the correct endpoint", async () => {
      expect.assertions(2);

      // Arrange
      const expectedResponse = { message: "mock-sas-token" };
      mockedAxiosService.GET.mockResolvedValueOnce(expectedResponse);

      // Act
      const result = await CategoryService.getSasToken();

      // Assert
      expect(mockedAxiosService.GET).toHaveBeenCalledWith(
        "/category/category-sas-token"
      );
      expect(result).toStrictEqual(expectedResponse);
    });

    test("should throw an error when the API call fails", async () => {
      expect.assertions(2);

      // Arrange
      const expectedError = new Error("API Error");
      mockedAxiosService.GET.mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(CategoryService.getSasToken()).rejects.toThrow(
        expectedError
      );
      expect(mockedAxiosService.GET).toHaveBeenCalledWith(
        "/category/category-sas-token"
      );
    });
  });
});
