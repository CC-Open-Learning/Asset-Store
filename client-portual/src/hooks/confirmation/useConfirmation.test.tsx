import { render } from "@testing-library/react";
import { createContext } from "react";

import type {
  ConfirmationContextType,
  ConfirmationDetails
} from "../../store/contexts/confirmation/ConfirmationContext";
import {
  ConfirmationContext,
  ElementType
} from "../../store/contexts/confirmation/ConfirmationContext";
import useConfirmation from "./useConfirmation";

/**
 * A component that consumes the ConfirmationContext.
 */
const TestComponent = () => {
  const { confirmationDetails, setConfirmationDetails } = useConfirmation();
  return (
    <>
      <div id="test-component-details">
        {confirmationDetails?.elementId}-{confirmationDetails?.elementName}
      </div>
      <button
        onClick={() => {
          setConfirmationDetails!({
            elementId: "test-id",
            elementName: "test-name"
          });
        }}
        type="button">
        Set Details
      </button>
    </>
  );
};

describe("useConfirmation hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mock("../../store/contexts/confirmation/ConfirmationContext", () => {
      const mockDefaultValue: ConfirmationContextType = {
        confirmationDetails: undefined,
        setConfirmationDetails: vi.fn()
      };

      return {
        ConfirmationContext:
          createContext<ConfirmationContextType>(mockDefaultValue),

        /**
         * Provider that wraps the application and provides the context.
         * @param ReactNode The children prop.
         * @param ReactNode.children The children components.
         */
        ConfirmationProvider: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        )
      };
    });
  });

  test("should render correctly with a valid context", () => {
    expect.assertions(2);

    const mockSetConfirmationDetails = vi.fn();
    const mockConfirmationDetails: ConfirmationDetails = {
      elementId: "test-id",
      elementName: "test-name"
    };

    const mockContextValue: ConfirmationContextType = {
      confirmationDetails: mockConfirmationDetails,
      setConfirmationDetails: mockSetConfirmationDetails
    };

    const { container } = render(
      <ConfirmationContext.Provider value={mockContextValue}>
        <TestComponent />
      </ConfirmationContext.Provider>
    );

    const testComponentDetailsElement = container.querySelector(
      "#test-component-details"
    );

    expect(testComponentDetailsElement).toBeInTheDocument();
    expect(testComponentDetailsElement?.textContent).toBe(
      `${mockConfirmationDetails.elementId!}-${mockConfirmationDetails.elementName!}`
    );
  });

  test("should throw an error if used outside of a provider", () => {
    expect.assertions(1);

    vi.mock("../../store/contexts/confirmation/ConfirmationContext", () => ({
      ConfirmationContext: createContext<ConfirmationContextType | null>(null)
    }));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {
        /* Suppress React error boundary logs during the test */
      });

    expect(() => render(<TestComponent />)).toThrow(
      "useConfirmation must be used within a ConfirmationProvider"
    );

    consoleErrorSpy.mockRestore();
  });
});
