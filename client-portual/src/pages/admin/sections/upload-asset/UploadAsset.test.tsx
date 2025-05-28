import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import useAlert from "../../../../hooks/alert/useAlert";
import AssetService from "../../../../services/asset/AssetService";
import SearchService from "../../../../services/search/SearchService";
import TagsService from "../../../../services/tags/TagsService";
import { AlertType } from "../../../../store/contexts/alert/AlertContext";
import UploadAsset from "./UploadAsset";

// Mock the services
vi.mock("../../../../hooks/alert/useAlert");
vi.mock("../../../../services/asset/AssetService", () => ({
  default: {
    uploadAsset: vi.fn()
  }
}));
vi.mock("../../../../services/tags/TagsService", () => ({
  default: {
    byKeyword: vi.fn()
  }
}));
vi.mock("../../../../services/search/SearchService", () => ({
  default: {
    getAllProjects: vi.fn()
  }
}));

describe("upload Asset Component Rendering", () => {
  const mockAddAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAlert hook
    vi.mocked(useAlert).mockReturnValue({
      addAlert: mockAddAlert,
      alerts: [],
      removeAlert: vi.fn()
    });

    // Mock service responses
    vi.mocked(SearchService.getAllProjects).mockResolvedValue([
      { _id: "1", image: "project-one.png", name: "Project One" },
      { _id: "2", image: "project-two.png", name: "Project Two" },
      { _id: "3", image: "project-three.png", name: "Project Three" }
    ]);

    vi.mocked(AssetService.uploadAsset).mockResolvedValue({
      message: "Success",
      success: "Uploaded"
    });

    vi.mocked(TagsService.byKeyword).mockResolvedValue([
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" }
    ]);
  });

  test("renders without crashing", () => {
    expect.assertions(1);

    const { container } = render(<UploadAsset />);
    const uploadAssetComponent = container.querySelector("#upload-asset");

    expect(uploadAssetComponent).toBeInTheDocument();
  });

  test("handles tag addition from search with sanitization", async () => {
    expect.assertions(3);

    const { container } = render(<UploadAsset />);

    // Search for a tag with invalid characters
    const searchInput = container.querySelector("#tag-search")!;
    fireEvent.change(searchInput, { target: { value: "New Tag 123!" } });

    // Should show error for invalid tag
    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith({
        alertMessage:
          "Tags can only contain lowercase letters, no spaces or special characters",
        alertType: AlertType.Error
      });
    });

    // Try with valid tag
    fireEvent.change(searchInput, { target: { value: "newtag" } });

    // Wait for and click the create tag option
    await waitFor(() => {
      const createOption = container.querySelector(".tag-suggestion");

      expect(createOption).toBeInTheDocument();

      fireEvent.click(createOption!);
    });

    // Verify sanitized tag was added
    const addedTag = container.querySelector(".tag-item");

    expect(addedTag).toHaveTextContent("newtag");
  });

  test("handles project selection", () => {
    expect.assertions(2);

    const { container } = render(<UploadAsset />);

    const projectSelect = container.querySelector("#Project")!;

    expect(projectSelect).toBeInTheDocument();

    fireEvent.change(projectSelect, {
      target: {
        value: JSON.stringify({
          _id: "1",
          image: "project-one.png",
          name: "Project One"
        })
      }
    });

    const projectName = container.querySelector(".project-name");

    expect(projectName).toBeInTheDocument();
  });

  test("handles tag search and suggestions", async () => {
    expect.assertions(3);

    const { container } = render(<UploadAsset />);

    const searchInput = container.querySelector("#tag-search")!;
    fireEvent.change(searchInput, { target: { value: "tag" } });

    await waitFor(() => {});
    const suggestions = container.querySelectorAll(".tag-suggestion");

    expect(suggestions).toHaveLength(3);
    expect(suggestions[0]).toHaveTextContent("Create 'tag'");
    expect(suggestions[1]).toHaveTextContent("tag");
  });

  test("handles file upload", () => {
    expect.assertions(1);

    const { container } = render(<UploadAsset />);

    const fileInput = container.querySelector("#main-file")!;
    const file = new File(["test"], "test.zip", { type: "application/zip" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadedFileName = container.querySelector(".file-name");

    expect(uploadedFileName).toHaveTextContent("test.zip");
  });

  // Add new test for model specs validation
  test("validates model specifications for ZIP files", async () => {
    expect.assertions(1);

    const { container } = render(<UploadAsset />);

    // Fill title
    const titleInput = container.querySelector("#title")!;
    fireEvent.change(titleInput, { target: { value: "Test Asset" } });

    // Upload ZIP file without filling model specs
    const fileInput = container.querySelector("#main-file")!;
    const file = new File(["test"], "test.zip", { type: "application/zip" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form without model specs
    const submitButton = container.querySelector("#submit-button")!;
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith({
        alertMessage: "Model Specifications required",
        alertType: AlertType.Error
      });
    });
  });

  test("handles uploading without the model specifications", async () => {
    expect.assertions(3);

    const { container } = render(<UploadAsset />);

    // Fill title
    const titleInput = container.querySelector("#title")!;

    expect(titleInput).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "Test Asset" } });

    // Upload main file (ZIP)
    const mainFileInput = container.querySelector("#main-file")!;
    const zipFile = new File(["test content"], "test.zip", {
      type: "application/zip"
    });
    fireEvent.change(mainFileInput, { target: { files: [zipFile] } });

    // Wait for and open model specs section
    await waitFor(() => {
      const modelSpecsButton = container.querySelector("#model-specs button");

      expect(modelSpecsButton).toBeInTheDocument();

      fireEvent.click(modelSpecsButton!);
    });

    // Submit form
    const submitButton = container.querySelector("#submit-button")!;
    fireEvent.click(submitButton);

    // Update expectation to match actual behavior
    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith({
        alertMessage: "Model Specifications required",
        alertType: AlertType.Error
      });
    });
  });

  test("shows validation errors for missing required fields during upload", async () => {
    expect.assertions(3);

    const { container } = render(<UploadAsset />);

    // Try to upload without required fields
    const submitButton = container.querySelector("#submit-button")!;
    fireEvent.click(submitButton);

    // Check for title validation
    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith({
        alertMessage: "Title is required",
        alertType: AlertType.Error
      });
    });

    // Add title but try without main file
    const titleInput = container.querySelector("#title")!;
    fireEvent.change(titleInput, { target: { value: "Test Asset" } });
    fireEvent.click(submitButton);

    // Check for main file validation
    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith({
        alertMessage: "Main File is required",
        alertType: AlertType.Error
      });
    });

    // Add ZIP file but try without model specs
    const mainFileInput = container.querySelector("#main-file")!;
    const zipFile = new File(["test content"], "test.zip", {
      type: "application/zip"
    });
    fireEvent.change(mainFileInput, { target: { files: [zipFile] } });
    fireEvent.click(submitButton);

    // Check for model specs validation
    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith({
        alertMessage: "Model Specifications required",
        alertType: AlertType.Error
      });
    });
  });

  // Add test for model specs visibility
  test("shows model specs fields only for ZIP files", () => {
    expect.assertions(2);

    const { container } = render(<UploadAsset />);

    // Initially model specs should be hidden
    let modelSpecsSection = container.querySelector("#model-specs");

    expect(modelSpecsSection).not.toBeInTheDocument();

    // Upload ZIP file
    const fileInput = container.querySelector("#main-file")!;
    const file = new File(["test"], "test.zip", { type: "application/zip" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Now model specs should be visible
    modelSpecsSection = container.querySelector("#model-specs");

    expect(modelSpecsSection).toBeInTheDocument();
  });

  test("successfully uploads asset when all required fields are filled", async () => {
    expect.assertions(4);

    const { container, getByLabelText, getByText } = render(<UploadAsset />);

    // Fill in title
    const titleInput = container.querySelector("#title")!;
    fireEvent.change(titleInput, { target: { value: "Test Asset" } });

    // Upload a ZIP file (triggers model specs visibility)
    const mainFileInput = container.querySelector("#main-file")!;
    const zipFile = new File(["zip content"], "asset.zip", {
      type: "application/zip"
    });
    fireEvent.change(mainFileInput, { target: { files: [zipFile] } });

    // Wait for the Model Specs button to appear and click it
    await waitFor(() => {
      expect(
        container.querySelector("#model-specs button")
      ).toBeInTheDocument();
    });

    fireEvent.click(container.querySelector("#model-specs button")!);

    // Fill in Model Specs fields using label text
    fireEvent.change(getByLabelText("Vertices"), {
      target: { value: "1000" }
    });
    fireEvent.change(getByLabelText("Triangles"), {
      target: { value: "500" }
    });
    fireEvent.change(getByLabelText("Polygons"), {
      target: { value: "250" }
    });
    fireEvent.change(getByLabelText("Rig Type"), {
      target: { value: "IK" }
    });

    // Fill in description
    fireEvent.change(container.querySelector("#description")!, {
      target: { value: "A test asset description" }
    });

    // Add a project
    const projectSelect = container.querySelector("#Project")!;
    fireEvent.change(projectSelect, {
      target: {
        value: JSON.stringify({
          _id: "1",
          image: "project-one.png",
          name: "Project One"
        })
      }
    });

    // Add a tag through search
    const searchInput = container.querySelector("#tag-search")!;
    fireEvent.change(searchInput, { target: { value: "example-tag" } });

    await waitFor(() => {
      const createOption = container.querySelector(".tag-suggestion");
      fireEvent.click(createOption!);
    });

    // Submit form
    const submitButton = container.querySelector("#submit-button")!;
    fireEvent.click(submitButton);

    // Check success alert and service call
    await waitFor(() => {});

    expect(mockAddAlert).toHaveBeenCalledWith({
      alertMessage: "Uploading Asset....",
      alertType: AlertType.Success
    });

    expect(mockAddAlert).toHaveBeenCalledWith({
      alertMessage: "Asset uploaded successfully!",
      alertType: AlertType.Success
    });

    expect(AssetService.uploadAsset).toHaveBeenCalledTimes(1);
  });

  test("shows validation error for missing required fields", async () => {
    expect.assertions(1);

    const { container } = render(<UploadAsset />);

    const submitButton = container.querySelector("#submit-button")!;
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledTimes(1);
    });
  });

  test("handles tag removal with sanitized tags", async () => {
    expect.assertions(2);

    const { container } = render(<UploadAsset />);

    // Add valid tag through search
    const searchInput = container.querySelector("#tag-search")!;
    fireEvent.change(searchInput, { target: { value: "testtag" } });

    await waitFor(() => {
      const createOption = container.querySelector(".tag-suggestion");
      fireEvent.click(createOption!);
    });

    // Verify sanitized tag was added
    const addedTag = container.querySelector(".tag-item");

    expect(addedTag).toBeInTheDocument();

    // Remove tag
    const removeButton = container.querySelector(".remove-tag-button")!;
    fireEvent.click(removeButton);

    // Verify tag was removed
    const tagsList = container.querySelectorAll(".tag-item");

    expect(tagsList).toHaveLength(0);
  });
});
