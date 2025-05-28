import { fireEvent, render } from "@testing-library/react";
import { createContext } from "react";

import AlertBox from "../../components/alertbox/AlertBox";
import useAlert from "../../hooks/alert/useAlert";
import type {
  AlertBoxType,
  AlertContextType
} from "../../store/contexts/alert/AlertContext";
import {
  AlertContext,
  AlertType
} from "../../store/contexts/alert/AlertContext";

/**
 * A component that consumes the AlertContext.
 */
const TestComponent = () => {
  const { addAlert, alerts, removeAlert } = useAlert();
  return (
    <>
      <div id="test-component-alerts">
        {alerts?.map(alert => (
          <div data-testid={`alert-${alert.id}`} key={alert.id}>
            {alert.alertMessage}-{alert.id}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          addAlert!({
            alertMessage: "test-message"
          });
        }}
        type="button">
        Add Alert
      </button>
      <button
        onClick={() => {
          if (alerts?.[0]) {
            removeAlert!(alerts[0].id);
          }
        }}
        type="button">
        Remove Alert
      </button>
    </>
  );
};

describe("useAlert hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mock("../../store/contexts/alert/AlertContext", () => {
      const mockDefaultValue: AlertContextType = {
        addAlert: vi.fn(),
        alerts: [],
        removeAlert: vi.fn()
      };

      return {
        AlertContext: createContext<AlertContextType>(mockDefaultValue),

        /**
         * Provider that wraps the application and provides the context.
         * @param ReactNode The children prop.
         * @param ReactNode.children The children components.
         */
        AlertProvider: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        )
      };
    });
  });

  test("should render correctly with a valid context", () => {
    expect.assertions(2);

    const mockAddAlert = vi.fn();
    const mockRemoveAlert = vi.fn();
    const mockAlerts: AlertBoxType[] = [
      {
        alertMessage: "test-message",
        id: 1
      }
    ];

    const mockContextValue: AlertContextType = {
      addAlert: mockAddAlert,
      alerts: mockAlerts,
      removeAlert: mockRemoveAlert
    };

    const { container } = render(
      <AlertContext.Provider value={mockContextValue}>
        <TestComponent />
      </AlertContext.Provider>
    );

    const testComponentAlertsElement = container.querySelector(
      "#test-component-alerts"
    );

    expect(testComponentAlertsElement).toBeInTheDocument();
    expect(
      container.querySelector("[data-testid='alert-1']")?.textContent
    ).toBe(`${mockAlerts[0].alertMessage!}-${mockAlerts[0].id}`);
  });

  test("should throw an error if used outside of a provider", () => {
    expect.assertions(1);

    vi.mock("../../store/contexts/alert/AlertContext", () => ({
      AlertContext: createContext<AlertContextType | null>(null)
    }));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {
        /* Suppress React error boundary logs during the test */
      });

    expect(() => render(<TestComponent />)).toThrow(
      "useAlert must be used within an AlertProvider"
    );

    consoleErrorSpy.mockRestore();
  });
});
