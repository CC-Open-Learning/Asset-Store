import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import useAlert from "../../../../hooks/alert/useAlert";
import ProjectService from "../../../../services/projects/ProjectsService";
import { AlertType } from "../../../../store/contexts/alert/AlertContext";
import AddProject from "./AddProject";

// Mock the ProjectService
vi.mock("../../../../services/projects/ProjectsService", () => ({
  default: {
    uploadProject: vi.fn()
  }
}));

// Mock useAlert
vi.mock("../../../../hooks/alert/useAlert", () => ({
  default: vi.fn().mockReturnValue({
    addAlert: vi.fn(),
    alerts: [],
    removeAlert: vi.fn()
  })
}));

// Create a test file

/**
 * @param type
 */
const createTestFile = (type = "image/webp") => {
  return new File(["test"], "test.webp", { type });
};

describe("addProject Component", () => {
  // Setup modal props
  const mockModalRef = { current: { close: vi.fn(), open: vi.fn() } };
  const mockSetModalState = vi.fn();
  const defaultProps = {
    getProjects: vi
      .fn()
      .mockResolvedValue({ _id: "test", image: "test.webp", name: "test" }),
    setModalState: mockSetModalState
  };

  const mockURL = {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    global.URL = mockURL as unknown as typeof URL;
    global.webkitURL = mockURL as unknown as typeof URL;
    window.URL = mockURL as unknown as typeof URL;
    window.webkitURL = mockURL as unknown as typeof URL;
  });

  test("renders the component correctly", () => {
    expect.assertions(6);

    render(<AddProject {...defaultProps} />);

    // Check for main elements
    expect(screen.getByText("Create a Project")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Thumbnail")).toBeInTheDocument();
    expect(screen.getByText("Drag & drop to upload")).toBeInTheDocument();
    expect(screen.getByText("Supported formats: webp")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  test("handles title input correctly", async () => {
    expect.assertions(1);

    render(<AddProject {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    await userEvent.type(titleInput, "Test Project");

    expect(titleInput).toHaveValue("Test Project");
  });

  test("validates form when thumnail is not uploaded", async () => {
    expect.assertions(1);

    render(<AddProject {...defaultProps} />);

    const titleInput = screen.getByLabelText("Title");
    await userEvent.type(titleInput, "Test Project");

    const createButton = screen.getByRole("button", { name: "Create" });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(useAlert().addAlert).toHaveBeenCalledWith({
        alertMessage: "Please upload a thumbnail.",
        alertType: AlertType.Error
      });
    });
  });

  test("validates form when title is not provided", async () => {
    expect.assertions(1);

    render(<AddProject {...defaultProps} />);

    const createButton = screen.getByRole("button", { name: "Create" });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(useAlert().addAlert).toHaveBeenCalledWith({
        alertMessage: "Please enter a title.",
        alertType: AlertType.Error
      });
    });
  });

  test("handles successful project upload", async () => {
    expect.assertions(3);

    // Create a valid mp3 file.
    const validFile = new File(["dummy content"], "test.webp", {
      type: "image/webp"
    });

    const fakeUrl = "object-url-test.webp";
    const createSpy = vi
      .spyOn(global.URL, "createObjectURL")
      .mockReturnValue(fakeUrl);
    const revokeObjectURL = vi.spyOn(global.URL, "revokeObjectURL");

    // Setup mock return value for successful upload
    // note: I tried doing this with the variable name "mockUploadProject" but
    // it will not work. declaring a var at the top of the file mockUploadProject as vi.fn
    // and then using it in the mock of ProjectService.uploadProject will not work.
    // no matter what, vi.mock is hoisted at the top of the file, thus the variable does not
    // exist when the mock is created.
    ProjectService.uploadProject = vi.fn().mockResolvedValue({
      message: "Project created successfully",
      success: true
    });

    render(<AddProject {...defaultProps} />);

    // Fill in the title
    const titleInput = screen.getByLabelText("Title");
    await userEvent.type(titleInput, "Test Project");

    // Mock file upload
    const fileInput = document.getElementById(
      "dropzone-file"
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Submit the form
    const createButton = screen.getByRole("button", { name: "Create" });
    await userEvent.click(createButton);

    expect(createSpy).toHaveBeenCalledWith(validFile);

    // Check that URL was revoked
    expect(revokeObjectURL).toHaveBeenCalledWith(fakeUrl);

    expect(useAlert().addAlert).toHaveBeenCalledWith({
      alertMessage: "Project created successfully!",
      alertType: AlertType.Success
    });
  });

  test("invalid file type handling", async () => {
    expect.assertions(1);

    // Create a valid mp3 file.
    const validFile = new File(["dummy content"], "test.mp3", {
      type: "audio/mpeg"
    });

    render(<AddProject {...defaultProps} />);

    // Fill in the title
    const titleInput = screen.getByLabelText("Title");
    await userEvent.type(titleInput, "Test Project");

    // Mock file upload
    // const file = createTestFile();
    const fileInput = document.getElementById(
      "dropzone-file"
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(useAlert().addAlert).toHaveBeenCalledWith({
      alertMessage: "Please upload a valid webp file.",
      alertType: AlertType.Error
    });
  });

  test("opens image preview in a new tab when filename is clicked", async () => {
    expect.assertions(1);

    render(<AddProject {...defaultProps} />);

    const mockUrl = "blob:test-url";
    global.URL.createObjectURL = vi.fn(() => mockUrl);

    const validFile = new File(["dummy content"], "test.webp", {
      type: "image/webp"
    });

    // Mock window.open
    const openMock = vi.fn();
    window.open = openMock;

    const fileInput = document.getElementById(
      "dropzone-file"
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Click on the filename to open the preview
    const fileNameElement = screen.getByText("test.webp");
    await userEvent.click(fileNameElement);

    // Check that window.open was called with the correct URL and target
    expect(openMock).toHaveBeenCalledWith(mockUrl, "_blank");
  });
});
