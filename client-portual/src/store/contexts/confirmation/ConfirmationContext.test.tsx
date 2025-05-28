import { fireEvent, render } from "@testing-library/react";
import { act, useContext } from "react";

import type { ConfirmationDetails } from "./ConfirmationContext";
import {
  ConfirmationContext,
  ConfirmationProvider,
  ElementType
} from "./ConfirmationContext";

/**
 * Component that consumes the AlertContext and displays alert values.
 */
const MockConfirmationContextConsumer = () => {
  const { confirmationDetails, setConfirmationDetails } =
    useContext(ConfirmationContext);

  return (
    <>
      <button
        id="set-confirmation-button"
        onClick={() => {
          setConfirmationDetails!({
            elementId: "test-id",
            elementName: "Test Element",
            elementType: ElementType.asset
          });
        }}
        type="button">
        Set Confirmation Details
      </button>

      {confirmationDetails ? (
        <div id="confirmation-details">
          <div id="element-id">{confirmationDetails.elementId}</div>
          <div id="element-name">{confirmationDetails.elementName}</div>
          <div id="element-type">{confirmationDetails.elementType}</div>
          <button
            id="clear-confirmation-button"
            onClick={() => {
              setConfirmationDetails!({
                elementId: undefined,
                elementName: undefined,
                elementType: undefined
              });
            }}
            type="button">
            Clear Confirmation Details
          </button>
        </div>
      ) : null}
    </>
  );
};

describe("confirmationContext only", () => {
  test("should render the component", () => {
    expect.assertions(6);

    const mockSetConfirmationDetails = vi.fn();
    const mockContextValue = {
      confirmationDetails: {
        elementId: "test-id",
        elementName: "Test Element",
        elementType: ElementType.asset
      },
      setConfirmationDetails: mockSetConfirmationDetails
    };

    const { container } = render(
      <ConfirmationContext.Provider value={mockContextValue}>
        <MockConfirmationContextConsumer />
      </ConfirmationContext.Provider>
    );

    expect(
      container.querySelector("#set-confirmation-button")
    ).toBeInTheDocument();
    expect(
      container.querySelector("#confirmation-details")
    ).toBeInTheDocument();
    expect(
      container.querySelector("#clear-confirmation-button")
    ).toBeInTheDocument();

    expect(container.querySelector("#element-id")).toBeInTheDocument();
    expect(container.querySelector("#element-name")).toBeInTheDocument();
    expect(container.querySelector("#element-type")).toBeInTheDocument();
  });

  test("should set and clear confirmation details", () => {
    expect.assertions(2);

    const mockSetConfirmationDetails = vi.fn();
    const mockContextValue = {
      confirmationDetails: {
        elementId: "test-id",
        elementName: "Test Element",
        elementType: ElementType.asset
      },
      setConfirmationDetails: mockSetConfirmationDetails
    };

    const { container } = render(
      <ConfirmationContext.Provider value={mockContextValue}>
        <MockConfirmationContextConsumer />
      </ConfirmationContext.Provider>
    );

    const setConfirmationButton = container.querySelector(
      "#set-confirmation-button"
    );
    const clearConfirmationButton = container.querySelector(
      "#clear-confirmation-button"
    );

    act(() => {
      fireEvent.click(setConfirmationButton!);
    });

    expect(mockSetConfirmationDetails).toHaveBeenCalledTimes(1);

    act(() => {
      fireEvent.click(clearConfirmationButton!);
    });

    expect(mockSetConfirmationDetails).toHaveBeenCalledTimes(2);
  });
});

describe("with confirmationProvider", () => {
  test("should render the component", () => {
    expect.assertions(1);

    const { container } = render(
      <ConfirmationProvider>
        <MockConfirmationContextConsumer />
      </ConfirmationProvider>
    );

    expect(
      container.querySelector("#set-confirmation-button")
    ).toBeInTheDocument();
  });
});
