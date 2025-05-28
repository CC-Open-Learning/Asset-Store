import { fireEvent, render, screen } from "@testing-library/react";

import type { DisplayCardProps } from "./DisplayCard";
import DisplayCard from "./DisplayCard"; // Adjust the import path

describe("displayCard", () => {
  const defaultProps: DisplayCardProps = {
    buttonStyling:
      "mobile:h-[20vh] bg-general-40 3xl:rounded-2xl flex w-full flex-col overflow-clip rounded-lg",
    errorSrc: "/asset/NotFoundPreview.webp",
    imgStyling:
      "border-general-40 flex aspect-video size-full flex-grow items-center justify-center border bg-contain object-cover",
    // eslint-disable-next-line jsdoc/require-jsdoc
    onclick: () => {},
    src: "/asset/NotFoundPreview.webp",
    title: "Not Found",
    titleStyling:
      "3xl:h-8 4xl:h-12 text-general-10 ml-2 flex h-6 w-[95%] items-center truncate"
  };

  test("renders with default props", () => {
    expect.assertions(6);

    const { container } = render(<DisplayCard />);

    // Check if custom classes are applied to the button, image, and div
    const displayCardElement = container.querySelector("#display-card");

    expect(displayCardElement).toBeInTheDocument();
    expect(displayCardElement).toHaveClass(defaultProps.buttonStyling!);

    const imgElement = container.querySelector("img");

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveClass(defaultProps.imgStyling!);

    const titleElement = container.querySelector("#display-card-title");

    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass(defaultProps.titleStyling!);
  });

  test("fires onclick when clicked", () => {
    expect.assertions(1);

    const mockOnClick = vi.fn();
    const { container } = render(
      <DisplayCard {...defaultProps} onclick={mockOnClick} />
    );

    // Find the button and click it
    const button = container.querySelector("#display-card")!;
    fireEvent.click(button);

    // Check if the mockOnClick function was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("displays fallback image when onError is triggered", () => {
    expect.assertions(3);

    const fallbackImageUrl = "https://example.com/fallback.jpg";
    const { container } = render(
      <DisplayCard
        {...defaultProps}
        errorSrc={fallbackImageUrl}
        src="invalid-image-url"
      />
    );

    const displayCardElement = container.querySelector("#display-card");

    expect(displayCardElement).toBeInTheDocument();

    const imgElement = container.querySelector("img")!;

    expect(imgElement).toBeInTheDocument();

    // Trigger the error by firing an error event on the image element
    fireEvent.error(imgElement);

    // Check if the fallback image URL is used
    expect(imgElement).toHaveAttribute("src", fallbackImageUrl);
  });

  test("applies custom styling if provided", () => {
    expect.assertions(7);

    const customStyling = {
      button:
        "flex flex-col w-full mobile:h-[20vh] bg-general-40 rounded-lg 3xl:rounded-2xl overflow-clip group hover:text-yellow-80 transition-colors duration-200",
      img: "border-general-40 flex aspect-video size-full flex-grow items-center justify-center border bg-contain object-cover",
      title:
        "3xl:h-8 4xl:h-12 text-general-10 ml-2 flex h-6 w-[95%] items-center truncate"
    };

    const { container } = render(
      <DisplayCard
        {...defaultProps}
        buttonStyling={customStyling.button}
        imgStyling={customStyling.img}
        titleStyling={customStyling.title}
      />
    );

    // Check if custom classes are applied to the button, image, and div
    const displayCardElement = container.querySelector("#display-card");

    expect(displayCardElement).toBeInTheDocument();

    const buttonElement = container.querySelector("button");

    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass(customStyling.button);

    const imgElement = container.querySelector("img");

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveClass(customStyling.img);

    const titleElement = container.querySelector("#display-card-title");

    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass(customStyling.title);
  });

  test("if default styling is applied when only one element from the Style is pass in", () => {
    expect.assertions(4);

    const customStyling = {
      button:
        "flex flex-col w-full mobile:h-[20vh] bg-general-40 rounded-lg 3xl:rounded-2xl overflow-clip group hover:text-yellow-80 transition-colors duration-200"
    };

    render(
      <DisplayCard {...defaultProps} buttonStyling={customStyling.button} />
    );

    // Check if custom classes are applied to the button, image, and div
    const button = screen.getByRole("button");
    const img = screen.getByRole("img");
    const title = document.querySelector("#display-card-title");

    expect(button).toHaveClass(customStyling.button);
    expect(img).toHaveClass(defaultProps.imgStyling!);
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass(defaultProps.titleStyling!);
  });
});
