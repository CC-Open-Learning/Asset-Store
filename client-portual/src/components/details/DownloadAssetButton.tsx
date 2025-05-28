import { useMemo, useState } from "react";

import useAlert from "../../hooks/alert/useAlert";
import useProgress from "../../hooks/progress/useProgress";
import AssetService from "../../services/asset/AssetService";
import { AlertType } from "../../store/contexts/alert/AlertContext";

type Props = {
  assetFileName: string;
  assetId: string;
};

/**
 * A button component that handles asset downloads with progress tracking.
 * @param props The component props object.
 * @param props.assetFileName The name of the asset file to be downloaded.
 * @param props.assetId The unique identifier of the asset.
 */
export default function DownloadAssetButton({ assetFileName, assetId }: Props) {
  const { addAlert } = useAlert();
  const { addProgress, progresses, removeProgress, updateProgress } =
    useProgress();
  const [isLocked, setIsLocked] = useState(false);
  const isDownloading = useMemo(
    () => progresses?.some(progress => progress.assetId === assetId),
    [progresses, assetId]
  );

  // Numeric Constants
  const NUMERIC_CONSTANTS = {
    INITIAL_PROGRESS: 0,
    PERCENTAGE_MULTIPLIER: 100,
    RADIX: 10
  } as const;

  /**
   * Downloads an asset file from the given URL and saves it with the specified filename.
   * @param fileUrl The URL from which to download the asset.
   * @param fileName The name to save the downloaded file as.
   */
  const downloadAsset = async (fileUrl: string, fileName: string) => {
    const ALERT_MESSAGES = {
      DOWNLOAD_CANCELED: `Download for '${fileName}' canceled`,
      DOWNLOAD_COMPLETED: `Download for '${fileName}' completed!`,
      DOWNLOAD_ERROR: `Error downloading '${fileName}'`,
      DOWNLOAD_IN_PROGRESS: `Download '${fileName}' already in progress!`,
      DOWNLOAD_STARTED: `Downloading '${fileName}'...`,
      FETCH_ERROR: "Failed to fetch the file",
      NO_BODY: "No response body found"
    } as const;

    addAlert!({
      alertMessage: ALERT_MESSAGES.DOWNLOAD_STARTED,
      alertType: AlertType.Success
    });

    // Add Progress bar
    const controller = addProgress?.({
      assetId,
      fileName,
      progress: NUMERIC_CONSTANTS.INITIAL_PROGRESS
    });

    //if assetId already exists in progress, abort the download
    if (!controller) {
      addAlert!({
        alertMessage: ALERT_MESSAGES.DOWNLOAD_IN_PROGRESS,
        alertType: AlertType.Error
      });
      return;
    }

    try {
      const response = await fetch(fileUrl, { signal: controller.signal });

      if (!response.ok) throw new Error(ALERT_MESSAGES.FETCH_ERROR);
      if (!response.body) throw new Error(ALERT_MESSAGES.NO_BODY);

      //gets the reader from the response body
      const reader = response.body.getReader();
      // Get the total size of the response body
      // This is useful for calculating the progress percentage
      const contentLength = response.headers.get("Content-Length");
      const contentType = response.headers.get("Content-Type") ?? undefined;
      const totalSize = contentLength
        ? parseInt(contentLength, NUMERIC_CONSTANTS.RADIX)
        : NUMERIC_CONSTANTS.INITIAL_PROGRESS;

      let received = 0;
      const chunks: Uint8Array[] = [];

      // Read the response stream in chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Push the chunk to the array
        // This is useful for creating the final Blob
        chunks.push(value);
        received += value.length;
        if (totalSize) {
          const currentProgress = Math.round(
            (received / totalSize) * NUMERIC_CONSTANTS.PERCENTAGE_MULTIPLIER
          );
          updateProgress?.(assetId, currentProgress);
        }
      }

      // Ensure correct MIME type is preserved
      // Create a Blob from the chunks
      const blob = new Blob(chunks, { type: contentType });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addAlert!({
        alertMessage: ALERT_MESSAGES.DOWNLOAD_COMPLETED,
        alertType: AlertType.Success
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "AbortError"
      ) {
        addAlert!({
          alertMessage: ALERT_MESSAGES.DOWNLOAD_CANCELED,
          alertType: AlertType.Error
        });
      } else {
        addAlert!({
          alertMessage: ALERT_MESSAGES.DOWNLOAD_ERROR,
          alertType: AlertType.Error
        });
      }
    } finally {
      removeProgress?.(assetId);
    }
  };

  /**
   * Retrieves the asset download URL and initiates the download process.
   */
  const GetAssetUrl = async () => {
    // Prevent multiple downloads
    if (isLocked) return;

    try {
      setIsLocked(true); // Lock downloads
      const downloadResponse = await AssetService.getAssetUrl({
        id: assetId
      });

      if (downloadResponse?.url) {
        // Use the clean URL for download
        const [urlWithoutQuery] = downloadResponse.url.split("?");
        // Get the file extension from the URL
        const fileExtension = urlWithoutQuery.split(".").pop() ?? "";

        await downloadAsset(
          downloadResponse?.url,
          `${assetFileName}.${fileExtension}`
        );
      } else {
        throw new Error("Asset URL not found");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        addAlert!({
          alertMessage: error.message,
          alertType: AlertType.Error
        });
      }
    } finally {
      setIsLocked(false); // Unlock downloads
    }
  };

  return (
    <div className="relative w-full">
      <button
        className="w-full rounded-lg bg-yellow-80 px-5 py-2 text-sm font-medium text-general-10 hover:bg-yellow-70 focus:ring-2 focus:ring-general-10 disabled:opacity-50"
        disabled={isDownloading ?? isLocked}
        id="download-button"
        onClick={() => void GetAssetUrl()}
        type="button">
        {isDownloading ? "Downloading..." : "Download"}
      </button>
    </div>
  );
}
