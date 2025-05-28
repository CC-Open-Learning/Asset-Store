import type { Dispatch, SetStateAction } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

import Icons from "../../assets/icons/Icons";

type Props = {
  children: JSX.Element | JSX.Element[] | string;
  isOpen: boolean;
  setModalState: Dispatch<SetStateAction<boolean>>;
};

export type ModalRef = {
  close: () => void;
  open: () => void;
};
const Modal = forwardRef<ModalRef, Props>(
  ({ children, isOpen, setModalState }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);

    /**
     * Remove the last segment from the URL path (assumes it's the ID).
     */
    const removeIdFromUrlPath = () => {
      const url = new URL(window.location.href);
      const pathSegments = url.pathname.split("/");

      // Remove the last segment if it's an ID (e.g., if it’s numeric or a known pattern)
      if (pathSegments.length > 1 && pathSegments[pathSegments.length - 1]) {
        pathSegments.pop();
        url.pathname = pathSegments.join("/");
        window.history.pushState({}, "", url);
      }
    };

    /**
     * Closes the modal.
     */
    const handleClose = () => {
      if (modalRef.current) {
        modalRef.current.style.display = "none";
      }
      setModalState(false);
      if (location.pathname.includes("/asset")) {
        removeIdFromUrlPath();
      }
    };

    useEffect(() => {
      if (modalRef.current) {
        if (isOpen) {
          document.body.classList.add("overflow-hidden");
          modalRef.current.style.display = "block";
        } else {
          setModalState(false);
          modalRef.current.style.display = "none";
        }
      }
      return () => {
        document.body.classList.remove("overflow-hidden");
      };
    }, [isOpen, setModalState]);

    if (isOpen) {
      return createPortal(
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-auto bg-white bg-opacity-30 backdrop-blur-sm backdrop-brightness-[0.5]"
          id="ModelParent">
          <div
            className="focus: relative size-4/5 overflow-auto rounded-lg bg-general-90 bg-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] outline-none"
            ref={modalRef}>
            <button
              className="fixed right-[10%] top-[10%] p-2 pr-5 text-general-10 hover:text-gray-500"
              onClick={handleClose}
              type="button">
              <span className="sr-only">Close menu</span>
              {Icons.Exit}
            </button>
            <div className="size-full" id="ModalChild">
              {children}
            </div>
          </div>
        </div>,
        document.getElementById("modal")!
      );
    }
  }
);

export default Modal;
