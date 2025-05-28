import "../../AdminPage.css";

/* eslint-disable react/forbid-component-props */
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Confirmation from "../../../../components/confirmation/Confirmation";
import Pagination from "../../../../components/pagination/Pagination";
import useAlert from "../../../../hooks/alert/useAlert";
import useConfirmation from "../../../../hooks/confirmation/useConfirmation";
import type { UserRolesResponse } from "../../../../services/user/UserService";
import UserService from "../../../../services/user/UserService";
import { AlertType } from "../../../../store/contexts/alert/AlertContext";
import { ElementType } from "../../../../store/contexts/confirmation/ConfirmationContext";

/**
 * This is User Management page.
 */
export default function UserManagement() {
  const defaultPage = 1;
  const defaultUsersPerPage = 12;

  // Pagination States
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage, setItemsPerPage] = useState(defaultUsersPerPage);
  const [allUsers, setAllUsers] = useState<UserRolesResponse[]>([]);
  const navigate = useNavigate();
  const { confirmationDetails, setConfirmationDetails } = useConfirmation();
  const { addAlert } = useAlert();

  /**
   * Fetches and loads all user roles from the server.
   * Updates the allUsers state with the fetched user roles.
   * Requires admin privileges to access the data.
   * @async
   * @throws {Error} Redirects to unauthorized page if admin verification fails.
   * @returns {Promise<void>}
   */
  const loadUsers = async () => {
    try {
      // Still verify admin status server-side
      const userRoles = await UserService.getUserRoles();
      setAllUsers(userRoles);
    } catch {
      // If server verification fails, redirect
      navigate("/unauthorized");
    }
  };

  useEffect(() => {
    loadUsers().catch(() => {
      console.log("Error fetching user roles");
    });
  }, []);

  // Define your sorting options
  const pageOptions = [
    { label: "16", value: 16 },
    { label: "20", value: 20 },
    { label: "24", value: 24 },
    { label: "12", value: 12 }
  ];

  /**
   * Handles the deletion of a user.
   */
  const handleDelete = async () => {
    const response = await UserService.deleteUser({
      id: confirmationDetails!.elementId!
    });
    if (response.success) {
      addAlert!({
        alertMessage: response.message,
        alertType: AlertType.Success
      });
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } else {
      addAlert!({
        alertMessage: response.message,
        alertType: AlertType.Error
      });
    }
  };

  return (
    <>
      <Confirmation onConfirm={() => void handleDelete()} />
      <div className="mb-10 mt-12 flex justify-center">
        <table className="table-lg w-full text-center font-normal text-general-10">
          <thead className="border-b-[1.5px] border-general-10 bg-general-40 font-normal">
            <tr className="table-head-row">
              <th className="rounded-tl-lg">Username</th>
              <th>Email</th>
              <th>Role</th>
              <th className="rounded-tr-lg" />
            </tr>
          </thead>
          <tbody>
            {allUsers.map(user => (
              <tr
                className="table-body-row user-section border-b-[1.5px] border-general-10"
                key={`user-${user.email}` /*username is unique*/}>
                <td className="px-12">{user.username}</td>
                <td className="px-12">{user.email}</td>
                <td className="px-12">{user.role}</td>
                <td className="px-6">
                  {/* ---------------------------- Delete Buttons ---------------------------- */}
                  <button
                    className={`rounded-md px-7 py-2 font-bold text-general-100 hover:outline hover:outline-2 hover:outline-general-10 ${
                      user.username === "admin"
                        ? "cursor-not-allowed bg-general-20"
                        : "bg-red-90"
                    }`}
                    disabled={user.username === "admin"}
                    onClick={() => {
                      setConfirmationDetails!({
                        elementId: user._id,
                        elementName: user.username,
                        elementType: ElementType.user
                      });
                    }}
                    type="button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*------ Pagination and Items-Per-Page ---------*/}
      <div className="flex w-full flex-col justify-start">
        <div className="mx-1 flex items-center justify-between py-5">
          <div className="mb-4 flex items-center space-x-4" id="items-per-page">
            <span className="text-sm font-semibold text-general-10">
              Items per page
            </span>
            <div className="sm:w-1/6 md:w-1/4 lg:w-44 xl:w-1/6">
              <Dropdown.Root>
                <Dropdown.Trigger className="flex items-center justify-between text-nowrap rounded-lg bg-general-40 px-4 py-2 text-general-10 hover:bg-general-50 focus:outline-none lg:w-[45%]">
                  {itemsPerPage}
                  <ChevronDownIcon className="h-6" />
                </Dropdown.Trigger>
                <Dropdown.Content className="mt-1 w-full rounded-lg bg-general-40 p-1">
                  {pageOptions.map(option => (
                    <Dropdown.Item
                      className="w-full cursor-pointer rounded-lg p-2 pr-12 hover:bg-general-50 focus:outline-none"
                      key={option.value}
                      onSelect={() => {
                        setItemsPerPage(option.value);
                      }}>
                      {option.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Content>
              </Dropdown.Root>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            items={56}
            itemsPerPage={9}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
}
