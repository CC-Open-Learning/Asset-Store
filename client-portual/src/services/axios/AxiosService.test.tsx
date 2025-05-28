import "@testing-library/react";
import { AxiosError } from "axios";

import AxiosService from "./AxiosService";

const mocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn()
}));

// Mock only the create method of axios
vi.mock("axios", async importActual => {
  const actual = await importActual<typeof import("axios")>();

  const mockAxios = {
    AxiosError: actual.AxiosError,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        ...actual.default.create(),
        delete: mocks.delete,
        get: mocks.get,
        post: mocks.post,
        put: mocks.put
      }))
    }
  };

  return mockAxios;
});

describe("axiosService", () => {
  const endpoint = "/test-endpoint";
  const data = { key: "value" };
  const config = { headers: { Authorization: "Bearer token" } };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AxiosService, "GET");
  });

  test("should call axios.get with the correct arguments", async () => {
    expect.assertions(2);

    vi.mocked(mocks.get).mockResolvedValue({ data });

    const result = await AxiosService.GET<typeof data>(endpoint, config);

    expect(result).toStrictEqual(data);

    expect(mocks.get).toHaveBeenCalledWith(endpoint, config);
  });

  test("should handle errors thrown by axios.get", async () => {
    expect.assertions(1);

    const errorMessage = "Request failed";
    const axiosError = new AxiosError(errorMessage);

    vi.mocked(mocks.get).mockRejectedValueOnce(axiosError);

    await expect(AxiosService.GET(endpoint, config)).rejects.toMatchObject({
      message: errorMessage
    });
  });

  test("should handle non-AxiosError errors", async () => {
    expect.assertions(1);

    const errorMessage = "Generic error message";
    const genericError = new Error(errorMessage);

    vi.mocked(mocks.get).mockRejectedValueOnce(genericError);

    await expect(AxiosService.GET(endpoint, config)).rejects.toMatchObject({
      code: "unknown",
      message: errorMessage
    });
  });

  test("should handle non-Error objects", async () => {
    expect.assertions(1);

    const nonErrorObject = { someField: "some value" };
    vi.mocked(mocks.get).mockRejectedValueOnce(nonErrorObject);

    await expect(AxiosService.GET(endpoint, config)).rejects.toMatchObject({
      code: "unknown",
      message: "An unknown error occurred"
    });
  });

  test("should call axios.post with the correct arguments", async () => {
    expect.assertions(2);

    vi.mocked(mocks.post).mockResolvedValue({ data });

    const result = await AxiosService.POST<typeof data>(endpoint, data, config);

    expect(result).toStrictEqual(data);
    expect(mocks.post).toHaveBeenCalledWith(endpoint, data, config);
  });

  test("should handle errors thrown by axios.post", async () => {
    expect.assertions(1);

    const errorMessage = "Request failed";
    const axiosError = new AxiosError(errorMessage);

    vi.mocked(mocks.post).mockRejectedValueOnce(axiosError);

    await expect(
      AxiosService.POST(endpoint, data, config)
    ).rejects.toMatchObject({
      message: errorMessage
    });
  });

  test("should call axios.put with the correct arguments", async () => {
    expect.assertions(2);

    vi.mocked(mocks.put).mockResolvedValue({ data });

    const result = await AxiosService.PUT<typeof data>(endpoint, data, config);

    expect(result).toStrictEqual(data);
    expect(mocks.put).toHaveBeenCalledWith(endpoint, data, config);
  });

  test("should handle errors thrown by axios.put", async () => {
    expect.assertions(1);

    const errorMessage = "Request failed";
    const axiosError = new AxiosError(errorMessage);

    vi.mocked(mocks.put).mockRejectedValueOnce(axiosError);

    await expect(
      AxiosService.PUT(endpoint, data, config)
    ).rejects.toMatchObject({
      message: errorMessage
    });
  });

  test("should call axios.delete with the correct arguments", async () => {
    expect.assertions(2);

    vi.mocked(mocks.delete).mockResolvedValue({ data });

    const result = await AxiosService.DELETE<typeof data>(endpoint, config);

    expect(result).toStrictEqual(data);

    expect(mocks.delete).toHaveBeenCalledWith(endpoint, config);
  });

  test("should handle errors thrown by axios.delete", async () => {
    expect.assertions(1);

    const errorMessage = "Request failed";
    const axiosError = new AxiosError(errorMessage);

    vi.mocked(mocks.delete).mockRejectedValueOnce(axiosError);

    await expect(AxiosService.DELETE(endpoint, config)).rejects.toMatchObject({
      message: errorMessage
    });
  });
});
