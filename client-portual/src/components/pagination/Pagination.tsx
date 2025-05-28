import ReactPaginate from "react-paginate";

import Icons from "../../assets/icons/Icons";

export interface PaginationProps {
  currentPage: number;
  defaultPage: number;
  items: unknown[];
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
}

/**
 * A React component for pagination that displays a series of page numbers
 * and allows the user to jump to any page by clicking on the page number.
 * The component also displays arrow icons for navigating between pages.
 * @param PaginationProps This is Pagination Props.
 * @param PaginationProps.items The total number of items.
 * @param PaginationProps.itemsPerPage The number of items per page.
 * @param PaginationProps.currentPage The current page number.
 * @param PaginationProps.setCurrentPage A function to set the current page number.
 * @param PaginationProps.defaultPage
 * @returns {ReactElement} - The React component for pagination.
 */
export default function Pagination({
  currentPage,
  defaultPage,
  items,
  itemsPerPage,
  setCurrentPage
}: PaginationProps) {
  // Default page to navigate back when items-per-page is changed

  // Total number of pages
  const pageCount = Math.ceil(items.length / itemsPerPage);

  // Jump to selected page using selected page number (+1 referencing to 0 index)

  /**
   * These event params are used for page click.
   * @param event Event is used to perform some function on page click event.
   * @param event.selected Event.selected shows the current index of the page (starting with zero).
   */
  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + defaultPage);
  };

  return (
    <div className="flex justify-center" id="react-paginate">
      {/* React Paginate component */}
      {pageCount > defaultPage && (
        <ReactPaginate
          activeLinkClassName="bg-yellow-80 text-general-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          breakClassName="flex bottom-0 px-[5px] pt-[15px] text-xs font-semibold text-general-10"
          breakLabel="..."
          className="react-paginate flex items-center justify-center"
          containerClassName="isolate inline-flex rounded-md shadow-sm"
          disabledClassName="text-[#4c4c4f] cursor-not-allowed hover:text-[#4c4c4f]"
          forcePage={currentPage - defaultPage}
          marginPagesDisplayed={2}
          nextClassName="text-general-40 hover:text-general-10"
          nextLabel={Icons.ArrowRight}
          onPageChange={handlePageClick}
          pageClassName="page-item"
          pageCount={pageCount}
          pageLinkClassName="bg-general-40 text-general-10 rounded-lg flex justify-center items-center mx-[4px] px-[7px] md:px-[10px] lg:px-[15px] xl:px-[17px] 2xl:px-[18px] py-[4px] text-xs sm:text-sm md:text-md lg:text-lg 2xl:text-xl font-semibold hover:bg-gray-50 hover:text-black focus:z-20 focus:outline-offset-0"
          pageRangeDisplayed={3}
          previousClassName="text-general-40 hover:text-general-10"
          previousLabel={Icons.ArrowLeft}
        />
      )}
    </div>
  );
}
