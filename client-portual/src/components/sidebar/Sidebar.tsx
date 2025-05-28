import ChevronRightIcon from "@heroicons/react/20/solid/ChevronRightIcon";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import SearchService from "../../services/search/SearchService";
import type { Asset, Category, Filter, Project } from "../../types";

interface Props {
  preselectedFilter?: Filter[] | null;
  searchedAssets: Asset[];
  setFilteredAssets: Dispatch<SetStateAction<Asset[]>>;
  signalClearFilters: boolean;
}

/**
 * Sidebar component that displays the filters.
 * @param props The properties passed to the Sidebar component.
 * @param props.searchedAssets Assets to filter.
 * @param props.setFilteredAssets Function to set the filtered assets.
 * @param props.signalClearFilters The filters to apply to the assets.
 * @param props.preselectedFilter This prop passed from the homepage based on clicked proj or category.
 */
export default function Sidebar({
  preselectedFilter,
  searchedAssets,
  setFilteredAssets,
  signalClearFilters
}: Props) {
  // These are the projects and categories for the side nav which are going to be dynamically populated
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [sideNavFilters, setSideNavFilters] = useState<Filter[]>([]);

  // magic number constants
  const NO_LENGTH = 0;

  // This useEffect sets the filters according to what project or category is clicked
  // on the homepage
  useEffect(() => {
    if (preselectedFilter && preselectedFilter.length > NO_LENGTH) {
      setSideNavFilters(preselectedFilter); // Directly set the filters
    }
  }, [preselectedFilter, projects, categories]);

  // This use Effect fetches projects and categories for the side nav
  useEffect(() => {
    /**
     * Fetches all the projects using the search service.
     */
    const fetchProjects = async () => {
      const result = await SearchService.getAllProjects();
      if (Array.isArray(result)) {
        result.sort((a, b) => a.name.localeCompare(b.name));
        setProjects(result);
      }
    };

    /**
     * Fetches all the categories using the search service.
     */
    const fetchCategories = async () => {
      const result = await SearchService.getAllCategories();
      if (Array.isArray(result)) {
        result.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(result);
      }
    };
    fetchProjects().catch(console.error);
    fetchCategories().catch(console.error);
  }, []);

  /**
   * Handles the checkbox change event for filters.
   * Adds the selected filter to `sideNavFilters` if checked, or removes it if unchecked.
   * @param id The id of the project or category.
   * @param name The name of the project or category.
   * @param isChecked The current state of the checkbox (true if checked, false otherwise).
   */
  const handleCheckboxChange = (
    id: string,
    name: string,
    isChecked: boolean
  ) => {
    const filter: Filter = { id, name };

    if (isChecked) {
      // Add the filter to sideNavFilters
      setSideNavFilters(prevFilters => {
        if (!prevFilters.some(f => f.id === id)) {
          return [...prevFilters, filter];
        }
        return prevFilters;
      });
    } else {
      // Remove the filter from sideNavFilters
      setSideNavFilters(prevFilters => prevFilters.filter(f => f.id !== id));
    }
  };

  /**
   * This function clears all the selected filters.sets they keyword to empty string and sets the filtered assets to the searched assets.
   */
  const handleClearAllFilters = () => {
    setSideNavFilters([]);
    setFilteredAssets(searchedAssets);
  };

  useEffect(() => {
    handleClearAllFilters();
  }, [signalClearFilters]);

  /**
   * This function toggles the filter on/off when the filter badge is clicked.
   * @param filter The selection to toggle.
   */
  const handleBadgeClick = (filter: Filter) => {
    setSideNavFilters(prevFilters => prevFilters.filter(f => f !== filter));
  };

  /**
   * Filters the assets based on the selected filters (checked projects and categories).
   * Updates the filteredAssets state with assets that match any of the selected filters.
   * @param selectedFilters The filters to apply to the assets. I.e. The checked projects and categories.
   */
  const filterAssets = (selectedFilters: Filter[]) => {
    const result = searchedAssets.filter(asset =>
      selectedFilters.some(
        filter =>
          // Check if the filter matches any project._id
          asset.projects?.some(
            project => project._id.toString() === filter.id
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          ) ||
          // Check if the filter matches any category._id
          asset.categories?.some(
            category => category._id.toString() === filter.id
          )
      )
    );

    // If no filters are selected, show all assets
    if (sideNavFilters.length === NO_LENGTH) {
      setFilteredAssets(searchedAssets);
      return;
    }

    setFilteredAssets(result);
  };

  // This useEffect calls the filterAssets function whenever the sideNavFilters change i.e. whenever the user
  // selects a project or a category in the sidenav to filter
  useEffect(() => {
    filterAssets(sideNavFilters);
  }, [sideNavFilters, searchedAssets]);

  // -----Sidebar component body ----
  return (
    <div className="drawer fixed z-30 w-[50px]">
      <input className="drawer-toggle" id="my-drawer" type="checkbox" />
      <div className="drawer-content mt-2">
        {/* -------------------------- Sidbar Arrow button ------------------------- */}
        <label
          className="btn drawer-button flex w-[50px] rounded-l-none rounded-r-lg border-none bg-[#14191e] p-0 hover:bg-[#14191e]"
          htmlFor="my-drawer">
          <ChevronRightIcon className="size-full rounded-l-none rounded-r-lg bg-transparent text-[#a5acba]" />
        </label>
      </div>
      <div className="drawer-side opacity-95">
        <label
          aria-label="close sidebar"
          className="drawer-overlay opacity-50"
          htmlFor="my-drawer"
        />
        <ul className="min-h-full w-1/5 rounded-r-lg bg-general-90 p-4 text-base-content shadow-[0_35px_40px_-15px_rgba(0,0,0,0.8)]">
          {/* Sidebar content here */}
          <div
            className={`my-4 flex transform justify-between transition-all duration-300 ease-in-out ${
              sideNavFilters.length > NO_LENGTH
                ? "h-auto translate-y-0 opacity-100"
                : "h-0 -translate-y-4 overflow-hidden opacity-0"
            }`}>
            <h1 className="text-xl font-bold text-general-10">Selection</h1>
            <button
              className="mt-1 text-general-10"
              onClick={handleClearAllFilters}
              type="button">
              Clear All
            </button>
          </div>

          {/* -------------------------------- Badges -------------------------------- */}
          <div className="">
            {sideNavFilters.map(filter => (
              <div
                className="badge-lg mb-2 mr-1 inline-flex max-w-full cursor-pointer items-center gap-2 overflow-hidden whitespace-nowrap rounded-2xl bg-yellow-80 bg-opacity-80 text-general-10 hover:scale-95"
                key={`filter-${filter.id}`}
                onClick={() => {
                  handleBadgeClick(filter);
                }}>
                <span className="flex-1 truncate">{filter.name}</span>

                <button title="filter" type="button">
                  <svg
                    className="inline-flex size-4 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="4"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/*------ border above projects ---------*/}
          <hr
            className={`my-3 border-yellow-80 transition-all duration-300 ease-in-out ${
              sideNavFilters.length > NO_LENGTH
                ? "h-px opacity-100"
                : "h-0 opacity-0"
            }`}
          />

          {/* ------------------------------ Projects section ------------------------------ */}
          <div
            className={` ${
              sideNavFilters.length > NO_LENGTH
                ? "translate-y-0 opacity-100 duration-300"
                : "-translate-y-4 overflow-hidden opacity-100 duration-300"
            } `}>
            <h2 className="my-3 text-lg font-bold text-general-10">Projects</h2>
            {projects.map(project => (
              <div className="form-control flex" key={project._id.toString()}>
                <label className="label cursor-pointer p-0.5">
                  <input
                    checked={sideNavFilters.some(
                      (filter: Filter) => filter.id === project._id.toString()
                    )}
                    className="checkbox checkbox-xs mr-2 rounded-sm border-2 border-general-50 border-opacity-70 text-general-10"
                    onChange={e => {
                      handleCheckboxChange(
                        project._id.toString(),
                        project.name,
                        e.target.checked
                      );
                    }}
                    style={
                      {
                        "--chkbg": "#B3B3B3", // Custom checked background color
                        "--chkfg": "#2D2D2D" // Custom checked foreground color
                      } as React.CSSProperties
                    }
                    type="checkbox"
                  />

                  <span className="label-text mr-auto text-[#a5acba]">
                    {project.name}
                  </span>
                </label>
              </div>
            ))}

            {/*------ border above categories and below projects ---------*/}
            <hr className="my-3 border-yellow-80" />

            {/* ------------------------------ Categories section ------------------------------ */}
            <h2 className="my-3 text-lg font-bold text-general-10">
              Categories
            </h2>
            {categories.map(category => (
              <div className="form-control flex" key={category._id.toString()}>
                <label className="label cursor-pointer p-0.5">
                  <input
                    checked={sideNavFilters.some(
                      (filter: Filter) => filter.id === category._id.toString()
                    )}
                    className="checkbox checkbox-xs mr-2 rounded-sm border-2 border-general-50 border-opacity-70"
                    onChange={e => {
                      handleCheckboxChange(
                        category._id.toString(),
                        category.name,
                        e.target.checked
                      );
                    }}
                    type="checkbox"
                  />
                  <span className="label-text mr-auto text-[#a5acba]">
                    {category.name}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </ul>
      </div>
    </div>
  );
}
