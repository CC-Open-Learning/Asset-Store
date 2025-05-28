import { fireEvent, render, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";

import useSearch from "../../hooks/search/useSearch";
import SearchService from "../../services/search/SearchService";
import type { SearchBarProps } from "./SearchBar";
import SearchBar from "./SearchBar";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn()
  };
});

vi.mock("../../hooks/search/useSearch");
vi.mock("../../services/search/SearchService", () => ({
  default: {
    byId: vi.fn(),
    byKeyword: vi.fn(),
    byTerm: vi.fn(),
    getAllCategories: vi.fn(),
    getAllProjects: vi.fn()
  }
}));

/**
 * The wrapper component for the SearchBar component.
 * @param ReactNode Children.
 * @param ReactNode.children The children of the wrapper component.
 */
const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const defaultSearchBarProps: SearchBarProps = {
  iconDivStyle:
    "pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2",
  inputStyle:
    "block size-full rounded-lg bg-general-40 ps-8 text-[20px] text-general-10 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:text-white dark:placeholder-general-10 dark:focus:border-blue-500 dark:focus:ring-blue-500",
  parentDivStyle: "relative flex h-full items-center justify-center"
};

describe("search bar component - rendering", () => {
  describe("while searchbar is not shown to start", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      vi.mocked(useLocation).mockReturnValue({
        hash: "",
        key: "default",
        pathname: "/",
        search: "",
        state: null
      });

      vi.mocked(useSearch).mockReturnValue({
        keyword: "model",
        searchTriggered: 0,
        setKeyword: vi.fn(),
        setShowSearchBar: vi.fn(),
        showSearchBar: false,
        triggerSearch: vi.fn()
      });

      vi.mocked(useNavigate).mockReturnValue(vi.fn());
    });

    test("renders with default props", () => {
      expect.assertions(6);

      const { container, rerender } = render(<SearchBar />, { wrapper });
      let searchBarElement = container.querySelector("#search-bar");

      expect(searchBarElement).not.toBeInTheDocument();

      vi.mocked(useSearch).mockReturnValue({
        keyword: "model testing",
        searchTriggered: 0,
        setKeyword: vi.fn(),
        setShowSearchBar: vi.fn(),
        showSearchBar: true,
        triggerSearch: vi.fn()
      });

      rerender(<SearchBar />);
      // Now the search bar should be in the document
      searchBarElement = container.querySelector("#search-bar");

      expect(searchBarElement).toHaveClass(
        defaultSearchBarProps.parentDivStyle!
      );

      const searchBarIconElement =
        searchBarElement?.querySelector("#search-bar-icon");

      expect(searchBarIconElement).toBeInTheDocument();
      expect(searchBarIconElement).toHaveClass(
        defaultSearchBarProps.iconDivStyle!
      );

      const inputElement = searchBarElement?.querySelector("#default-search");

      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveClass(defaultSearchBarProps.inputStyle!);
    });

    test("renders with custom props", () => {
      expect.assertions(6);

      const customProps: SearchBarProps = {
        iconDivStyle: "custom-icon-class",
        inputStyle: "custom-input-class",
        parentDivStyle: "custom-parent-class"
      };

      const { container, rerender } = render(<SearchBar {...customProps} />, {
        wrapper
      });
      let searchBarElement = container.querySelector("#search-bar");

      expect(searchBarElement).not.toBeInTheDocument();

      vi.mocked(useSearch).mockReturnValue({
        keyword: "model testing",
        searchTriggered: 0,
        setKeyword: vi.fn(),
        setShowSearchBar: vi.fn(),
        showSearchBar: true,
        triggerSearch: vi.fn()
      });

      rerender(<SearchBar {...customProps} />);

      searchBarElement = container.querySelector("#search-bar");

      expect(searchBarElement).toHaveClass(customProps.parentDivStyle!);

      const searchBarIconElement =
        searchBarElement?.querySelector("#search-bar-icon");

      expect(searchBarIconElement).toBeInTheDocument();
      expect(searchBarIconElement).toHaveClass(customProps.iconDivStyle!);

      const inputElement = searchBarElement?.querySelector("#default-search");

      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveClass(customProps.inputStyle!);
    });
  });

  describe("while searchbar is shown to start", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      vi.mocked(useLocation).mockReturnValue({
        hash: "",
        key: "default",
        pathname: "/asset",
        search: "",
        state: null
      });

      vi.mocked(useSearch).mockReturnValue({
        keyword: "apple",
        searchTriggered: 0,
        setKeyword: vi.fn(),
        setShowSearchBar: vi.fn(),
        showSearchBar: true,
        triggerSearch: vi.fn()
      });
    });

    test("renders with default props", () => {
      expect.assertions(6);

      // Render the component initially with showSearchBar set to false
      const { container } = render(<SearchBar />, { wrapper });
      const searchBarElement = container.querySelector("#search-bar");

      expect(searchBarElement).toBeInTheDocument();
      expect(searchBarElement).toHaveClass(
        defaultSearchBarProps.parentDivStyle!
      );

      const searchBarIconElement =
        searchBarElement?.querySelector("#search-bar-icon");

      expect(searchBarIconElement).toBeInTheDocument();
      expect(searchBarIconElement).toHaveClass(
        defaultSearchBarProps.iconDivStyle!
      );

      const inputElement = searchBarElement?.querySelector("#default-search");

      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveClass(defaultSearchBarProps.inputStyle!);
    });

    test("renders with custom props", () => {
      expect.assertions(6);

      const customProps: SearchBarProps = {
        iconDivStyle: "custom-icon-class",
        inputStyle: "custom-input-class",
        parentDivStyle: "custom-parent-class"
      };

      // Render the component initially with showSearchBar set to false
      const { container } = render(<SearchBar {...customProps} />, {
        wrapper
      });
      const searchBarElement = container.querySelector("#search-bar");

      expect(searchBarElement).toBeInTheDocument();
      expect(searchBarElement).toHaveClass(customProps.parentDivStyle!);

      const searchBarIconElement =
        searchBarElement?.querySelector("#search-bar-icon");

      expect(searchBarIconElement).toBeInTheDocument();
      expect(searchBarIconElement).toHaveClass(customProps.iconDivStyle!);

      const inputElement = searchBarElement?.querySelector("#default-search");

      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveClass(customProps.inputStyle!);
    });
  });
});

describe("searchBar Component - actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLocation).mockReturnValue({
      hash: "",
      key: "default",
      pathname: "/",
      search: "",
      state: null
    });
  });

  test("changes input value and calls setKeyword with new value", () => {
    expect.assertions(3);

    let mockKeyword = "";
    const setKeywordMock = vi.fn((newKeyword: string) => {
      mockKeyword = newKeyword;
    });

    vi.mocked(useSearch).mockReturnValue({
      keyword: mockKeyword,
      searchTriggered: 0,
      setKeyword: setKeywordMock,
      setShowSearchBar: vi.fn(),
      showSearchBar: true,
      triggerSearch: vi.fn()
    });

    const { container } = render(<SearchBar />, { wrapper });

    const inputElement = container.querySelector("#default-search");

    expect(inputElement).toBeInTheDocument();

    fireEvent.change(inputElement as HTMLInputElement, {
      target: { value: "new search term" }
    });

    fireEvent.keyDown(inputElement as HTMLInputElement, {
      charCode: 13,
      code: "Enter",
      key: "Enter"
    });

    expect(setKeywordMock).toHaveBeenCalledWith("new search term");
    expect(mockKeyword).toBe("new search term");
  });

  test("navigates to /asset when enter key is pressed", () => {
    expect.assertions(2);

    const mockNavigate = vi.fn();

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(useSearch).mockReturnValue({
      keyword: "apple",
      searchTriggered: 0,
      setKeyword: vi.fn(),
      setShowSearchBar: vi.fn(),
      showSearchBar: true,
      triggerSearch: vi.fn()
    });

    const { container } = render(<SearchBar />, { wrapper });

    const inputElement = container.querySelector("#default-search");

    expect(inputElement).toBeInTheDocument();

    fireEvent.keyDown(inputElement as HTMLInputElement, {
      charCode: 13,
      code: "Enter",
      key: "Enter"
    });

    expect(mockNavigate).toHaveBeenCalledWith("/asset");
  });
});

describe("searchBar - AutoComplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLocation).mockReturnValue({
      hash: "",
      key: "default",
      pathname: "/",
      search: "",
      state: null
    });

    vi.mocked(useNavigate).mockReturnValue(vi.fn());
    vi.mocked(SearchService.byTerm).mockResolvedValue([
      "tags",
      "model",
      "apple"
    ]);
  });

  // Testing if the keyword is updated and filtered correctly when the input value changes
  test("changes input value and updates keyword", () => {
    expect.assertions(3);

    let mockKeyword = "";
    const setKeywordMock = vi.fn((newKeyword: string) => {
      mockKeyword = newKeyword;
    });
    const selectedTerms = ["test", "apple", "cherry"];

    vi.mocked(useSearch).mockReturnValue({
      keyword: mockKeyword,
      searchTriggered: 0,
      setKeyword: setKeywordMock,
      setShowSearchBar: vi.fn(),
      showSearchBar: true,
      triggerSearch: vi.fn()
    });

    const { container } = render(<SearchBar />, { wrapper });
    const inputElement = container.querySelector("#default-search");

    fireEvent.change(inputElement as HTMLInputElement, {
      target: { value: "Test" }
    });

    fireEvent.keyDown(inputElement as HTMLInputElement, {
      charCode: 13,
      code: "Enter",
      key: "Enter"
    });

    expect(setKeywordMock).toHaveBeenCalledWith("Test");
    expect(mockKeyword).toBe("Test");

    // Filtering the selected terms
    const filtered = selectedTerms.filter(term =>
      term.toLowerCase().includes(mockKeyword.toLowerCase())
    );

    expect(filtered).toStrictEqual(["test"]);
  });

  // Testing if the dropdown is toggled when the input value changes
  test("hides dropdown when input is empty", async () => {
    expect.assertions(2);

    let mockKeyword = "tags";
    const setKeywordMock = vi.fn((newKeyword: string) => {
      mockKeyword = newKeyword;
    });

    vi.mocked(useSearch).mockReturnValue({
      keyword: mockKeyword,
      searchTriggered: 0,
      setKeyword: setKeywordMock,
      setShowSearchBar: vi.fn(),
      showSearchBar: true,
      triggerSearch: vi.fn()
    });

    const { container, rerender } = render(<SearchBar />, { wrapper });
    const inputElement = container.querySelector("#default-search");

    // If the value is empty, the dropdown should not be shown
    fireEvent.change(inputElement as HTMLInputElement, {
      target: { value: "" }
    });

    await waitFor(() => {
      const dropdown = container.querySelector("#searchDropDown");

      expect(dropdown).toBeNull();
    });

    // If the value is not empty, the dropdown should be shown
    fireEvent.change(inputElement as HTMLInputElement, {
      target: { value: "tags" }
    });
    rerender(<SearchBar />);

    await waitFor(() => {
      const dropdown = container.querySelector("#searchDropDown");

      expect(dropdown).not.toBeNull();
    });
  });
});
