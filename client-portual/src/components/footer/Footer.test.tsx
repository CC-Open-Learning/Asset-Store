import { fireEvent, render } from "@testing-library/react";

import Footer, { type FooterProps } from "./Footer";
import { useLocation } from "react-router-dom";

const defaultFooterProps: FooterProps = {
  alt: "Footer Image",
  errorSrc: "/assets/NotFoundPreview.webp",
  footerClassName:
    "bg-general-40 mt-auto flex h-10 w-full items-center justify-end",
  imgClassName: "mx-auto h-full",
  src: "/assets/varlab_logo_transparent.png"
};

vi.mock<typeof import("react-router-dom")>("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useLocation: vi.fn()
}));

describe("footer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLocation).mockReturnValue({
      hash: "",
      key: "default",
      pathname: "/asset",
      search: "",
      state: null
    });
  });

  test("renders with default props", () => {
    expect.assertions(6);

    const { container } = render(<Footer />);

    // Get the footer element directly by HTML tag
    const footerElement = container.querySelector("footer");

    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass(defaultFooterProps.footerClassName!);

    // Get the img element directly from the footer element
    const imgElement = footerElement?.querySelector("img");

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveClass(defaultFooterProps.imgClassName!);
    expect(imgElement).toHaveAttribute("src", defaultFooterProps.src!);
    expect(imgElement).toHaveAttribute("alt", defaultFooterProps.alt!);
  });

  test("renders with custom props", () => {
    expect.assertions(6);

    const customProps: FooterProps = {
      alt: "Custom Alt Text",
      errorSrc: "/assets/fallback_image.png",
      footerClassName: "custom-footer-class",
      imgClassName: "custom-img-class",
      src: "/assets/varlab_logo_transparent.png"
    };

    const { container } = render(<Footer {...customProps} />);

    const footerElement = container.querySelector("footer");

    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass(customProps.footerClassName!);

    const imgElement = footerElement?.querySelector("img");

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveClass(customProps.imgClassName!);
    expect(imgElement).toHaveAttribute("src", customProps.src!);
    expect(imgElement).toHaveAttribute("alt", customProps.alt!);
  });

  test("renders with custom props and no src", () => {
    expect.assertions(6);

    const customProps: FooterProps = {
      alt: "Footer Image Test",
      footerClassName: "test-footer-class",
      imgClassName: "test-img-class"
    };

    const { container } = render(<Footer {...customProps} />);

    const footerElement = container.querySelector("footer");

    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass(customProps.footerClassName!);

    const imgElement = footerElement?.querySelector("img");

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveClass(customProps.imgClassName!);
    expect(imgElement).toHaveAttribute("src", defaultFooterProps.src!);
    expect(imgElement).toHaveAttribute("alt", customProps.alt!);
  });

  test("renders with custom props and no alt", () => {
    expect.assertions(6);

    const customProps: FooterProps = {
      footerClassName: "test-footer-class",
      imgClassName: "test-img-class",
      src: "/assets/varlab_logo_transparent.png"
    };

    const { container } = render(<Footer {...customProps} />);

    const footerElement = container.querySelector("footer");

    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass(customProps.footerClassName!);

    const imgElement = footerElement?.querySelector("img");

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveClass(customProps.imgClassName!);
    expect(imgElement).toHaveAttribute("src", customProps.src!);
    expect(imgElement).toHaveAttribute("alt", defaultFooterProps.alt!);
  });

  test("uses errorSrc when image fails to load defaultProps", () => {
    expect.assertions(3);

    const { container } = render(<Footer />);

    const imgElement = container.querySelector("img");

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute("src", defaultFooterProps.src!);

    // Simulate image loading error
    fireEvent.error(imgElement!);

    // Check if errorSrc is applied as the new src on error
    expect(imgElement).toHaveAttribute("src", defaultFooterProps.errorSrc!);
  });

  test("uses errorSrc when image fails to load", () => {
    expect.assertions(3);

    const customProps: FooterProps = {
      errorSrc: "/assets/NotFoundPreview.webp"
    };

    const { container } = render(<Footer {...customProps} />);

    const imgElement = container.querySelector("img");

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute("src", defaultFooterProps.src!);

    // Simulate image loading error
    fireEvent.error(imgElement!);

    // Check if errorSrc is applied as the new src on error
    expect(imgElement).toHaveAttribute("src", customProps.errorSrc!);
  });
});
