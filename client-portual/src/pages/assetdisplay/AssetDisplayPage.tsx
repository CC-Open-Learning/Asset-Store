import "./assetDisplayPage.css";

/* eslint-disable react/forbid-component-props */
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import AssetDetails from "../../components/details/AssetDetails";
import DisplayCard from "../../components/display-card/DisplayCard";
import type { ModalRef } from "../../components/modal/Modal";
import Modal from "../../components/modal/Modal";
import Pagination from "../../components/pagination/Pagination";
import Sidebar from "../../components/sidebar/Sidebar";
import useAlert from "../../hooks/alert/useAlert";
import useSasToken from "../../hooks/sastoken/useSasToken";
import useSearch from "../../hooks/search/useSearch";
import SearchService from "../../services/search/SearchService";
import { AlertType } from "../../store/contexts/alert/AlertContext";
import type { Asset, Filter } from "../../types";

/**
 * This is AssetDisplayPage.
 */
export default function AssetDisplayPage() {
  const [currentPageAssets, setCurrentPageAssets] = useState<Asset[]>([]);

  // Gets the searched assets from the search service
  const [searchedAssets, setSearchedAssets] = useState<Asset[]>([]);

  // This list is used to store the assets that are filtered by the user
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

  const defaultPage = 1;
  const [currentPage, setCurrentPage] = useState<number>(defaultPage);

  const [modalState, setModalState] = useState<boolean>(false);

  // This is the selected sort state by the user for assets i.e. ascending, descending, newest, oldest
  const [selectedSort, setSelectedSort] = useState<null | string>(null);

  const defaultItemsPerPage = 12;
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // This is to signal the sidebar to clear all filters.
  // The state value on this does not hold any meaning to anything.
  // All this does is trigger a useState on the Sidebar to clear filters through the AssetDisplayPage.
  const [signalClearFilters, setSignalClearFilters] = useState<boolean>(false);

  const dialog = useRef<ModalRef>(null);

  const { assetSasToken, fetchAssetSasToken } = useSasToken();
  const { keyword, searchTriggered, setKeyword, triggerSearch } = useSearch();
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const location = useLocation();
  const homepageFilter =
    (location.state as { preselectedFilter?: Filter[] })?.preselectedFilter ??
    null;

  const { addAlert } = useAlert();

  /**
   * Function to trigger a new asset sastoken retrieval.
   */
  const getAssetToken = async () => {
    await fetchAssetSasToken!();
  };

  /**
   * Using searchKeyword.
   * @param searchKeyword The keyword used for searching assets using keyword.
   */
  const getSelectedAssets = async (searchKeyword: string) => {
    //Call the search service to get assets
    const result = await SearchService.byKeyword({
      keyword: searchKeyword
    });
    if (Array.isArray(result)) {
      setSearchedAssets(result);
      setFilteredAssets(result);
    }
  };

  // Used to get the assets when the keyword changes
  useEffect(() => {
    getSelectedAssets(keyword).catch((error: unknown) => {
      console.error("Error fetching assets:", error);
    });

    setCurrentPage(defaultPage);

    /**
     * Fetch Assets and set the loading state for the skeleton shimmer effect.
     */
    const fetchAssets = async () => {
      setIsLoading(true); // Set loading to true before fetching
      try {
        await getSelectedAssets(keyword); // Wait for assets to be fetched
        setCurrentPage(defaultPage); // Reset current page after fetching
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setIsLoading(false); // Set loading to false after operation
      }
    };

    fetchAssets().catch((error: unknown) => {
      console.error("Error fetching assets", error);
    }); // Call the asynchronous function
  }, [searchTriggered]);

  // This useEffect is used to update the current page assets when the current page or items per page changes
  useEffect(() => {
    const startIndex = (currentPage - defaultPage) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageAssets(filteredAssets.slice(startIndex, endIndex));
  }, [currentPage, itemsPerPage, filteredAssets]);

  useEffect(() => {
    setCurrentPage(defaultPage);
  }, [itemsPerPage]);

  /**
   * Using id.
   * @param id ID is used to identify and append selected asset id to the url.
   */
  const appendIdToUrlPath = (id: string) => {
    const url = new URL(window.location.href);

    // Only add the ID if it’s not already in the path
    if (!url.pathname.endsWith(`/${id}`)) {
      url.pathname = `${url.pathname}/${id}`;
      window.history.pushState({}, "", url);
    }
  };

  /**
   * Using id.
   * @param id ID is used to identify and open specific asset in a modal.
   */
  const handleClick = (id: string) => {
    setModalState(true);
    dialog.current?.open();
    appendIdToUrlPath(id);
  };

  /**
   * Sorts all the assets according to the option selected by the user.
   * @param option The option used to sort assets.
   */
  const sortAssets = (option: string) => {
    // Sort directly on assets (mutates array for performance)
    searchedAssets.sort((a, b) => {
      switch (option) {
        case "ascending":
          return a.name.localeCompare(b.name);
        case "descending":
          return b.name.localeCompare(a.name);
        case "newest":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        default:
          return 0;
      }
    });

    // This triggers state update to notify React of the changes since we mutated the array itself becuase otherwise it will not re-render
    setSearchedAssets([...searchedAssets]);
  };

  // Append the asset ID to the current URL path

  /**
   * @param id
   */

  // Define your sorting options
  const sortingOptions = [
    { label: "Ascending (A-Z)", value: "ascending" },
    { label: "Descending (Z-A)", value: "descending" },
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" }
  ];

  // Define your sorting options
  const pageOptions = [
    { label: "12", value: 12 },
    { label: "16", value: 16 },
    { label: "20", value: 20 },
    { label: "24", value: 24 }
  ];

  /**
   * This function clears the filters from the sidenav and refreshes the keyword to get all assets.
   */
  const handleClearFiltersClick = () => {
    setSignalClearFilters(prev => !prev);
    setKeyword!("");
    triggerSearch!();
  };

  useEffect(() => {
    getAssetToken().catch((error: unknown) => {
      console.error("Error fetching asset sas token:", error);
    });
  }, [currentPage]);

  return (
    <>
      {/*------ sidebar ---------*/}
      <Modal isOpen={modalState} ref={dialog} setModalState={setModalState}>
        <AssetDetails />
      </Modal>
      <div className="flex min-h-screen w-full flex-col justify-start">
        <div className="px-10">
          <div className="ml-6">
            {/*------ Asset page header ---------*/}
            <div className="mt-3 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-general-10">Assets</h2>
              {currentPageAssets.length !== 0 ? (
                <button
                  className="rounded-lg bg-general-40 px-5 py-2 text-general-10 hover:bg-general-50"
                  onClick={() => {
                    addAlert!({
                      alertMessage:
                        "This feature has not been implemented yet. Please check back later.",
                      alertType: AlertType.Error
                    });
                  }}
                  type="button">
                  Select
                </button>
              ) : null}
            </div>

            {/*------ Sort by ---------*/}
            <div className="mt-1 flex items-center">
              <div className="sm:w-1/6 md:w-1/4 lg:w-44 xl:w-1/6">
                <Dropdown.Root>
                  <Dropdown.Trigger className="flex w-full items-center justify-between text-nowrap rounded-lg bg-general-40 px-4 py-2 text-general-10 hover:bg-general-50 focus:outline-none">
                    {selectedSort ?? "Sort by"}
                    <ChevronDownIcon className="h-6" />
                  </Dropdown.Trigger>
                  <Dropdown.Content className="mt-1 w-full rounded-lg bg-general-40 p-1">
                    {sortingOptions.map(option => (
                      <Dropdown.Item
                        className="w-full cursor-pointer rounded-lg p-2 pr-12 hover:bg-general-50 focus:outline-none"
                        key={option.value}
                        onSelect={() => {
                          setSelectedSort(option.label);
                          sortAssets(option.value);
                        }}>
                        {option.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Content>
                </Dropdown.Root>
              </div>

              {/*------ border ---------*/}
              <span className="my-3 ml-4 w-full justify-end border-b border-yellow-80" />
            </div>

            {/*------ number of results ---------*/}
            <p className="my-4 text-xs text-general-50">
              {filteredAssets.length} results
            </p>
          </div>
          <div className="mx-auto min-w-full p-0">
            {isLoading ? (
              <div className="grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 3xl:text-xl 4xl:gap-12 4xl:text-3xl">
                {[
                  ...Array<number>(
                    Math.min(
                      filteredAssets.length || itemsPerPage,
                      itemsPerPage
                    )
                  )
                ].map(index => (
                  <div
                    className="flex flex-col rounded-lg bg-general-40/20"
                    key={index}>
                    {/* Image shimmer */}
                    <div className="aspect-video w-full animate-pulse rounded-t-lg bg-general-40/40" />

                    {/* Title shimmer */}
                    <div className="h-6 w-full animate-pulse bg-general-40/20" />
                  </div>
                ))}
              </div>
            ) : currentPageAssets.length !== 0 ? (
              <div className="grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 3xl:text-xl 4xl:gap-12 4xl:text-3xl">
                {currentPageAssets.map(asset => (
                  <DisplayCard
                    errorSrc="/assets/NotFoundPreview.webp"
                    key={asset._id?.toString()}
                    onclick={() => {
                      handleClick(asset._id?.toString() ?? "");
                    }}
                    src={
                      asset.previews
                        ? `${asset.previews[0]}?${assetSasToken}`
                        : ""
                    }
                    title={asset.name}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20">
                <div className="text-[3rem] font-bold text-general-40 lg:text-[4rem]">
                  Ooops...No Results Found
                </div>
                <button
                  className="mt-4 rounded-lg border-2 border-yellow-80 bg-yellow-80 px-7 py-2 font-semibold text-general-10"
                  onClick={handleClearFiltersClick}
                  type="button">
                  See All Assets
                </button>
              </div>
            )}
          </div>
        </div>

        {/*------ Sidebar ---------*/}
        <Sidebar
          preselectedFilter={homepageFilter}
          searchedAssets={searchedAssets}
          setFilteredAssets={setFilteredAssets}
          signalClearFilters={signalClearFilters}
        />
        {/*------ Pagination ---------*/}

        <div className="mx-10 flex items-center justify-between py-5">
          <div className="flex items-center space-x-4" id="items-per-page">
            <span className="text-sm font-semibold text-general-10">
              Items per page
            </span>
            <div className="sm:w-1/6 md:w-1/4 lg:w-44 xl:w-1/6">
              <Dropdown.Root>
                <Dropdown.Trigger className="flex items-center justify-between text-nowrap rounded-lg bg-general-40 px-4 py-2 text-general-10 hover:bg-general-50 focus:outline-none lg:w-[45%]">
                  {itemsPerPage}
                  <ChevronDownIcon className="h-6" />
                </Dropdown.Trigger>
                <Dropdown.Content className="mt-1 w-full rounded-lg bg-general-40 p-1">
                  {pageOptions.map(option => (
                    <Dropdown.Item
                      className="w-full cursor-pointer rounded-lg p-2 pr-12 hover:bg-general-50 focus:outline-none"
                      key={option.value}
                      onSelect={() => {
                        setItemsPerPage(option.value);
                      }}>
                      {option.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Content>
              </Dropdown.Root>
            </div>
          </div>
          {/*Div tag for the assets per page box*/}
          <div />
          <Pagination
            currentPage={currentPage}
            defaultPage={defaultPage}
            items={filteredAssets}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
        {/*------ items per page ---------*/}
      </div>
    </>
  );
}
