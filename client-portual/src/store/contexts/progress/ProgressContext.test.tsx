import { fireEvent, render } from "@testing-library/react";
import { act, useContext } from "react";
import { vi } from "vitest";

import { ProgressContext, ProgressProvider } from "./ProgressContext";

/**
 * Component that consumes the ProgressContext and displays progress values.
 */
describe("progress Context Test", () => {
  /**
   * Component that consumes the ProgressContext and allows adding and removing progress.
   */
  const MockProgressContextConsumer = () => {
    const { addProgress, progresses, removeProgress } =
      useContext(ProgressContext);

    return (
      <>
        <button
          id="add-progress-button"
          onClick={() => {
            addProgress!({ assetId: "1", fileName: "file1.txt", progress: 0 });
          }}
          type="button">
          Add Progress
        </button>
        {progresses?.map(progress => (
          <div
            id={`progress-${String(progress.assetId)}`}
            key={progress.assetId}>
            {`${progress.fileName} - ${progress.progress}%`}
            <button
              id={`progress-remove-button-${String(progress.assetId)}`}
              onClick={() => {
                removeProgress!(progress.assetId);
              }}
              type="button">
              Remove Progress
            </button>
          </div>
        ))}
      </>
    );
  };

  describe("progressContext", () => {
    test("renders progress and allows adding and removing progress", () => {
      expect.assertions(4);

      const mockAddProgress = vi.fn();
      const mockRemoveProgress = vi.fn();
      const mockContextValue = {
        addProgress: mockAddProgress,
        progresses: [{ assetId: "1", fileName: "file1.txt", progress: 50 }],
        removeProgress: mockRemoveProgress,
        updateProgress: vi.fn()
      };

      const { container } = render(
        <ProgressContext.Provider value={mockContextValue}>
          <MockProgressContextConsumer />
        </ProgressContext.Provider>
      );

      // Verify existing progress is rendered
      const existingProgress = container.querySelector("#progress-1");

      expect(existingProgress).toBeInTheDocument();
      expect(existingProgress?.textContent).toContain("file1.txt - 50%");

      // Trigger addProgress
      const addButton = container.querySelector("#add-progress-button");
      fireEvent.click(addButton!);

      expect(mockAddProgress).toHaveBeenCalledTimes(1);

      // Trigger removeProgress
      const removeButton = container.querySelector("#progress-remove-button-1");
      fireEvent.click(removeButton!);

      expect(mockRemoveProgress).toHaveBeenCalledWith("1");
    });
  });

  describe("component Test", () => {
    test("adds and removes progress through the provider", () => {
      expect.assertions(2);

      const { container } = render(
        <ProgressProvider>
          <MockProgressContextConsumer />
        </ProgressProvider>
      );

      // Trigger addProgress
      const addButton = container.querySelector("#add-progress-button");
      fireEvent.click(addButton!);

      // Verify progress is added
      const addedProgress = container.querySelector("div[id^='progress-']");

      expect(addedProgress).toBeInTheDocument();

      // Trigger removeProgress
      const removeButton = container.querySelector(
        "button[id^='progress-remove-button-']"
      );
      fireEvent.click(removeButton!);

      // Verify progress is removed
      expect(addedProgress).not.toBeInTheDocument();
    });

    test("removes progress automatically when completed", () => {
      expect.assertions(2);

      // Setup fake timers
      vi.useFakeTimers();

      let contextValue: React.ContextType<typeof ProgressContext> = {
        addProgress: undefined,
        progresses: [],
        removeProgress: undefined,
        updateProgress: undefined
      };

      /**
       * Component that consumes the ProgressContext and updates contextValue.
       * This is necessary to access the context value in the test.
       */
      const TestComponent = () => {
        contextValue = useContext(ProgressContext);
        return null;
      };

      const { container } = render(
        <ProgressProvider>
          <TestComponent />
          <MockProgressContextConsumer />
        </ProgressProvider>
      );

      // Trigger addProgress
      const addButton = container.querySelector("#add-progress-button");
      fireEvent.click(addButton!);

      // Verify progress is added
      const addedProgress = container.querySelector("div[id^='progress-']");

      expect(addedProgress).toBeInTheDocument();

      // Update progress to 100%
      act(() => {
        contextValue.updateProgress!("1", 100);
        vi.advanceTimersByTime(2000);
      });

      // Verify progress is removed
      expect(
        container.querySelector("div[id^='progress-']")
      ).not.toBeInTheDocument();

      // Cleanup
      vi.useRealTimers();
    });
  });
});
