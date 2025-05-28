import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useSearch from "../../hooks/search/useSearch";
import { useUser } from "../../hooks/user/useUser";
import SearchBar from "../searchbar/SearchBar";
import UserPanel from "../userpanel/UserPanel";

/**
 * The Header component that appears at the top of the page.
 * It contains three main sections:
 * A logo section (&lt;div id="Logo">) with an image.
 * A search bar section (&lt;div id="SearchBar">) containing a SearchBar component.
 * A user image section (&lt;div id="UserImage">) with an image that toggles the visibility of a UserPanel component when clicked.
 * @returns A JSX element representing a header component.
 */
export default function Header() {
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const userPanelRef = useRef<HTMLDivElement>(null);
  const { isLoading, user } = useUser();
  const [error, setError] = useState<boolean>(false);
  const { setKeyword } = useSearch();

  // Constants
  const SCROLL_POSTION_HEADER_SHADOW = 70;

  /**
   * Handles click event outside of user panel. If the user clicks outside of the user
   * panel, this function will close the panel.
   * @param {MouseEvent} event The mouse event from the click.
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (
      userPanelRef.current &&
      !userPanelRef.current.contains(event.target as Node)
    ) {
      setUserPanelOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    /**
     *User Panel closes when clicked outside or click Back and Forward Browser buttons.
     */
    const handlePopState = () => {
      setUserPanelOpen(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    /**
     * Handles the scroll event. If the user scrolls down the page, the header will show a shadow. If the user scrolls back to the top of the page, the shadow will disappear.
     */
    const handleScroll = () => {
      if (window.scrollY > SCROLL_POSTION_HEADER_SHADOW) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navigate = useNavigate();

  /**
   * Navigates to the asset page when the logo is clicked.
   */
  const handleNavigationClick = () => {
    navigate("/");
    setKeyword!("");
  };

  if (location.pathname !== "/login") {
    return (
      <header
        className={`sticky top-0 z-30 mx-auto flex h-[56px] w-full flex-row justify-between bg-general-90 p-10 py-[5px] transition-all duration-300 ${
          isScrolled ? "shadow-sm shadow-yellow-80" : ""
        }`}
        id="headerComponent">
        <div className="flex w-full justify-between" id="header-children">
          <div className="flex h-full justify-center" id="Logo">
            <img
              alt=""
              className="h-full cursor-pointer"
              draggable="false"
              onClick={handleNavigationClick}
              src="/assets/varlab_logo_transparent.png"
            />
          </div>
          <div className="h-full w-1/3" id="searchBar">
            <SearchBar />
          </div>
          <div className="h-full object-fill" id="UserImage" ref={userPanelRef}>
            <img
              alt="User profile picture"
              className="aspect-square h-full w-auto cursor-pointer rounded-full"
              draggable="false"
              onClick={() => {
                setUserPanelOpen(prevState => !prevState);
              }}
              onError={e => {
                if (!error) {
                  setError(true);
                  (e.target as HTMLImageElement).src =
                    "/assets/conestoga-college.png";
                }
              }}
              src={user?.picture ?? "/assets/conestoga-college.png"}
            />

            {/* ------------------------ User Panel Dropdown ------------------------ */}
            <div
              className={`absolute right-0 mt-2 w-64 transform rounded-md shadow-lg transition-all duration-200 ${
                userPanelOpen
                  ? "pointer-events-auto scale-100 opacity-100"
                  : "pointer-events-none -translate-y-4 opacity-0"
              }`}
              id="userPanelSection">
              <UserPanel
                closePanel={() => {
                  setUserPanelOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      </header>
    );
  }
}
