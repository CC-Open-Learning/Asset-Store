import { createPortal } from "react-dom";

import Icons from "../../assets/icons/Icons";
import useAlert from "../../hooks/alert/useAlert";
import { AlertType } from "../../store/contexts/alert/AlertContext";

/**
 * A component that displays an alert box with a message.
 * Always appears at the bottom-right of the screen and on top of all elements.
 */
export default function AlertBox() {
  const { alerts, removeAlert } = useAlert();

  const alertContainer = document.getElementById("alert");

  if (!alertContainer || !alerts || alerts.length === 0) {
    // Do not render the component if the container is missing or alerts are not available yet
    return null;
  }

  return createPortal(
    <>
      {[...alerts].reverse().map((alert, index) => {
        const isSuccess = alert.alertType === AlertType.Success;

        return (
          <div
            className={`fixed bottom-4 right-4 z-[150] flex items-center gap-3 rounded-full p-4 shadow-2xl ${
              isSuccess
                ? "bg-green-10 text-general-40"
                : "bg-red-10 text-general-40"
            }`}
            id={`alert-${String(alert.id)}`}
            key={alert.id}
            // This doesn't work in Tailwind unless you trigger a rerender which is unwanted here
            style={{
              // Tailwind-style spacing (1.5rem = 6, index * 4 = 16px per index)
              bottom: `${String(1.5 + index * 4)}rem`
            }}>
            <div className="flex size-6 items-center justify-center rounded-full">
              {isSuccess ? Icons.CheckMark : Icons.CrossMark}
            </div>
            <span className="mr-5 font-bold text-general-40" id="alert-message">
              {alert.alertMessage}
            </span>
            <button
              className="absolute right-0 m-2 inline-flex items-center justify-center rounded-md text-gray-300 hover:text-gray-500"
              id="alert-close-button"
              onClick={() => {
                removeAlert!(alert.id);
              }}
              type="button">
              <span className="sr-only" />
              {Icons.Exit}
            </button>
          </div>
        );
      })}
    </>,
    alertContainer
  );
}
