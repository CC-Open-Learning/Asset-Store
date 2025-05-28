import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";

import type { SearchContextType } from "./SearchContext";
import { SearchContext, SearchProvider } from "./SearchContext";

describe("searchContext only", () => {
  // eslint-disable-next-line jsdoc/lines-before-block
  /**
   * Component that consumes the SearchContext and displays the search bar visibility.  This is used to test the context without the provider.
   */
  const MockSearchContextConsumer = () => {
    const { keyword, showSearchBar } = useContext(SearchContext);

    return (
      <>
        <p>Mock Keyword: {keyword}</p>
        <p>Mock Search Bar Visible: {showSearchBar ? "Yes" : "No"}</p>
      </>
    );
  };

  test("provides default keyword and showSearchBar values", () => {
    expect.assertions(2);

    const mockContext: SearchContextType = {
      keyword: "",
      setKeyword: vi.fn(),
      setShowSearchBar: vi.fn(),
      showSearchBar: false
    };

    const { container } = render(
      <SearchContext.Provider value={mockContext}>
        <MockSearchContextConsumer />
      </SearchContext.Provider>
    );

    expect(container).toHaveTextContent("Mock Keyword: ");
    expect(container).toHaveTextContent("Mock Search Bar Visible: No");
  });

  test("provides updated keyword and showSearchBar values", () => {
    expect.assertions(2);

    const mockContext: SearchContextType = {
      keyword: "test",
      setKeyword: vi.fn(),
      setShowSearchBar: vi.fn(),
      showSearchBar: true
    };

    const { container } = render(
      <SearchContext.Provider value={mockContext}>
        <MockSearchContextConsumer />
      </SearchContext.Provider>
    );

    expect(container).toHaveTextContent("Mock Keyword: test");
    expect(container).toHaveTextContent("Mock Search Bar Visible: Yes");
  });

  test("calls setKeyword when setKeyword function is used", async () => {
    expect.assertions(1);

    const mockSetKeyword = vi.fn();
    const mockContext: SearchContextType = {
      keyword: "",
      setKeyword: mockSetKeyword,
      setShowSearchBar: vi.fn(),
      showSearchBar: false
    };

    const { container } = render(
      <SearchContext.Provider value={mockContext}>
        <button
          onClick={() => {
            mockSetKeyword("new test keyword");
          }}
          type="submit">
          Update Keyword
        </button>
      </SearchContext.Provider>
    );

    const updateKeywordButton = container.querySelector("button");
    if (updateKeywordButton) await userEvent.click(updateKeywordButton);

    expect(mockSetKeyword).toHaveBeenCalledWith("new test keyword");
  });

  test("calls setShowSearchBar when setShowSearchBar function is used", async () => {
    expect.assertions(1);

    const mockSetShowSearchBar = vi.fn();
    const mockContext: SearchContextType = {
      keyword: "",
      setKeyword: vi.fn(),
      setShowSearchBar: mockSetShowSearchBar,
      showSearchBar: false
    };

    const { container } = render(
      <SearchContext.Provider value={mockContext}>
        <button
          onClick={() => {
            mockSetShowSearchBar(true);
          }}
          type="submit">
          Show Search Bar
        </button>
      </SearchContext.Provider>
    );

    const showSearchBarButton = container.querySelector("button");
    if (showSearchBarButton) await userEvent.click(showSearchBarButton);

    expect(mockSetShowSearchBar).toHaveBeenCalledWith(true);
  });
});

describe("searchProvider", () => {
  // eslint-disable-next-line jsdoc/lines-before-block
  /**
   * Component that consumes the SearchContext and displays the search bar visibility.
   */
  const SearchContextConsumerComponent = () => {
    const { keyword, setKeyword, setShowSearchBar, showSearchBar } =
      useContext(SearchContext);

    return (
      <>
        <p>Keyword: {keyword}</p>
        <p>Search Bar Visible: {showSearchBar ? "Yes" : "No"}</p>
        <button
          id="set-keyword-button"
          onClick={() => {
            if (setKeyword) {
              setKeyword("new keyword");
            }
          }}
          type="submit">
          Set Keyword
        </button>
        <button
          id="toggle-search-bar-button"
          onClick={() => {
            if (setShowSearchBar) {
              setShowSearchBar(!showSearchBar);
            }
          }}
          type="submit">
          Toggle Search Bar
        </button>
      </>
    );
  };

  test("initializes with default values according to SearchContextType", () => {
    expect.assertions(2);

    const { container } = render(
      <SearchProvider>
        <SearchContextConsumerComponent />
      </SearchProvider>
    );

    // Verify initial default values
    expect(container).toHaveTextContent("Keyword: ");
    expect(container).toHaveTextContent("Search Bar Visible: No");
  });

  test("updates values via setKeyword function", async () => {
    expect.assertions(1);

    const { container } = render(
      <SearchProvider>
        <SearchContextConsumerComponent />
      </SearchProvider>
    );

    // Click to update keyword
    const setKeywordButton = container.querySelector("#set-keyword-button");
    if (setKeywordButton) await userEvent.click(setKeywordButton);

    expect(container).toHaveTextContent("Keyword: new keyword");
  });

  test("toggles showSearchBar state via setShowSearchBar function", async () => {
    expect.assertions(2);

    const { container } = render(
      <SearchProvider>
        <SearchContextConsumerComponent />
      </SearchProvider>
    );

    // Click to toggle search bar visibility
    const toggleSearchBarButton = container.querySelector(
      "#toggle-search-bar-button"
    );
    if (toggleSearchBarButton) await userEvent.click(toggleSearchBarButton);

    expect(container).toHaveTextContent("Search Bar Visible: Yes");

    // Toggle back
    if (toggleSearchBarButton) await userEvent.click(toggleSearchBarButton);

    expect(container).toHaveTextContent("Search Bar Visible: No");
  });
});
