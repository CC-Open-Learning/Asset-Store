import { useState } from "react";

export interface DisplayCardProps {
  buttonStyling?: string;
  errorSrc?: string;
  imgStyling?: string;
  onclick?: () => void;
  src?: string;
  title?: string;
  titleStyling?: string;
}

/**
 * Display card component for displaying images with titles.
 * @param {Props} Props Props for the component.
 * @param {string} Props.buttonStyling Styling for the button.
 * @param {string} Props.titleStyling Styling for the div containing the title.
 * @param {string} Props.imgStyling Styling for the image.
 * @param {string} Props.src Image url.
 * @param {string} Props.onclick Onclick method for display card usually used for navigation.
 * @param {string} Props.title Title of the display card component.
 * @param {string} Props.errorSrc Fall back image source when the image fails to load.
 */
export default function DisplayCard({
  buttonStyling = "mobile:h-[20vh] bg-general-40 3xl:rounded-2xl flex w-full flex-col overflow-clip rounded-lg",
  errorSrc = "/asset/NotFoundPreview.webp",
  imgStyling = "border-general-40 flex aspect-video size-full flex-grow items-center justify-center border bg-contain object-cover rounded-t-lg",
  onclick = undefined,
  src = "/asset/NotFoundPreview.webp",
  title = "Not Found",
  titleStyling = "3xl:h-8 4xl:h-12 text-general-10 ml-2 flex h-6 w-[95%] items-center truncate"
}: DisplayCardProps) {
  const [error, setError] = useState(false);

  return (
    <button
      className={buttonStyling}
      id="display-card"
      onClick={onclick}
      type="submit">
      <img
        alt={title}
        className={imgStyling}
        draggable="false"
        onError={e => {
          if (!error) {
            setError(true);
            (e.target as HTMLImageElement).src = errorSrc;
          }
        }}
        src={src}
      />
      <div className={titleStyling} id="display-card-title">
        {title}
      </div>
    </button>
  );
}
