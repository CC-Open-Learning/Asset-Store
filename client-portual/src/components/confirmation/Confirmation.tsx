import "./Confirmation.css";

import { createPortal } from "react-dom";

import Icons from "../../assets/icons/Icons";
import useConfirmation from "../../hooks/confirmation/useConfirmation";
import UtilService from "../../services/util/UtilService";

interface ConfirmationProps {
  onConfirm: () => void;
}

/**
 * Displays a confirmation modal for deleting an asset, project, or user.
 * @param ConfirmationProps This is Confirmation Props.
 * @param ConfirmationProps.onConfirm The function to be called when the confirmation is confirmed.
 */
export default function Confirmation({ onConfirm }: ConfirmationProps) {
  const { confirmationDetails, setConfirmationDetails } = useConfirmation();

  const confirmationContainer = document.getElementById("confirmation");

  // Do not render the component if the container is missing or details are not available
  if (
    !confirmationContainer ||
    !confirmationDetails?.elementType ||
    !confirmationDetails?.elementName
  )
    return null;

  /**
   * Handles the confirmation of the deletion.
   */
  const handleConfirm = () => {
    onConfirm();
    setConfirmationDetails!({
      elementId: undefined,
      elementName: undefined,
      elementType: undefined
    });
  };

  /**
   * Handles the cancellation of the deletion.
   */
  const handleCancel = () => {
    setConfirmationDetails!({
      elementId: undefined,
      elementName: undefined,
      elementType: undefined
    });
  };

  return createPortal(
    <div className="confirmation-modal">
      <div
        className="confirmation-dialog"
        onClick={e => {
          e.stopPropagation();
        }}>
        {Icons.DangerIconV2("currentColor", "#B00020")}
        <h2>
          Delete{" "}
          {UtilService.capitalizeFirstLetter(confirmationDetails?.elementType)}
        </h2>
        <p>
          You are going to delete the &quot;{confirmationDetails?.elementName}
          &quot; {confirmationDetails?.elementType}.
        </p>
        <p>Are you sure?</p>
        <div className="confirmation-buttons">
          <button
            className="confirmation-cancel"
            onClick={handleCancel}
            type="button">
            No, Keep it
          </button>
          <button
            className="confirmation-confirm"
            onClick={handleConfirm}
            type="button">
            Yes, Delete!
          </button>
        </div>
      </div>
    </div>,
    confirmationContainer
  );
}
