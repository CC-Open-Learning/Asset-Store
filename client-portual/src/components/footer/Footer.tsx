import { useState } from "react";
import { useLocation } from "react-router-dom";

export interface FooterProps {
  alt?: string;
  errorSrc?: string;
  footerClassName?: string;
  imgClassName?: string;
  src?: string;
}

/**
 * Footer component that renders a footer section with a background color,
 * positioned at the bottom of the page. The footer contains an image
 * that is centered horizontally.
 * @param {FooterProps} [FooterProps] The props for the Footer component.
 * @param {string} [FooterProps.src] Optional path to the footer image. Defaults to the VarLab logo.
 * @param {string} [FooterProps.alt] Optional alt text for the footer image. Defaults to "Footer Image".
 * @param {string} [FooterProps.footerClassName] Optional class name for footer styling, replacing default styles if provided.
 * @param {string} [FooterProps.imgClassName] Optional class name for image styling, replacing default styles if provided.
 * @example
 * // Usage in a React component
 * return (
 *   <Footer
 *     src="/path/to/image.jpg"
 *     errorSrc = "/path/to/error.jpg"
 *     alt="Custom Alt Text"
 *     footerClassName="custom-footer-style"
 *     imgClassName="custom-img-style"
 *   />
 * )
 * @returns The Footer component.
 */
export default function Footer({
  alt = "Footer Image",
  errorSrc = "/assets/NotFoundPreview.webp",
  footerClassName = "bg-general-40 mt-auto flex h-10 w-full items-center justify-end",
  imgClassName = "mx-auto h-full",
  src = "/assets/varlab_logo_transparent.png"
}: FooterProps) {
  const [error, setError] = useState(false);
  const location = useLocation();

  if (location.pathname !== "/login") {
    return (
      <footer className={footerClassName}>
        <img
          alt={alt}
          className={imgClassName}
          draggable="false"
          onError={e => {
            if (!error) {
              setError(true);
              (e.target as HTMLImageElement).src = errorSrc;
            }
          }}
          src={src}
        />
      </footer>
    );
  }
}
