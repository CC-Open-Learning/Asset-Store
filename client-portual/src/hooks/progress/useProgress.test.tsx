import { render, renderHook } from "@testing-library/react";
import { createContext } from "react";
import { describe, expect, test } from "vitest";

import type { ProgressContextType } from "../../store/contexts/progress/ProgressContext";
import { ProgressContext } from "../../store/contexts/progress/ProgressContext";
import useProgress from "./useProgress";

describe("useProgress", () => {
  const mockProgressContext = {
    addProgress: vi.fn(),
    progresses: [],
    removeProgress: vi.fn(),
    updateProgress: vi.fn()
  };

  /**
   * A component that consumes the ProgressContext.
   */
  const TestComponent = () => {
    useProgress();
    return null;
  };

  test("should return context when used within ProgressProvider", () => {
    expect.assertions(1);

    /**
     * A wrapper component that provides the ProgressContext to its children.
     * @param {ReactNode} children The children components to be rendered within the provider.
     */
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProgressContext.Provider value={mockProgressContext}>
        {children}
      </ProgressContext.Provider>
    );

    const { result } = renderHook(() => useProgress(), { wrapper });

    expect(result.current).toBe(mockProgressContext);
  });

  test("should throw an error if used outside of a provider", () => {
    expect.assertions(1);

    vi.mock("../../store/contexts/progress/ProgressContext", () => ({
      ProgressContext: createContext<null | ProgressContextType>(null)
    }));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {
        /* Suppress React error boundary logs during the test */
      });

    expect(() => render(<TestComponent />)).toThrow(
      "useProgress must be used within a ProgressProvider"
    );

    consoleErrorSpy.mockRestore();
  });
});
