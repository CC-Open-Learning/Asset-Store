import { createPortal } from "react-dom";

import useProgress from "../../hooks/progress/useProgress";

/**
 * Displays download progress bars and allows canceling downloads.
 */
export default function Progress() {
  const DEFAULT_PROGRESS = 0;
  const { progresses, removeProgress } = useProgress();
  const progressContainer = document.getElementById("progress");

  if (
    !progressContainer ||
    !progresses ||
    progresses.length === DEFAULT_PROGRESS
  ) {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-4 left-4 z-[150] max-h-[50vh] w-72 space-y-2 overflow-y-auto rounded-lg bg-black/40 p-2">
      {progresses.map(progress => (
        <div
          className="relative w-full rounded-lg bg-general-40 p-4 text-white shadow-lg"
          data-testid={`progress-${progress.assetId}`}
          key={progress.assetId}>
          <span>{progress.fileName}</span>

          {/* Progress Bar Container */}
          <div className="relative mt-2 h-4 w-full rounded bg-general-10">
            {/* Filled progress bar */}
            <div
              className="absolute left-0 top-0 h-full rounded bg-yellow-80 transition-all duration-200"
              style={{
                width: `${String(progress.progress ?? DEFAULT_PROGRESS)}%`
              }}
              id="progress-bar"
            />

            {/* Centered Percentage */}
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-general-40">
              {progress.progress}%
            </span>
          </div>

          {/* Close Button */}
          <button
            className="absolute right-2 top-2 text-white"
            onClick={() => {
              removeProgress!(progress.assetId);
            }}
            type="button">
            ✖
          </button>
        </div>
      ))}
    </div>,
    progressContainer
  );
}
