import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import useProgress from "../../hooks/progress/useProgress";
import Progress from "./Progress";

// Mock the useProgress hook
vi.mock("../../hooks/progress/useProgress", () => ({
  default: vi.fn()
}));

describe("progress Component", () => {
  const mockRemoveProgress = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Create progress container
    const progressContainer = document.createElement("div");
    progressContainer.setAttribute("id", "progress");
    document.body.appendChild(progressContainer);
  });

  afterEach(() => {
    // Clean up the progress container
    const progressContainer = document.getElementById("progress");
    if (progressContainer) {
      document.body.removeChild(progressContainer);
    }
  });

  test("renders nothing when no progress container exists", () => {
    expect.assertions(1);

    // Remove progress container
    const progressContainer = document.getElementById("progress");
    // eslint-disable-next-line vitest/no-conditional-in-test
    if (progressContainer) {
      document.body.removeChild(progressContainer);
    }

    // Mock empty progress state
    vi.mocked(useProgress).mockReturnValue({
      progresses: [],
      removeProgress: mockRemoveProgress
    });

    const { container } = render(<Progress />);

    expect(container.firstChild).toBeNull();
  });

  test("renders nothing when progresses is empty", () => {
    expect.assertions(1);

    vi.mocked(useProgress).mockReturnValue({
      progresses: [],
      removeProgress: mockRemoveProgress
    });

    const { container } = render(<Progress />);

    expect(container.firstChild).toBeNull();
  });

  test("renders progress bars for active downloads", () => {
    expect.assertions(5);

    const mockProgresses = [
      {
        assetId: "123",
        controller: new AbortController(),
        fileName: "test1.zip",
        progress: 45
      },
      {
        assetId: "456",
        controller: new AbortController(),
        fileName: "test2.zip",
        progress: 80
      }
    ];

    vi.mocked(useProgress).mockReturnValue({
      progresses: mockProgresses,
      removeProgress: mockRemoveProgress
    });

    render(<Progress />);

    // Check if file names are displayed
    expect(screen.getByText("test1.zip")).toBeInTheDocument();
    expect(screen.getByText("test2.zip")).toBeInTheDocument();

    // Check if progress percentages are displayed
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();

    // Check if progress bars exist
    const progressBars = document.querySelectorAll(
      "[data-testid^='progress-']"
    );

    expect(progressBars).toHaveLength(2);
  });

  test("calls removeProgress when close button is clicked", () => {
    expect.assertions(2);

    const mockProgresses = [
      {
        assetId: "123",
        controller: new AbortController(),
        fileName: "test.zip",
        progress: 50
      }
    ];

    vi.mocked(useProgress).mockReturnValue({
      progresses: mockProgresses,
      removeProgress: mockRemoveProgress
    });

    render(<Progress />);

    // Find and click the close button
    const closeButton = screen.getByText("✖");
    fireEvent.click(closeButton);

    // Verify removeProgress was called with correct assetId
    expect(mockRemoveProgress).toHaveBeenCalledTimes(1);
    expect(mockRemoveProgress).toHaveBeenCalledWith("123");
  });

  test("displays correct progress bar width", () => {
    expect.assertions(1);

    const mockProgresses = [
      {
        assetId: "123",
        controller: new AbortController(),
        fileName: "test.zip",
        progress: 75
      }
    ];

    vi.mocked(useProgress).mockReturnValue({
      progresses: mockProgresses,
      removeProgress: mockRemoveProgress
    });

    render(<Progress />);

    const progressBar = document.querySelector("#progress-bar");

    expect(progressBar).toHaveStyle({ width: "75%" });
  });
});
