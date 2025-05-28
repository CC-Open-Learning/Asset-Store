import type { ReactNode } from "react";
import { createContext, useCallback, useState } from "react";

export interface SearchContextType {
  keyword: string;
  searchTriggered: number;
  setKeyword?: (keyword: string) => void;
  setShowSearchBar?: (showSearchBar: boolean) => void;
  showSearchBar: boolean;
  triggerSearch?: () => void;
}

// Creates the context with default values
export const SearchContext = createContext<SearchContextType>({
  keyword: "",
  searchTriggered: 0,
  setKeyword: undefined,
  setShowSearchBar: undefined,
  showSearchBar: false,
  triggerSearch: undefined
});

/**
 * Provider that wraps the application and provides the context.
 * @param ReactNode The children prop.
 * @param ReactNode.children The children components.
 */
export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [keyword, setKeyword] = useState<string>("");
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [searchTriggered, setSearchTriggered] = useState<number>(0);

  const triggerSearch = useCallback(() => {
    setSearchTriggered(prevState => prevState + 1);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        keyword,
        searchTriggered,
        setKeyword,
        setShowSearchBar,
        showSearchBar,
        triggerSearch
      }}>
      {children}
    </SearchContext.Provider>
  );
};
