import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Icons from "../../assets/icons/Icons";
import useAlert from "../../hooks/alert/useAlert";
import { useUser } from "../../hooks/user/useUser";
import UserService from "../../services/user/UserService";
import { AlertType } from "../../store/contexts/alert/AlertContext";

/**
 * A user panel that displays information about the current user, including their name and email.
 * It provides links to the admin panel (only accessible to users with the "admin" role) - is not implemented yet.
 * It allows the user to toggle dark mode on and off - is not implemented yet.
 * The user can also log out from this panel.
 * @param {object} props The component props.
 * @param {Function} [props.closePanel] Optional function to close the user panel.
 * @returns A JSX element representing the user panel.
 */
export default function UserPanel({ closePanel }: { closePanel?: () => void }) {
  const [isChecked, setIsChecked] = useState(true);
  const { setIsLoggedIn, user } = useUser();
  const { addAlert } = useAlert();
  const navigate = useNavigate();

  /**
   *  Handles the change event of the checkbox.
   */
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    addAlert!({
      alertMessage:
        "This feature has not been implemented yet. Please check back later.",
      alertType: AlertType.Error
    });
  };

  /**
   * This handles the logout event when the logout button is clicked.
   */
  const handleLogout = (): void => {
    UserService.logout()
      .then(() => {
        addAlert!({
          alertMessage: "Logged out successfully.",
          alertType: AlertType.Success
        });
        setIsLoggedIn(false);
      })
      .catch(() => {
        addAlert!({
          alertMessage: "Unexpected Error.",
          alertType: AlertType.Error
        });
      });
  };

  return (
    <div
      className="absolute right-0 mt-2 overflow-clip rounded-2xl border-2 bg-general-90 shadow-lg"
      id="user-panel">
      <div className="flex items-center px-4 py-3">
        <div>
          <p className="font-bold text-yellow-80" id="username">
            {user?.username}
          </p>
          <p className="text-xs text-general-10" id="user-email">
            {user?.email}
          </p>
        </div>
      </div>
      <div id="user-panel-options">
        {/* ----------------------------- Admin Button ----------------------------- */}
        {user?.role === "admin" && (
          <button
            className="flex w-full items-center px-4 py-3 text-general-10 hover:text-yellow-80"
            onClick={() => {
              navigate("/admin");
              //Close user panel on button click
              closePanel?.();
            }}
            type="button">
            <div className="mr-3 flex items-center justify-center">
              {Icons.AdminPanel}
            </div>
            <p>Admin Panel</p>
          </button>
        )}

        {/* ----------------------------- Dark Mode ----------------------------- */}
        <div className="flex w-full items-center px-4 pb-3 text-general-10">
          <div className="mr-3 flex items-center justify-center">
            {Icons.DarkMode}
          </div>
          <p>Dark Mode</p>
          <label className="relative ml-9 h-5 w-11 rounded-full bg-general-40">
            <input
              aria-label="theme"
              checked={isChecked}
              className="peer sr-only hover:cursor-pointer"
              id="theme-checkbox"
              onChange={() => {
                handleCheckboxChange();
              }}
              type="checkbox"
            />
            <span className="absolute left-0.5 top-0.5 h-4/5 w-2/5 cursor-pointer rounded-full bg-general-50 transition-all peer-checked:left-6 peer-checked:bg-yellow-80" />
          </label>
        </div>

        {/* ----------------------------- Log Out ----------------------------- */}
        <button
          className="flex w-full items-center px-4 py-3 text-general-10 hover:text-yellow-80"
          id="logout-button"
          onClick={handleLogout}
          type="button">
          <div className="mr-3 flex items-center justify-center">
            {Icons.LogOut}
          </div>
          <p>Log Out</p>
        </button>
      </div>
      <div />
    </div>
  );
}
