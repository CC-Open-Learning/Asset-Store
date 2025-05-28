import { render } from "@testing-library/react";
import { createContext } from "react";

import {
  SearchContext,
  type SearchContextType
} from "../../store/contexts/search/SearchContext";
import useSearch from "./useSearch";

/**
 * A component that consumes the SearchContext.
 */
const TestComponent = () => {
  const { keyword } = useSearch();
  return <div id="test-component">{keyword}</div>;
};

describe("useSearch hook", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mock functions

    vi.mock("../../store/contexts/search/SearchContext", () => {
      const mockDefaultValue: SearchContextType = {
        keyword: "",
        setKeyword: vi.fn(),
        setShowSearchBar: vi.fn(),
        showSearchBar: false
      };

      return {
        SearchContext: createContext<SearchContextType>(mockDefaultValue),

        /**
         * Provider that wraps the application and provides the context.
         * @param ReactNode The children prop.
         * @param ReactNode.children The children components.
         */
        SearchProvider: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        )
      };
    });
  });

  test("should render correctly with a valid context", () => {
    expect.assertions(2);

    const mockContextValue: SearchContextType = {
      keyword: "hey",
      setKeyword: vi.fn(),
      setShowSearchBar: vi.fn(),
      showSearchBar: true
    };

    // Pass `mockContextValue` directly to the Provider
    const { container } = render(
      <SearchContext.Provider value={mockContextValue}>
        <TestComponent />
      </SearchContext.Provider>
    );

    const testComponentElement = container.querySelector("#test-component");

    // Assertions
    expect(testComponentElement).toBeInTheDocument();
    expect(testComponentElement?.textContent).toBe(mockContextValue.keyword);
  });

  test("should throw an error if used outside of a provider", () => {
    expect.assertions(1);

    // Set the SearchContext to null for this test
    vi.mock("../../store/contexts/search/SearchContext", () => ({
      SearchContext: createContext<null | SearchContextType>(null)
    }));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {
        /* Suppress React error boundary logs during the test */
      });

    expect(() => render(<TestComponent />)).toThrow(
      "useSearch must be used within a SearchProvider"
    );

    consoleErrorSpy.mockRestore();
  });
});
