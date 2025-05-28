import type { SearchContextType } from "../../../store/contexts/search/SearchContext";

// Mock functions
export const mockSetKeyword = vi.fn();
export const mockSetShowSearchBar = vi.fn();

// Default search context mock i.e. the mock as it would be if no overrides are passed in
export const defaultSearchContext: SearchContextType = {
  keyword: "",
  setKeyword: mockSetKeyword,
  setShowSearchBar: mockSetShowSearchBar,
  showSearchBar: false
};

// Mock implementation of useSearch
export const useSearch = vi.fn(
  (): SearchContextType => ({
    ...defaultSearchContext
  })
);

/**
 * Creates a mock SearchContext with optional overrides.
 * @param overrides Paritial param which can be passed in to override the default context values. This
 * param can be a subset of the SearchContextType object, bc Parital makes
 * everything in the object optional.
 * @returns A mocked SearchContextType object.
 */
export const createSearchContextMock = (
  overrides: Partial<SearchContextType> = {}
): SearchContextType => ({
  ...defaultSearchContext,
  ...overrides
});

export default useSearch;
