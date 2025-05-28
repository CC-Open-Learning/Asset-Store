import { fireEvent, render, waitFor } from "@testing-library/react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import "react-slick";

import type { DisplayCardProps } from "../../components/display-card/DisplayCard";
import useAlert from "../../hooks/alert/useAlert";
import useSasToken from "../../hooks/sastoken/useSasToken";
import useSearch from "../../hooks/search/useSearch";
import SearchService from "../../services/search/SearchService";
import HomePage from "./HomePage";

vi.mock("../../components/display-card/DisplayCard", () => {
  return {
    default: vi.fn(
      ({
        buttonStyling = "button-styling",
        errorSrc = "error-src",
        imgStyling = "img-styling",
        onclick = vi.fn(),
        src = "src",
        title = "title",
        titleStyling = "title-styling"
      }: DisplayCardProps) => {
        // Mock component rendering
        return (
          <div className={imgStyling} id="mock-display-card">
            <img
              alt={title}
              draggable="false"
              id="mock-display-card-img"
              src={src || errorSrc}
            />
            <h3 className={titleStyling} id="mock-display-card-title">
              {title}
            </h3>
            {onclick ? (
              <button
                className={buttonStyling}
                id="mock-display-card-button"
                onClick={onclick}
                type="button">
                Click
              </button>
            ) : null}
          </div>
        );
      }
    )
  };
});

// Service Mocks

vi.mock("../../services/projects/ProjectsService", () => ({
  default: {
    getSasToken: vi.fn()
  }
}));
vi.mock("../../services/search/SearchService", () => ({
  default: {
    byId: vi.fn(),
    byKeyword: vi.fn(),
    getAllProjects: vi.fn()
  }
}));

// Hook Mocks

vi.mock("../../hooks/search/useSearch", () => ({
  default: vi.fn().mockReturnValue({
    keyword: "",
    setKeyword: vi.fn(),
    setShowSearchBar: vi.fn(),
    showSearchBar: false
  })
}));
vi.mock("../../hooks/sastoken/useSasToken", () => ({
  default: vi.fn().mockReturnValue({
    assetSasToken: "",
    fetchAssetSasToken: vi.fn(),
    fetchProjectSasToken: vi.fn(),
    projectSasToken: ""
  })
}));
vi.mock("../../hooks/alert/useAlert", () => ({
  default: vi.fn().mockReturnValue({
    setAlertMessage: vi.fn(),
    setAlertType: vi.fn(),
    setShowAlertBox: vi.fn()
  })
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: vi.fn()
}));

vi.mock("../../components/3d/ambulance3d/Ambulance3D", () => ({
  default: vi.fn(() => <div id="ambulance-3d" />)
}));

describe("homePage Component", () => {
  beforeAll(() => {});

  describe("homePage Component", () => {
    const mockFetchProjectSasToken = vi
      .fn()
      .mockResolvedValue("dummy-sas-token");
    const mockProjectSasToken = "dummy-sas-token";
    const setKeywordMock = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
      // Reset all mocks before each test
      vi.clearAllMocks();

      // Configure SearchService mock
      vi.mocked(SearchService.getAllProjects).mockResolvedValue([
        {
          _id: "1",
          image: "project-one.png",
          name: "Project One"
        },
        {
          _id: "2",
          image: "project-two.png",
          name: "Project Two"
        },
        {
          _id: "3",
          image: "project-three.png",
          name: "Project Three"
        }
      ]);

      // Mock useSasToken to return the necessary context values
      vi.mocked(useSasToken).mockReturnValue({
        assetSasToken: "",
        fetchAssetSasToken: undefined,
        fetchProjectSasToken: mockFetchProjectSasToken,
        projectSasToken: mockProjectSasToken
      });

      vi.mocked(useAlert).mockReturnValue({
        addAlert: vi.fn(),
        alerts: [],
        removeAlert: vi.fn()
      });

      vi.mocked(useSearch).mockReturnValue({
        keyword: "",
        searchTriggered: 0,
        setKeyword: setKeywordMock,
        setShowSearchBar: vi.fn(),
        showSearchBar: false,
        triggerSearch: vi.fn()
      });

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    });

    test("handleProjectClick navigates to /asset with preselected filter", async () => {
      expect.assertions(6);

      const { container } = render(<HomePage />);

      await waitFor(() => {
        expect(SearchService.getAllProjects).toHaveBeenCalledTimes(1);
      });

      const slider = container.querySelector("#project-section");

      expect(slider).toBeInTheDocument();

      expect(slider!.querySelector("#project-1")).toBeInTheDocument();

      const projectCard = slider!.querySelector("#project-1");

      // Slider Mocking causing issues

      expect(projectCard).toBeInTheDocument();

      // Simulate click event
      fireEvent.click(projectCard!);

      // Assertions
      expect(setKeywordMock).toHaveBeenCalledWith("");
      expect(mockNavigate).toHaveBeenCalledWith("/asset", {
        state: {
          preselectedFilter: [
            {
              id: "1",
              name: "Project One"
            }
          ]
        }
      });
    });

    test("should navigate to asset page with keyword set to empty string", async () => {
      expect.assertions(3);

      const { container } = render(<HomePage />, { wrapper: BrowserRouter });

      // Wait for #banner-section to appear
      await waitFor(() => {
        const banner = container.querySelector("#banner-section");

        expect(banner).toBeInTheDocument();
      });

      //Grab the see all assets button
      const seeAllAssets = container.querySelector("#see-all-assets");
      fireEvent.click(seeAllAssets!);

      // Assertions
      expect(setKeywordMock).toHaveBeenCalledWith("");
      expect(mockNavigate).toHaveBeenCalledWith("/asset", {
        state: {
          preselectedFilter: null
        }
      });
    });
  });
});
