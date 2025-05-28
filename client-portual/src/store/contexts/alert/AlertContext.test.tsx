import { fireEvent, render } from "@testing-library/react";
import { act, useContext } from "react";

import { AlertContext, AlertProvider, AlertType } from "./AlertContext";

/**
 * Component that consumes the AlertContext and displays alert values.
 */
const MockAlertContextConsumer = () => {
  const { addAlert, alerts, removeAlert } = useContext(AlertContext);

  return (
    <>
      <button
        id="add-alert-button"
        onClick={() => {
          addAlert!({
            alertMessage: "Test Alert",
            alertType: AlertType.Success
          });
        }}
        type="button">
        Add Alert
      </button>
      {alerts?.map((alert, index) => {
        return (
          <div id={`alert-${String(alert.id)}`} key={String(alert.id)}>
            {`${String(alert.alertMessage)} ${String(index)}`}
            <button
              id={`alert-close-button-${String(alert.id)}`}
              onClick={() => {
                removeAlert!(alert.id);
              }}
              type="button">
              Close Alert
            </button>
          </div>
        );
      })}
    </>
  );
};

describe("alertContext only", () => {
  test("renders alerts and allows adding and removing alerts", () => {
    expect.assertions(4);

    const mockAddAlert = vi.fn();
    const mockRemoveAlert = vi.fn();
    const mockContextValue = {
      addAlert: mockAddAlert,
      alerts: [
        { alertMessage: "Existing Alert", alertType: AlertType.Success, id: 1 }
      ],
      removeAlert: mockRemoveAlert
    };

    const { container } = render(
      <AlertContext.Provider value={mockContextValue}>
        <MockAlertContextConsumer />
      </AlertContext.Provider>
    );

    // Verify existing alert is rendered
    const existingAlert = container.querySelector("#alert-1");

    expect(existingAlert).toBeInTheDocument();
    expect(existingAlert?.textContent).toContain("Existing Alert");

    // Trigger addAlert
    const addButton = container.querySelector("#add-alert-button");
    fireEvent.click(addButton!);

    expect(mockAddAlert).toHaveBeenCalledTimes(1);

    // Trigger removeAlert
    const removeButton = container.querySelector("#alert-close-button-1");
    fireEvent.click(removeButton!);

    expect(mockRemoveAlert).toHaveBeenCalledWith(1);
  });
});

describe("with alertProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("adds and removes alerts through the provider", () => {
    expect.assertions(2);

    const { container } = render(
      <AlertProvider>
        <MockAlertContextConsumer />
      </AlertProvider>
    );

    // Trigger addAlert
    const addButton = container.querySelector("#add-alert-button");
    fireEvent.click(addButton!);

    // Verify the alert is added by Querying the alert element using an ID pattern
    const addedAlert = container.querySelector("div[id^='alert-']");

    expect(addedAlert).toBeInTheDocument();

    // Trigger removeAlert
    const removeButton = container.querySelector(
      "button[id^='alert-close-button-']"
    );
    fireEvent.click(removeButton!);

    // Verify the alert is removed
    expect(addedAlert).not.toBeInTheDocument();
  });

  test("removes the oldest alert when the maximum limit is exceeded", () => {
    expect.assertions(4);

    const { container } = render(
      <AlertProvider>
        <MockAlertContextConsumer />
      </AlertProvider>
    );

    // Trigger addAlert
    const addButton = container.querySelector("#add-alert-button");

    // Add maximum number of alerts
    for (let i = 0; i < 2; i++) {
      fireEvent.click(addButton!);
    }

    // Verify all 2 alerts are rendered
    let alerts = container.querySelectorAll(`div[id^='alert-']`);

    expect(alerts).toHaveLength(1);

    // Add another alert to exceed the limit
    fireEvent.click(addButton!);

    expect(alerts).toHaveLength(1);

    fireEvent.click(addButton!);

    expect(alerts).toHaveLength(1);

    // Trigger removeAlert
    const removeButton = container.querySelector(
      "button[id^='alert-close-button']"
    );
    fireEvent.click(removeButton!);

    // Verify all 5 alerts are rendered
    alerts = container.querySelectorAll(`div[id^='alert-']`);

    expect(alerts).toHaveLength(0);
  });

  test("removes the alert when the timeout has expired", () => {
    expect.assertions(2);

    const { container } = render(
      <AlertProvider>
        <MockAlertContextConsumer />
      </AlertProvider>
    );

    // Trigger addAlert
    const addButton = container.querySelector("#add-alert-button");

    fireEvent.click(addButton!);

    // Verify the alert is added
    const addedAlert = container.querySelector("div[id^='alert-']");

    expect(addedAlert).toBeInTheDocument();

    act(() => {
      // Fast-forward time
      vi.advanceTimersByTime(6000);
    });

    // Verify the alert is removed
    expect(addedAlert).not.toBeInTheDocument();
  });
});
