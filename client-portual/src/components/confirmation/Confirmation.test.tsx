import { fireEvent, render } from "@testing-library/react";

import useConfirmation from "../../hooks/confirmation/useConfirmation";
import {
  type ConfirmationContextType,
  ElementType
} from "../../store/contexts/confirmation/ConfirmationContext";
import Confirmation from "./Confirmation";

// Mock the useConfirmation hook
vi.mock("../../hooks/confirmation/useConfirmation", () => ({
  default: vi.fn().mockReturnValue({
    confirmationDetails: undefined,
    setConfirmationDetails: vi.fn()
  })
}));

describe("confirmation Component", () => {
  const mockUseConfirmation = vi.mocked(useConfirmation);
  const mockOnConfirm = vi.fn();
  const mockSetConfirmationDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConfirmation.mockReturnValue({
      confirmationDetails: undefined,
      setConfirmationDetails: mockSetConfirmationDetails
    });
  });

  test("does not render when no confirmation details exist", () => {
    expect.assertions(1);

    // Render the Portal div
    const { container } = render(<div id="confirmation" />);
    // Trigger the Render of the Confirmation component in the portal
    render(<Confirmation onConfirm={mockOnConfirm} />);

    const confirmationElement = container.querySelector(".confirmation-modal");

    expect(confirmationElement).not.toBeInTheDocument();
  });

  test("renders when confirmation details exist", () => {
    expect.assertions(4);

    mockUseConfirmation.mockReturnValue({
      confirmationDetails: {
        elementId: "test-id",
        elementName: "test-name",
        elementType: ElementType.asset
      },
      setConfirmationDetails: mockSetConfirmationDetails
    });

    // Render the Portal div
    const { container } = render(<div id="confirmation" />);
    // Trigger the Render of the Confirmation component in the portal
    render(<Confirmation onConfirm={mockOnConfirm} />);

    const confirmationElement = container.querySelector(".confirmation-modal");
    const confirmText = container.querySelector("p");
    const confirmButton = container.querySelector(".confirmation-confirm");
    const cancelButton = container.querySelector(".confirmation-cancel");

    expect(confirmationElement).toBeInTheDocument();
    expect(confirmText?.textContent).toBe(
      'You are going to delete the "test-name" asset.'
    );
    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  test("calls onConfirm and clears details when confirm button is clicked", () => {
    expect.assertions(2);

    mockUseConfirmation.mockReturnValue({
      confirmationDetails: {
        elementId: "test-id",
        elementName: "test-name",
        elementType: ElementType.asset
      },
      setConfirmationDetails: mockSetConfirmationDetails
    });

    // Render the Portal div
    const { container } = render(<div id="confirmation" />);
    // Trigger the Render of the Confirmation component in the portal
    render(<Confirmation onConfirm={mockOnConfirm} />);

    const confirmButton = container.querySelector(".confirmation-confirm");
    fireEvent.click(confirmButton!);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockSetConfirmationDetails).toHaveBeenCalledWith({
      elementId: undefined,
      elementName: undefined,
      elementType: undefined
    });
  });

  test("clears details when cancel button is clicked", () => {
    expect.assertions(2);

    mockUseConfirmation.mockReturnValue({
      confirmationDetails: {
        elementId: "test-id",
        elementName: "test-name",
        elementType: ElementType.asset
      },
      setConfirmationDetails: mockSetConfirmationDetails
    });

    // Render the Portal div
    const { container } = render(<div id="confirmation" />);
    // Trigger the Render of the Confirmation component in the portal
    render(<Confirmation onConfirm={mockOnConfirm} />);

    const cancelButton = container.querySelector(".confirmation-cancel");
    fireEvent.click(cancelButton!);

    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(mockSetConfirmationDetails).toHaveBeenCalledWith({
      elementId: undefined,
      elementName: undefined,
      elementType: undefined
    });
  });
});
