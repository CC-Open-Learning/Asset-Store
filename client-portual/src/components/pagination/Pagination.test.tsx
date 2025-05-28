import { fireEvent, render } from "@testing-library/react";

import Pagination, { type PaginationProps } from "./Pagination";

// Creating mock to update currentPage function on page click
const mockSetCurrentPage = vi.fn();

// Passing dummy values to default props for testing
const defaultPaginationProps: PaginationProps = {
  currentPage: 1,
  defaultPage: 1,
  items: [
    "item1",
    "item2",
    "item3",
    "item4",
    "item5",
    "item6",
    "item7",
    "item8",
    "item9",
    "item10"
  ],
  itemsPerPage: 3,
  setCurrentPage: mockSetCurrentPage
};

// Calculating total number of pages based on total items and items per page
const totalPages = Math.ceil(
  defaultPaginationProps.items.length / defaultPaginationProps.itemsPerPage
);

describe("pagination Component", () => {
  // 1. Testing the rendering of Pagination Component

  test("renders with default props", () => {
    expect.assertions(2);

    const { getByRole } = render(<Pagination {...defaultPaginationProps} />);

    const pagination = getByRole("navigation");

    expect(pagination).toBeInTheDocument();
    expect(pagination).toHaveClass("react-paginate");
  });

  // 2. Testing the correct number of page links.

  test("displays the correct number of page links", () => {
    expect.assertions(2);

    const { container } = render(<Pagination {...defaultPaginationProps} />);

    const numOfPages = container.querySelectorAll("li.page-item");

    expect(numOfPages).toBeDefined();
    expect(numOfPages).toHaveLength(totalPages);
  });

  // 3. Testing the correct page number when a page is clicked.

  test("calls setCurrentPage with correct page number on page click", () => {
    expect.assertions(1);

    const randomNum = 2;
    const { getByText } = render(<Pagination {...defaultPaginationProps} />);

    const pageNumber = getByText(randomNum);
    fireEvent.click(pageNumber);

    expect(mockSetCurrentPage).toHaveBeenCalledWith(randomNum);
  });

  // 4. Testing the disabled previous button on the first page

  test("disables the previous button on the first page", () => {
    expect.assertions(2);

    const firstPage = 1;
    const { container } = render(
      <Pagination {...defaultPaginationProps} currentPage={firstPage} />
    );

    const previousButton = container.querySelector(
      '[aria-label="Previous page"]'
    );

    expect(previousButton).toBeInTheDocument();
    expect(previousButton).toHaveAttribute("aria-disabled", "true");
  });

  // 5. Testing the disabled next button on the last page

  test("disables the next button on the last page", () => {
    expect.assertions(2);

    const lastPage = 4;
    const { container } = render(
      <Pagination {...defaultPaginationProps} currentPage={lastPage} />
    );

    const nextButton = container.querySelector('[aria-label="Next page"]');

    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveAttribute("aria-disabled", "true");
  });

  // 6. Update the page when the next button is clicked and when currentPage is not lastPage

  test("updates the page when the next button is clicked", () => {
    expect.assertions(1);

    const randomNum = 2;
    const { container } = render(
      <Pagination {...defaultPaginationProps} currentPage={randomNum} />
    );

    const nextButton = container.querySelector('[aria-label="Next page"]')!;
    fireEvent.click(nextButton);

    expect(mockSetCurrentPage).toHaveBeenCalledWith(randomNum + 1);
  });

  // 7. Update the page when the previous button is clicked and when currentPage is not lastPage/ totalPage

  test("updates the page when the previous button is clicked", () => {
    expect.assertions(1);

    const randomNum = 3;
    const { container } = render(
      <Pagination {...defaultPaginationProps} currentPage={randomNum} />
    );

    const prevButton = container.querySelector('[aria-label="Previous page"]')!;
    fireEvent.click(prevButton);

    expect(mockSetCurrentPage).toHaveBeenCalledWith(randomNum - 1);
  });
});
