import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import useAlert from "../../hooks/alert/useAlert";
import useProgress from "../../hooks/progress/useProgress";
import AssetService from "../../services/asset/AssetService";
import { AlertType } from "../../store/contexts/alert/AlertContext";
import DownloadAssetButton from "./DownloadAssetButton";

// Mock services and hooks
vi.mock("../../services/asset/AssetService", () => ({
  default: {
    getAssetUrl: vi.fn(),
    getSasToken: vi.fn()
  }
}));
vi.mock("../../hooks/alert/useAlert", () => ({
  default: vi.fn().mockReturnValue({
    addAlert: vi.fn(),
    alerts: [],
    removeAlert: vi.fn()
  })
}));
vi.mock("../../hooks/progress/useProgress");

describe("downloadAssetButton", () => {
  const mockAddAlert = vi.fn();
  const mockAddProgress = vi.fn();
  const mockRemoveProgress = vi.fn();
  const mockUpdateProgress = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;

    // Mock useAlert
    vi.mocked(useAlert).mockReturnValue({
      addAlert: mockAddAlert,
      alerts: [],
      removeAlert: vi.fn()
    });

    // Mock useProgress
    vi.mocked(useProgress).mockReturnValue({
      addProgress: mockAddProgress.mockReturnValue(new AbortController()),
      progresses: [],
      removeProgress: mockRemoveProgress,
      updateProgress: mockUpdateProgress
    });

    // Mock AssetService
    vi.mocked(AssetService.getAssetUrl).mockResolvedValue({
      message: "Success",
      url: "https://example.com/asset.zip"
    });
  });

  test("initiates download when clicked", async () => {
    expect.assertions(5);

    // Mock the fetch response for the asset download
    const mockResponse = new Response(new Blob(["test data"]), {
      headers: {
        "Content-Length": "9",
        "Content-Type": "application/zip"
      }
    });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const { container } = render(
      <DownloadAssetButton assetFileName="test-file" assetId="123" />
    );

    const downloadButton = container.querySelector("#download-button");

    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton!);

    await waitFor(() => {});

    // Check if the download was initiated
    expect(AssetService.getAssetUrl).toHaveBeenCalledWith({ id: "123" });
    expect(mockAddProgress).toHaveBeenCalledWith({
      assetId: "123",
      fileName: "test-file.zip",
      progress: 0
    });
    expect(mockAddAlert).toHaveBeenCalledWith({
      alertMessage: `Downloading 'test-file.zip'...`,
      alertType: AlertType.Success
    });
    expect(mockAddProgress).toHaveBeenCalledWith({
      assetId: "123",
      fileName: "test-file.zip",
      progress: 0
    });
  });

  test("shows error when asset not found", async () => {
    expect.assertions(2);

    vi.mocked(AssetService.getAssetUrl).mockResolvedValue({
      message: "Asset not found",
      url: ""
    });

    const { container } = render(
      <DownloadAssetButton assetFileName="test-file" assetId="123" />
    );

    const downloadButton = container.querySelector("#download-button");
    fireEvent.click(downloadButton!);

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith({
        alertMessage: "Asset URL not found",
        alertType: AlertType.Error
      });
    });
  });

  test("prevents multiple simultaneous downloads", async () => {
    expect.assertions(2);

    // Mock progress context to simulate an active download
    vi.mocked(useProgress).mockReturnValue({
      addProgress: mockAddProgress,
      progresses: [
        {
          assetId: "123",
          controller: new AbortController(),
          fileName: "test-file.zip",
          progress: 0
        }
      ],
      removeProgress: mockRemoveProgress,
      updateProgress: mockUpdateProgress
    });

    const { container } = render(
      <DownloadAssetButton assetFileName="test-file" assetId="123" />
    );

    const downloadButton = container.querySelector("#download-button");

    expect(downloadButton).toBeDisabled();

    // Try to click the button (should be prevented by disabled state)
    await act(async () => {
      fireEvent.click(downloadButton!);
    });

    // Verify that getAssetUrl was never called due to disabled state
    expect(AssetService.getAssetUrl).not.toHaveBeenCalled();
  });
});
