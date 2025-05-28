import { fireEvent, render, screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import useSearch from "../../hooks/search/useSearch";
import { useUser } from "../../hooks/user/useUser";
import SearchBar from "../searchbar/SearchBar";
import Header from "./Header";

// Mocking useNavigate from react-router-dom
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useLocation: vi.fn(),
  useNavigate: vi.fn()
}));

vi.mock("../../hooks/user/useUser");
vi.mock("../../components/userpanel/UserPanel");
vi.mock("../searchbar/SearchBar");
vi.mock("../../hooks/search/useSearch", () => ({
  default: vi.fn().mockReturnValue({
    keyword: "",
    setKeyword: vi.fn(),
    setShowSearchBar: vi.fn(),
    showSearchBar: false
  })
}));
// Mocking UserService to eliminate AxiosService error
vi.mock("../../services/user/UserService");

describe("header component", () => {
  const setKeywordMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mocking useUser hook with some return values
    vi.mocked(useUser).mockReturnValue({
      isLoading: false,
      isLoggedIn: true,
      setIsLoading: vi.fn(),
      setIsLoggedIn: vi.fn(),
      setUser: vi.fn(),
      user: null
    });
    vi.mocked(useSearch).mockReturnValue({
      keyword: "",
      setKeyword: setKeywordMock,
      setShowSearchBar: vi.fn(),
      showSearchBar: false
    });
  });

  // 1. Test rendering of Header component when user is loggedIn
  test("render header component without errors", () => {
    expect.assertions(1);

    const { container } = render(<Header />);
    const headerComponent = container.querySelector("#headerComponent");

    expect(headerComponent).toBeInTheDocument();
  });

  // 2. Test rendering of logo image on Header component
  test("render logo image without errors", () => {
    expect.assertions(2);

    const { container } = render(<Header />);
    const logoDiv = container.querySelector("#Logo");

    expect(logoDiv).not.toBeNull();

    const logoImage = logoDiv!.querySelector("img");

    expect(logoImage).toHaveAttribute(
      "src",
      "/assets/varlab_logo_transparent.png"
    );
  });

  // 3. Test navigating to home page when logo image is clicked
  test("navigate to home page when logo image is clicked", () => {
    expect.assertions(1);

    // Mocking useNavigate with some return value
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { container } = render(<Header />);
    const logoImage = container.querySelector("#Logo img");

    fireEvent.click(logoImage!);

    // Expecting useNavigate to have been called with "/" value (redirecting to home page)
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // 4. Test rendering of SearchBar component on Header component
  test("render search bar component without errors", () => {
    expect.assertions(2);

    // Mocking SearchBar component with a mock input to test if it is rendered
    vi.mocked(SearchBar).mockReturnValue(
      <input data-testid="search-bar-mock" />
    );

    const { container } = render(<Header />);
    const searchBarDiv = container.querySelector("#searchBar");
    const searchBar = screen.getByTestId("search-bar-mock");

    expect(searchBarDiv).toBeInTheDocument();
    expect(searchBar).toBeInTheDocument();
  });

  // 5. Test rendering of UserPanel component when user is loggedIn
  test("render user panel component without errors", () => {
    expect.assertions(1);

    const { container } = render(<Header />);
    const userPanelDiv = container.querySelector("#userPanelSection");

    expect(userPanelDiv).toBeInTheDocument();
  });

  // 6. Test hiding and toggling of UserPanel component when clicked outside of the panel
  test("hide user panel when clicked outside of the panel", () => {
    expect.assertions(3);

    const { container } = render(<Header />);
    const userImageDiv = container.querySelector("#UserImage img");

    fireEvent.click(userImageDiv!);

    const userPanelDiv = container.querySelector("#userPanelSection");

    expect(userPanelDiv).toBeInTheDocument();

    // Testing user panel visibility before clicking outside
    expect(userPanelDiv).toHaveClass("pointer-events-auto");

    // Clicking outside of the user panel
    fireEvent.click(document.body);

    // Testing user panel visibility after clicking outside
    expect(userPanelDiv).toHaveClass("pointer-events-none");
  });

  // 7. Test image error state when image fails to load
  test("image error when image fails to load", () => {
    expect.assertions(1);

    const { container } = render(<Header />);
    const userImage = container.querySelector("#UserImage img");

    // Trigger the error event on the image
    fireEvent.error(userImage!);

    // Check if error state is set to true
    const errorState =
      container.querySelector("#UserImage img")?.getAttribute("src") ===
      "/assets/conestoga-college.png";

    expect(errorState).toBeTruthy();
  });

  // 8. Test closing user panel when browser buttons clicked
  test("close user panel on popstate event", () => {
    expect.assertions(3);

    const { container } = render(<Header />);
    const userImageDiv = container.querySelector("#UserImage img");

    fireEvent.click(userImageDiv!);

    const userPanelDiv = container.querySelector("#userPanelSection");

    expect(userPanelDiv).toBeInTheDocument();

    // Testing user panel visibility before popstate event
    expect(userPanelDiv).toHaveClass("pointer-events-auto");

    // Simulate popstate event
    fireEvent.popState(window);

    // Testing user panel visibility after popstate event for browser back/forward buttons
    expect(userPanelDiv).toHaveClass("pointer-events-none");
  });
});
