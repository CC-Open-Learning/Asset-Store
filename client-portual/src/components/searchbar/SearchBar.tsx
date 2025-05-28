import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Icons from "../../assets/icons/Icons";
import useSearch from "../../hooks/search/useSearch";
import SearchService from "../../services/search/SearchService";

export interface SearchBarProps {
  iconDivStyle?: string;
  inputStyle?: string;
  parentDivStyle?: string;
}

/**
 * A search bar that allows the user to search for assets.
 * It is only visible on the pages whom their location matches the specified paths.
 * @param {SearchBarProps} [SearchBarProps] The props for the SearchBar component.
 * @param {string} [SearchBarProps.iconDivStyle] The style for the icon div.
 * @param {string} [SearchBarProps.parentDivStyle] The style for the parent div.
 * @param {string} [SearchBarProps.inputStyle] The style for the input.
 * @returns A JSX element representing the search bar.
 */
export default function SearchBar({
  iconDivStyle = "pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2",
  inputStyle = "block size-full rounded-lg bg-general-40 ps-8 text-[20px] text-general-10 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:text-white dark:placeholder-general-10 dark:focus:border-blue-500 dark:focus:ring-blue-500",
  parentDivStyle = "relative flex h-full items-center justify-center"
}: SearchBarProps) {
  const {
    keyword,
    setKeyword,
    setShowSearchBar,
    showSearchBar,
    triggerSearch
  } = useSearch();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const searchBarRef = useRef<HTMLDivElement>(null); // Ref for the search bar container
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref for the input element
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [highlightedTerm, setHighlightedTerm] = useState<number>(-1);
  const [suggestionList, setSuggestionList] = useState<string[]>([]);

  // constants
  const STEP = 1; // for increment and decrement
  const START_INDEX = 0; // start index for array
  const MIN_KEYWORD_LENGTH = 2; // minimum characters entered to display suggestions
  const MAX_RESULT_LENGTH = 10; // maximum suggestions to be displayed
  const DEFAULT_HIGHLIGHTED_INDEX = -1; // default index for highlighted term

  useEffect(() => {
    /**
     * Handles clicks outside the search bar to close the dropdown.
     * @param event Mouse click action.
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false); // Close the dropdown when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Handles the click event on the input field to reopen the dropdown if conditions are met.
   */
  const handleInputClick = () => {
    if (keyword.length >= MIN_KEYWORD_LENGTH && suggestionList.length > 0) {
      setIsDropdownVisible(true); // Reopen the dropdown when clicking inside
    }
  };

  useEffect(() => {
    // Check if the router location exists or matches specific paths to set search bar visibility
    const shouldShowSearchBar =
      routerLocation.pathname === "/" ||
      routerLocation.pathname === "/asset" ||
      // [^/]+: Matches any sequence of characters except for a /
      /^\/asset\/[^/]+$/.test(routerLocation.pathname);
    if (setShowSearchBar) {
      setShowSearchBar(shouldShowSearchBar);
    }
  }, [routerLocation.pathname, setShowSearchBar]);

  /**
   * An event which handles the click event on the suggestion list.
   * @param term The selected suggestion term.
   */
  const handleSuggestionClick = (term: string) => {
    // Update the keyword with the selected term
    setKeyword!(term);
    // Reset the suggestion list after selecting a term
    setSuggestionList([]);
    // Once the term is selected, hide the dropdown
    setIsDropdownVisible(false);
    // Trigger the search
    triggerSearch!();
  };

  /**
   * A function which gets the suggestion list based on the search term.
   * @param searchTerm The search term to get suggestions for.
   */
  const getSuggestionList = async (searchTerm: string) => {
    // Check if the input is 2 or more characters long to make an API call
    if (searchTerm.length >= MIN_KEYWORD_LENGTH) {
      // Call the search service to match terms, sending it as keyword parameter
      const results = await SearchService.byTerm({ keyword: searchTerm });
      // Check if the results are an array
      if (Array.isArray(results) && results.length > START_INDEX) {
        // If there are suggestions, show the dropdown
        setIsDropdownVisible(true);
        // If there are more than 10 suggestions, only show first 10 suggestions
        if (results.length > MAX_RESULT_LENGTH) {
          setSuggestionList(results.slice(START_INDEX, MAX_RESULT_LENGTH));
          // Else show all the suggestions
        } else {
          setSuggestionList(results);
        }
      }
    } else {
      // If the input is less than 2 characters, empty the suggestion list
      setSuggestionList([]);
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    // Get the suggestions based on the keyword
    getSuggestionList(keyword).catch((error: unknown) => {
      console.error("Error fetching terms: ", error);
    });
  }, [keyword]);

  return showSearchBar ? (
    <div className="size-full" ref={searchBarRef}>
      <div className={parentDivStyle} id="search-bar">
        <div className={iconDivStyle} id="search-bar-icon">
          {Icons.Search}
        </div>
        <input
          autoComplete="off"
          className={inputStyle}
          id="default-search"
          onChange={e => {
            setKeyword!(e.target.value);
          }}
          onClick={handleInputClick} // Handle click to reopen dropdown
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              // Check if the highlighted term is within the suggestionList length
              if (
                highlightedTerm >= START_INDEX &&
                highlightedTerm < suggestionList.length
              ) {
                const suggestionSelection = suggestionList[highlightedTerm];
                // Select a suggestion term when the user presses Enter
                handleSuggestionClick(suggestionSelection);
                // Reset the highlighted index after selecting a suggestion term
                setHighlightedTerm(DEFAULT_HIGHLIGHTED_INDEX);
                setIsDropdownVisible(false);
                setSuggestionList([]);
                searchInputRef.current?.blur(); // Unfocus after selecting suggestion
              } else if (keyword.trim().length > START_INDEX) {
                // Only trigger search if keyword is not empty and meets minimum length
                setIsDropdownVisible(false);
                setSuggestionList([]);
                triggerSearch!();
                if (routerLocation.pathname !== "/asset") {
                  navigate("/asset");
                }
                searchInputRef.current?.blur(); // Unfocus after search
              }
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              // Move the highlight down the list in a loop
              setHighlightedTerm(prevIndex =>
                prevIndex < suggestionList.length - STEP
                  ? prevIndex + STEP
                  : START_INDEX
              );
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              // Move the highlight up the list in a loop
              setHighlightedTerm(prevIndex =>
                prevIndex > START_INDEX
                  ? prevIndex - STEP
                  : suggestionList.length - STEP
              );
            }
          }}
          placeholder="Search"
          ref={searchInputRef} // Add the ref to the input
          required
          type="text"
          value={keyword}
        />
      </div>
      {/* If suggestions are visible, show dropdown */}
      {isDropdownVisible ? (
        <ul
          className="relative mt-2 flex flex-col items-center justify-center overflow-hidden rounded-lg bg-[#1A1A1A] shadow-lg"
          id="searchDropDown">
          {/* Show a list of term suggestions and onClick event to select the term */}
          {suggestionList.map((term, index) => (
            <li
              className={`size-full cursor-pointer truncate p-2 px-3 text-[18px] hover:bg-neutral-600 ${highlightedTerm === index ? "bg-neutral-600" : ""}`}
              key={term}
              onClick={() => {
                handleSuggestionClick(term);
              }}
              onMouseEnter={() => {
                setHighlightedTerm(index);
              }}>
              {term}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  ) : null;
}
