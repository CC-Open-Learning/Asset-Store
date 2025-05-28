import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Icons from "../../assets/icons/Icons";
import UserService from "../../services/user/UserService";
import ProjectManagement from "./sections/project-management/ProjectManagement";
import UploadAsset from "./sections/upload-asset/UploadAsset";
import UserManagement from "./sections/user-management/UserManagement";

/**
 * Admin page helps the admin to navigate to different sections of the Admin Panel.
 */
export default function AdminPage() {
  const [selectedSection, setSelectedSection] = useState("User Management");
  const navigate = useNavigate();

  const sections = [
    {
      icon: Icons.UserManagementIcon,
      id: "UserManagement",
      title: "User Management"
    },
    {
      icon: Icons.ProjectManagementIcon,
      id: "ProjectManagement",
      title: "Project Management"
    },
    {
      icon: Icons.UploadAssetIcon,
      id: "UploadAsset",
      title: "Upload Asset"
    }
  ];

  /**
   * Performs a redundant server-side verification of admin privileges.
   * This serves as an additional security layer beyond client-side checks
   * to ensure only authenticated administrators can access admin features.
   * If verification fails, redirects to unauthorized page.
   * @async
   * @throws {Error} Redirects to unauthorized page if admin verification fails.
   * @returns {Promise<void>}
   */
  const checkAdmin = async () => {
    const result = await UserService.getUserProfile();
    if (result.role !== "admin") {
      navigate("/unauthorized");
    }
  };

  useEffect(() => {
    checkAdmin().catch((error: unknown) => {
      console.error("Error fetching user profile:", error);
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-screen-xl px-10">
      <div className="mb-7 mt-3 flex flex-row justify-center gap-12">
        {sections.map(section => (
          <button
            className="group w-40 rounded-md bg-general-40 px-5 py-3"
            key={section.id}
            onClick={() => {
              setSelectedSection(section.title);
            }}
            type="button">
            <div className="flex justify-center">
              <div className="flex justify-center rounded-full bg-general-90 p-[0.6rem] transition-colors duration-200">
                {section.icon(selectedSection === section.title)}
              </div>
            </div>
            <p
              className={`pt-2 text-xs font-semibold group-hover:text-yellow-80 ${
                selectedSection === section.title
                  ? "text-yellow-80"
                  : "text-general-10"
              }`}>
              {section.title}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-row justify-center border border-yellow-80" />

      <div>
        {selectedSection === "User Management" ? (
          <UserManagement />
        ) : selectedSection === "Project Management" ? (
          <ProjectManagement />
        ) : (
          <UploadAsset />
        )}
      </div>
    </div>
  );
}
