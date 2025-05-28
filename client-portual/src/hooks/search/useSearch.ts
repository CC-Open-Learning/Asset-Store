import { useContext } from "react";

import type { SearchContextType } from "../../store/contexts/search/SearchContext";
import { SearchContext } from "../../store/contexts/search/SearchContext";

/**
 * Hook that provides the search context.
 */
export default function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
