import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";

import useAlert from "../../hooks/alert/useAlert";
import { useUser } from "../../hooks/user/useUser";
import UserService from "../../services/user/UserService";
import UserPanel from "./UserPanel";

vi.mock("../../hooks/user/useUser");
vi.mock("../../services/user/UserService");
vi.mock("../../hooks/alert/useAlert", () => ({
  default: vi.fn().mockReturnValue({
    addAlert: vi.fn(),
    alerts: [],
    removeAlert: vi.fn()
  })
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

/**
 * @param root0
 * @param root0.children
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("userPanel Component", () => {
  const mockSetIsLoading = vi.fn();
  const mockSetIsLoggedIn = vi.fn();
  const mockSetUser = vi.fn();
  const mockUseAlert = vi.mocked(useAlert);
  const mockAddAlert = vi.fn();

  const defaultUserContext = {
    isLoading: false,
    isLoggedIn: false,
    setIsLoading: mockSetIsLoading,
    setIsLoggedIn: mockSetIsLoggedIn,
    setUser: mockSetUser,
    user: null
  };

  const mockedUseUser = vi.mocked(useUser);

  /**
   * Test default rendering when no user is provided.
   * Assumes that the default value for user is undefined or has default properties.
   */
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useUser).mockReturnValue(defaultUserContext);
    mockUseAlert.mockReturnValue({
      addAlert: mockAddAlert,
      alerts: [],
      removeAlert: vi.fn()
    });

    vi.mocked(useUser).mockReturnValue({
      isLoading: false,
      isLoggedIn: false,
      setIsLoading: mockSetIsLoading,
      setIsLoggedIn: mockSetIsLoggedIn,
      setUser: mockSetUser,
      user: null
    });
  });

  test("renders default user information when no user is provided", () => {
    expect.assertions(2);

    // Render UserPanel without UserContext.Provider
    render(<UserPanel />);
    // Check if username and email are not displayed or display default values
    const userPanel = document.getElementById("user-panel")!;

    const usernameElement = userPanel.querySelector("#username");
    const emailElement = userPanel.querySelector("#user-email");

    // Expect the elements to have no text content
    expect(usernameElement).toBeEmptyDOMElement();
    expect(emailElement).toBeEmptyDOMElement();
  });

  test("renders user information on user panel when user is provided", () => {
    expect.assertions(2);

    const mockUser = {
      _id: "janedoe123",
      email: "john.doe@example.com",
      role: "user",
      username: "John Doe"
    };

    mockedUseUser.mockReturnValue({
      ...defaultUserContext,
      isLoggedIn: true,
      user: mockUser
    });

    render(<UserPanel />);

    // Assuming UserPanel displays user.name and user.email
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
  });

  test("toggles isChecked state on checkbox named theme checkbox click", () => {
    expect.assertions(3);

    // Render the UserPanel component
    render(<UserPanel />);

    // Find the user panel to isolate the checkbox to just the user panel
    const userPanel = document.getElementById("user-panel") as HTMLInputElement;

    // Find the checkbox input
    const checkbox = userPanel.querySelector("#theme-checkbox")!;

    expect(checkbox).toBeChecked();

    //Uncheck the checkbox
    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();

    //Check the checkbox
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  test("calls logout service and updates context on logout button click", async () => {
    expect.assertions(2);

    // Mock the logout response
    vi.mocked(UserService.logout).mockResolvedValue({
      msg: "Logged out successfully",
      success: true
    });

    // Mock user as logged in
    const mockUser = {
      _id: "janedoe123",
      email: "john.doe@example.com",
      role: "user",
      username: "John Doe"
    };

    mockedUseUser.mockReturnValue({
      ...defaultUserContext,
      isLoggedIn: true,
      user: mockUser
    });

    render(<UserPanel />);
    const userPanel = document.getElementById("user-panel")!;

    const logoutButton = userPanel.querySelector("#logout-button")!;
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(UserService.logout).toHaveBeenCalledTimes(1);
    });

    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
  });

  test("alert is shown when logout fails", async () => {
    expect.assertions(2);

    vi.mocked(UserService.logout).mockRejectedValue(new Error("Logout failed"));

    // Mock user as logged in
    const mockUser = {
      _id: "janedoe123",
      email: "john.doe@example.com",
      role: "user",
      username: "John Doe"
    };

    mockedUseUser.mockReturnValue({
      ...defaultUserContext,
      isLoggedIn: true,
      user: mockUser
    });

    const { container } = render(<UserPanel />);
    const userPanel = container.querySelector("#user-panel")!;

    const logoutButton = userPanel.querySelector("#logout-button")!;
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(UserService.logout).toHaveBeenCalledTimes(1);
    });

    expect(mockAddAlert).toHaveBeenCalledWith({
      alertMessage: "Unexpected Error.",
      alertType: "error"
    });
  });

  test("admin panel button visibility based on user role", () => {
    expect.assertions(2);

    // Test with regular user - should not show admin panel
    const regularUser = {
      _id: "user123",
      email: "user@example.com",
      role: "user",
      username: "Regular User"
    };

    mockedUseUser.mockReturnValue({
      ...defaultUserContext,
      isLoggedIn: true,
      user: regularUser
    });

    render(<UserPanel />);

    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();

    // Test with admin user - should show admin panel
    const adminUser = {
      _id: "admin123",
      email: "admin@example.com",
      role: "admin",
      username: "Admin User"
    };

    mockedUseUser.mockReturnValue({
      ...defaultUserContext,
      isLoggedIn: true,
      user: adminUser
    });

    const { rerender } = render(<UserPanel />);
    rerender(<UserPanel />);

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  test("navigates to admin page on admin panel button click", () => {
    expect.assertions(2);

    const mockNavigate = vi.mocked(useNavigate);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const adminUser = {
      _id: "admin123",
      email: "admin@example.com",
      role: "admin",
      username: "Admin User"
    };

    mockedUseUser.mockReturnValue({
      ...defaultUserContext,
      isLoggedIn: true,
      user: adminUser
    });

    render(<UserPanel />, { wrapper });

    const adminButton = screen.getByText("Admin Panel");

    expect(adminButton).toBeInTheDocument();

    fireEvent.click(adminButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });
});
