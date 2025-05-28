import "../../AdminPage.css";

/* eslint-disable react/forbid-component-props */
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useEffect, useRef, useState } from "react";

import Confirmation from "../../../../components/confirmation/Confirmation";
import type { ModalRef } from "../../../../components/modal/Modal";
import Modal from "../../../../components/modal/Modal";
import Pagination from "../../../../components/pagination/Pagination";
import useAlert from "../../../../hooks/alert/useAlert";
import useConfirmation from "../../../../hooks/confirmation/useConfirmation";
import useSasToken from "../../../../hooks/sastoken/useSasToken";
import ProjectService from "../../../../services/projects/ProjectsService";
import SearchService from "../../../../services/search/SearchService";
import { AlertType } from "../../../../store/contexts/alert/AlertContext";
import { ElementType } from "../../../../store/contexts/confirmation/ConfirmationContext";
import type { Project } from "../../../../types";
import AddProject from "./AddProject";

/**
 * Created ProjectManagement section to view all the projects.
 */
export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { fetchProjectSasToken, projectSasToken } = useSasToken();

  const initialPage = 1;
  const defaultItemsPerPage = 12;

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Modal State
  const [modalState, setModalState] = useState(false);

  const dialog = useRef<ModalRef>(null);
  const { confirmationDetails, setConfirmationDetails } = useConfirmation();
  const { addAlert } = useAlert();

  /**
   * Created ProjectManagement section to view all the projects.
   */
  const handleClick = () => {
    setModalState(true);
  };

  // Define your sorting options
  const pageOptions = [
    { label: "12", value: 12 },
    { label: "16", value: 16 },
    { label: "20", value: 20 },
    { label: "24", value: 24 }
  ];

  /**
   * Function to trigger a new project sastoken retrieval.
   */
  const getProjectToken = async () => {
    if (fetchProjectSasToken) {
      await fetchProjectSasToken();
    }
  };

  useEffect(() => {
    getProjectToken().catch((error: unknown) => {
      console.error("Error fetching project sas token:", error);
    });
  }, []);

  /**
   *This function gets the all the projects using the SearchService.
   */
  const getProjects = async () => {
    //Call the search service to get assets
    const result = await SearchService.getAllProjects();
    if (Array.isArray(result)) {
      setProjects(result);
    }
  };
  useEffect(() => {
    getProjects().catch((error: unknown) => {
      console.error("Error fetching Projects:", error);
    });
  }, []);

  /**
   * Function to handle the deletion of the project.
   */
  const handleDelete = async () => {
    const response = await ProjectService.deleteProject({
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
      {/* --------------------------------- Modal -------------------------------- */}
      <Modal isOpen={modalState} setModalState={setModalState}>
        <AddProject getProjects={getProjects} setModalState={setModalState} />
      </Modal>
      <Confirmation onConfirm={() => void handleDelete()} />
      <div className="mb-10 mt-4 flex-col align-middle">
        <div>
          <button
            className="mb-5 rounded-md bg-yellow-80 px-9 py-2 text-sm font-semibold"
            onClick={handleClick}
            type="button">
            Add Project
          </button>
        </div>
        <table className="table-lg w-full text-center font-normal text-general-10">
          <thead className="border-b-[1.5px] border-general-10 bg-general-40 font-normal">
            <tr className="table-head-row">
              <th className="rounded-tl-lg">Thumbnail</th>
              <th>
                <div className="flex justify-center align-middle">
                  Title <ChevronDownIcon className="w-5 pl-1" />
                </div>
              </th>
              <th className="rounded-tr-lg" />
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr
                className="table-body-row project-section border-b-[1.5px] border-general-10"
                key={project._id.toString()}>
                <td className="px-12">
                  <img
                    alt="project-thumbnail"
                    className="mx-auto w-12 md:w-28 lg:w-40"
                    draggable="false"
                    src={`${project.image}?${projectSasToken}`}
                  />
                </td>
                <td className="px-12">{project.name}</td>
                <td className="px-6">
                  <button
                    className="rounded-md bg-red-90 px-7 py-2 font-bold text-general-100 hover:outline hover:outline-2 hover:outline-general-10"
                    onClick={() => {
                      setConfirmationDetails!({
                        elementId: project._id.toString(),
                        elementName: project.name,
                        elementType: ElementType.project
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
