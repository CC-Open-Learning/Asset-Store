import type { ReactNode } from "react";
import { createContext, useMemo, useState } from "react";

export interface ProgressType {
  assetId: string;
  controller: AbortController;
  fileName: string;
  progress: number;
}

export interface ProgressContextType {
  addProgress?: (
    progress: Omit<ProgressType, "controller">
  ) => AbortController | null;
  progresses?: ProgressType[];
  removeProgress?: (assetId: string) => void;
  updateProgress?: (assetId: string, progress: number) => void;
}

export const ProgressContext = createContext<ProgressContextType>({
  addProgress: undefined,
  progresses: [],
  removeProgress: undefined,
  updateProgress: undefined
});

/**
 * Provides a context for managing download progress state across components.
 * @param ReactNode The component props object.
 * @param ReactNode.children The child components to be wrapped by this provider.
 */
export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progresses, setProgresses] = useState<ProgressType[]>([]);

  /**
   * Remove progress and abort download.
   * @param assetId The unique identifier of the asset to remove from progress tracking.
   */
  const removeProgress = (assetId: string) => {
    setProgresses(prev => {
      // Abort the request if the download is ongoing
      const progress = prev.find(p => p.assetId === assetId);
      if (progress) {
        progress.controller.abort();
      }
      return prev.filter(p => p.assetId !== assetId);
    });
  };

  /**
   * Add a new progress entry (Prevents duplicate downloads).
   * @param progress The progress object containing assetId, fileName, and progress value.
   * @returns {AbortController | null} Returns a new AbortController for the download, or null if the asset is already being downloaded.
   */
  const addProgress = (progress: Omit<ProgressType, "controller">) => {
    // Check if the asset is already being downloaded
    const existingProgress = progresses.find(
      p => p.assetId === progress.assetId
    );
    if (existingProgress) {
      return null; // Prevent duplicate downloads
    }

    // Create a new AbortController
    const controller = new AbortController();
    setProgresses(prev => [...prev, { ...progress, controller }]);
    return controller;
  };

  /**
   * Update progress for a specific assetId.
   * @param assetId The unique identifier of the asset to update.
   * @param progress The current download progress percentage (0-100).
   */
  const updateProgress = (assetId: string, progress: number) => {
    setProgresses(prev =>
      prev.map(p => (p.assetId === assetId ? { ...p, progress } : p))
    );

    if (progress >= 100) {
      setTimeout(() => {
        removeProgress(assetId);
      }, 2000);
    }
  };

  const value = useMemo(
    () => ({
      addProgress,
      progresses,
      removeProgress,
      updateProgress
    }),
    [progresses]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
