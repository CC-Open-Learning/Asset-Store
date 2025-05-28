import "./homePage.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";

import Icons from "../../assets/icons/Icons";
import Ambulance3D from "../../components/3d/ambulance3d/Ambulance3D";
import DisplayCard from "../../components/display-card/DisplayCard";
import useAlert from "../../hooks/alert/useAlert";
import useSasToken from "../../hooks/sastoken/useSasToken";
import useSearch from "../../hooks/search/useSearch";
import SearchService from "../../services/search/SearchService";
import { AlertType } from "../../store/contexts/alert/AlertContext";
import type { Category, Filter, Project } from "../../types";

/**
 * This is the component for HomePage.
 */
export default function HomePage() {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [proj, setProj] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const sliderRef = useRef<null | Slider>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<null | number>(null);

  const { setKeyword } = useSearch();
  const {
    categorySasToken,
    fetchCategorySasToken,
    fetchProjectSasToken,
    projectSasToken
  } = useSasToken();

  const { addAlert } = useAlert();
  const navigate = useNavigate();

  /**
   * Function to trigger a new project sastoken retrieval.
   */
  const getProjectToken = async () => {
    if (fetchProjectSasToken) {
      await fetchProjectSasToken();
    }
  };

  /**
   * Function to trigger a new category sastoken retrieval.
   */
  const getCategoryToken = async () => {
    if (fetchCategorySasToken) {
      await fetchCategorySasToken();
    }
  };

  useEffect(() => {
    getProjectToken().catch((error: unknown) => {
      console.error("Error fetching project sas token:", error);
    });
    getCategoryToken().catch((error: unknown) => {
      console.error("Error fetching category sas token:", error);
    });
  }, []);

  /**
   * Function to handle clicking the more button.
   */
  const handleMoreClick = () => {
    setShowMoreOptions(prev => !prev);
  };

  /**
   * This function toggles the more button if the user click outside the button.
   * @param event Gets the click event and checks if it clicks outside any buttons it closed the dropdown for more.
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowMoreOptions(false);
    }
  };

  /**
   *Function to handle navigation when trying to go to asset according to the category or project.
   * @param selectedFilter The filter to apply to the search.
   */
  const handleNavigationClick = (selectedFilter: Filter[] | null) => {
    if (!dragging) {
      setKeyword?.(""); // Reset keyword or state if necessary
      navigate("/asset", { state: { preselectedFilter: selectedFilter } });
    }
  };

  /**
   *This function gets the all the projects using the SearchService.
   */
  const getProjects = async () => {
    //Call the search service to get assets
    const result = await SearchService.getAllProjects();
    if (Array.isArray(result)) {
      setProj(result);
    }
  };

  // Define the order of categories
  const categoryOrder = [
    "3D Model",
    "Texture",
    "Video",
    "Audio",
    "More",
    "Sprite",
    "Image",
    "HDRI"
  ];

  // magic number constants
  const NUM_VISIBLE_CATEGORIES = 4;
  const MAX_PIXELS = 5;
  const VISIBLE_START_INDEX = 0;
  const DROPDOWN_START_INDEX = NUM_VISIBLE_CATEGORIES;

  const MAINTAIN_ORDER = 0;
  const MOVE_DOWN = 1;
  const MOVE_UP = -1;
  const NOT_FOUND = -1;

  /**
   *This function gets the all the categories using the SearchService and sorts them in a specific order.
   */
  const getCategories = async () => {
    //Call the search service to get assets
    const result = await SearchService.getAllCategories();
    if (Array.isArray(result)) {
      // Sort categories based on the predefined order
      const sortedCategories = result.sort((a, b) => {
        const indexA = categoryOrder.findIndex(
          order => order.toLowerCase() === a.name.toLowerCase()
        );
        const indexB = categoryOrder.findIndex(
          order => order.toLowerCase() === b.name.toLowerCase()
        );

        // If both categories are in the order list, sort by their position
        if (indexA !== NOT_FOUND && indexB !== NOT_FOUND) {
          return indexA - indexB;
        }

        // If only one category is in the order list, prioritize it
        if (indexA !== NOT_FOUND) return MOVE_UP;
        if (indexB !== NOT_FOUND) return MOVE_DOWN;

        // If neither category is in the order list, maintain their original order
        return MAINTAIN_ORDER;
      });

      setCategories(sortedCategories);
    }
  };

  useEffect(() => {
    getProjects().catch((error: unknown) => {
      console.error("Error fetching Projects:", error);
    });
    getCategories().catch((error: unknown) => {
      console.error("Error fetching Categories:", error);
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Handle mouse down for the slider.
   * @param event The mouse event triggered by the user's interaction.
   */
  const handleMouseDown = (event: React.MouseEvent) => {
    setDragStartX(event.clientX); // Store initial position
    setDragging(false); // Reset dragging state
  };

  /**
   * Handle mouse move to keep track of the distance.
   * @param event The mouse event triggered by the user's interaction.
   */
  const handleMouseMove = (event: React.MouseEvent) => {
    if (dragStartX !== null) {
      // calculate how many pixels did the mouse moved (drag)
      const dragDistance = Math.abs(event.clientX - dragStartX);
      if (dragDistance > MAX_PIXELS) {
        // Consider it a drag if movement is over 5px
        setDragging(true);
      }
    }
  };

  /**
   * Handle mouse up for the slider.
   */
  const handleMouseUp = () => {
    setTimeout(() => {
      setDragging(false);
    }, 150); // Delay resetting dragging to prevent race conditions
    setDragStartX(null); // Reset drag start position
  };

  const settings = {
    arrows: false, // Disable default arrows
    cssEase: "cubic-bezier(0.25, 1, 0.5, 1)", // Smooth easing curve
    dots: false, // Disable dots navigation
    infinite: true, // Enable infinite loop (carousel effect)
    slidesToScroll: 1, // Scroll 1 slide at a time
    slidesToShow: 3, // Show 3 slides at once
    speed: 200,
    swipe: true, // Enable swipe support
    swipeToSlide: true, // Makes swipe more fluid
    touchThreshold: 10 // Reduces delay before a swipe is recognized
  };

  /**
   * Function to go previous in the carousel.
   *
   */
  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  // Function to go to the next slide

  /**
   * Function to go next in the carousel.
   * @returns {void}
   * @throws {void}
   */
  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  return (
    <div className="flex min-h-screen w-full flex-col p-10">
      <div
        className="mx-auto flex w-full flex-row justify-center mobile:flex-col"
        id="banner-section">
        <div className="mr-5 w-3/5 mobile:w-full">
          <h1 className="m:text-[1.8rem] my-5 text-left font-bold text-general-10 lg:text-[1.8125rem]">
            Explore our Asset Library:
            <div>3D Resources for your creations</div>
          </h1>
          <button
            className="rounded-lg border-2 border-yellow-80 px-7 py-2 font-semibold text-general-10 transition-colors duration-200 hover:bg-yellow-80"
            id="see-all-assets"
            onClick={() => {
              handleNavigationClick(null);
            }}
            type="button">
            See All Assets
          </button>
        </div>
        <div className="my-2 w-2/5 mobile:w-full">
          <Ambulance3D />
        </div>
      </div>
      <div
        className="mx-auto mb-20 grid w-full grid-cols-5 gap-8"
        id="asset-categories">
        {/* First 4 categories */}
        {categories
          .slice(VISIBLE_START_INDEX, NUM_VISIBLE_CATEGORIES)
          .map(category => (
            <div
              className="relative flex flex-col"
              id={`category-${category.name}`}
              key={`category-${category.name}`}>
              <button
                className="group flex h-40 flex-col items-center justify-center gap-3 rounded-lg bg-general-40 p-5 shadow-md hover:text-yellow-80 mobile:size-24"
                onClick={() => {
                  handleNavigationClick([
                    { id: category._id.toString(), name: category.name }
                  ]);
                }}
                type="button">
                <div className="flex justify-center rounded-full bg-general-90 p-2 transition-colors duration-200">
                  <div
                    className="size-10 bg-general-10 transition-colors duration-200 group-hover:bg-yellow-80"
                    style={{
                      WebkitMask: `url(${category.image!}?${categorySasToken}) center/contain no-repeat`
                    }}
                  />
                </div>
                <span className="text-center text-xs font-semibold text-general-10 transition-colors duration-200 group-hover:text-yellow-80 sm:text-sm lg:text-base">
                  {category.name}
                </span>
              </button>
            </div>
          ))}

        {/* More button */}
        <div className="relative flex flex-col" ref={dropdownRef}>
          <button
            className="group flex h-40 flex-col items-center justify-center gap-3 rounded-lg bg-general-40 p-5 shadow-md hover:text-yellow-80 mobile:size-24"
            onClick={handleMoreClick}
            type="button">
            <div className="flex items-center justify-center rounded-full bg-general-90 p-2 transition-colors duration-200">
              <div className="flex size-10 items-center justify-center text-general-10 transition-colors duration-200 group-hover:text-yellow-80">
                {Icons.More}
              </div>
            </div>
            <span className="text-center text-xs font-semibold text-general-10 transition-colors duration-200 group-hover:text-yellow-80 sm:text-lg lg:text-base">
              More
            </span>
          </button>

          {/* Dropdown for remaining categories */}
          {showMoreOptions ? (
            <div className="absolute left-1/2 top-full z-10 mt-3 grid h-auto w-full -translate-x-1/2 transform grid-cols-1 gap-4 rounded-lg bg-general-40 p-4 shadow-md transition-all duration-1000 ease-in-out mobile:w-28">
              {categories.slice(DROPDOWN_START_INDEX).map(moreCategory => (
                <button
                  className="group text-general-10 transition-colors duration-200 hover:text-yellow-80"
                  id={`more-category-${moreCategory.name}`}
                  key={`more-category-${moreCategory.name}`}
                  onClick={() => {
                    handleNavigationClick([
                      {
                        id: moreCategory._id.toString(),
                        name: moreCategory.name
                      }
                    ]);
                  }}
                  type="button">
                  <div className="flex items-center gap-3">
                    <div className="flex w-20 items-center justify-center">
                      <div
                        className="size-10 bg-general-10 transition-colors duration-200 group-hover:bg-yellow-80"
                        style={{
                          WebkitMask: `url(${moreCategory.image!}?${categorySasToken}) center/contain no-repeat`
                        }}
                      />
                    </div>
                    <div className="text-left text-lg">{moreCategory.name}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ------------------------------- Projects ------------------------------- */}
      <h2 className="mx-auto mb-8 w-full text-[1.8125rem] font-bold text-general-10">
        Assets by Projects
      </h2>
      <div
        className="relative mx-auto w-5/6"
        id="project-section"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}>
        <Slider ref={sliderRef} {...settings}>
          {proj.map(project => (
            <div
              className=""
              id={`project-${project._id.toString()}`}
              key={`project-${project._id.toString()}`}
              onClick={() => {
                handleNavigationClick([
                  { id: project._id.toString(), name: project.name }
                ]);
              }}>
              <DisplayCard
                buttonStyling="flex flex-col w-full mobile:h-[20vh] bg-general-40 rounded-lg 3xl:rounded-2xl overflow-clip group hover:text-yellow-80 transition-colors duration-200"
                imgStyling="border-general-40 flex aspect-video size-full flex-grow items-center justify-center border bg-contain object-cover rounded-t-lg"
                onclick={() => {
                  handleNavigationClick([
                    { id: project._id.toString(), name: project.name }
                  ]);
                }}
                src={`${project.image}?${projectSasToken}`}
                title={project.name}
                titleStyling="flex items-center ml-2 h-6 3xl:h-8 4xl:h-12 text-general-10  group-hover:text-yellow-80 transition-colors duration-200"
              />
            </div>
          ))}
        </Slider>

        {/* Custom Previous Button */}
        <button
          aria-label="Previous"
          className="absolute -left-20 top-1/2 w-9 -translate-y-1/2 transform rounded-full bg-general-40 p-1 text-[1.25rem] text-general-10 transition-colors duration-200 hover:bg-yellow-80"
          onClick={goToPrev}
          type="button">
          &#10094; {/* Left arrow */}
        </button>

        {/* Custom Next Button */}
        <button
          aria-label="Next"
          className="absolute -right-20 top-1/2 w-9 -translate-y-1/2 transform rounded-full bg-general-40 p-1 text-[1.25rem] text-general-10 transition-colors duration-200 hover:bg-yellow-80"
          onClick={goToNext}
          type="submit">
          &#10095; {/* Right arrow */}
        </button>
      </div>

      {/* ------------------------------------ Meta Search section ----------------------------------- */}
      <div className="mx-auto my-10 w-full" id="meta-search">
        <div className="flex justify-center">
          <div className="flex flex-col justify-center gap-5">
            <div className="text-[1.2rem] font-bold text-general-10 lg:text-[2.0625rem]">
              <h1>Still can&apos;t find what you are</h1>
              <h1>looking for?</h1>
            </div>

            {/* -------------------------- Meta Search Button -------------------------- */}
            <button
              className="mr-3 rounded-lg bg-gradient-to-r from-[#1E5283] to-[#1E927F] px-2 py-3 font-semibold text-general-10 hover:text-yellow-80 sm:mr-0 sm:px-7 sm:py-4 md:w-44 lg:w-40"
              onClick={() => {
                addAlert!({
                  alertMessage:
                    "This feature has not been implemented yet. Please check back later.",
                  alertType: AlertType.Error
                });
              }}
              type="submit">
              Meta Search
            </button>
          </div>
          <div className="flex items-center">
            <img
              alt="Meta Search Logo"
              className="h-auto w-[150px] object-cover p-5 md:w-60 lg:w-60"
              draggable="false"
              src="/assets/icons/MetaSearch.webp"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
