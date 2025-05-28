import { render } from "@testing-library/react";
import { createContext } from "react";

import type { SasTokenContextType } from "../../store/contexts/sastoken/SasTokenContext";
import { SasTokenContext } from "../../store/contexts/sastoken/SasTokenContext";
import useSasToken from "./useSasToken";

/**
 * A component that consumes the SasTokenContext.
 */
const TestComponent = () => {
  const { assetSasToken, projectSasToken } = useSasToken();
  return (
    <>
      <div id="test-component-asset">{assetSasToken}</div>;
      <div id="test-component-project">{projectSasToken}</div>;
    </>
  );
};

describe("useSasToken hook", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mock functions

    vi.mock("../../store/contexts/sastoken/SasTokenContext", () => {
      const mockDefaultValue: SasTokenContextType = {
        assetSasToken: "",
        fetchAssetSasToken: vi.fn(),
        fetchProjectSasToken: vi.fn(),
        projectSasToken: ""
      };

      return {
        SasTokenContext: createContext<SasTokenContextType>(mockDefaultValue),

        /**
         * Provider that wraps the application and provides the context.
         * @param ReactNode The children prop.
         * @param ReactNode.children The children components.
         */
        SasTokenProvider: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        )
      };
    });
  });

  test("should render correctly with a valid context", () => {
    expect.assertions(4);

    const mockContextValue: SasTokenContextType = {
      assetSasToken: "asset-test",
      fetchAssetSasToken: vi.fn(),
      fetchProjectSasToken: vi.fn(),
      projectSasToken: "project-test"
    };

    // Pass `mockContextValue` directly to the Provider
    const { container } = render(
      <SasTokenContext.Provider value={mockContextValue}>
        <TestComponent />
      </SasTokenContext.Provider>
    );

    const testComponentAssetElement = container.querySelector(
      "#test-component-asset"
    );
    const testComponentProjectElement = container.querySelector(
      "#test-component-project"
    );

    // Assertions
    expect(testComponentAssetElement).toBeInTheDocument();
    expect(testComponentAssetElement?.textContent).toBe(
      mockContextValue.assetSasToken
    );

    // Assertions
    expect(testComponentProjectElement).toBeInTheDocument();
    expect(testComponentProjectElement?.textContent).toBe(
      mockContextValue.projectSasToken
    );
  });

  test("should throw an error if used outside of a provider", () => {
    expect.assertions(1);

    // Temporarily set SasTokenContext to null for this test
    vi.mock("../../store/contexts/sastoken/SasTokenContext", () => ({
      SasTokenContext: createContext<null | SasTokenContextType>(null)
    }));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {
        /* Suppress React error boundary logs during the test */
      });

    expect(() => render(<TestComponent />)).toThrow(
      "useSasToken must be used within a SasTokenProvider"
    );

    consoleErrorSpy.mockRestore();
  });
});
