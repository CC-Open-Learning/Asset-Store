import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { vi } from "vitest";

import useAlert from "../../hooks/alert/useAlert";
import type { AlertBoxType } from "../../store/contexts/alert/AlertContext";
import { AlertType } from "../../store/contexts/alert/AlertContext";
import AlertBox from "./AlertBox";

// Mock the useAlert hook
vi.mock("../../hooks/alert/useAlert", () => ({
  default: vi.fn().mockReturnValue({
    addAlert: vi.fn(),
    alerts: [],
    removeAlert: vi.fn()
  })
}));

describe("alertBox Component", () => {
  const mockUseAlert = vi.mocked(useAlert);
  const mockAddAlert = vi.fn();
  const mockRemoveAlert = vi.fn();
  const mockAlerts: AlertBoxType[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAlert.mockReturnValue({
      addAlert: mockAddAlert,
      alerts: mockAlerts,
      removeAlert: mockRemoveAlert
    });
  });

  describe("with useAlert hook", () => {
    test("does not render alerts when none exist", () => {
      expect.assertions(2);

      // Render the Portal div
      const { container } = render(<div id="alert" />);
      // Trigger the Render of the AlertBox component in the portal
      render(<AlertBox />);

      const alertBoxElement = container.querySelector("div[id^='alert-']");

      expect(mockAlerts).toHaveLength(0);
      expect(alertBoxElement).not.toBeInTheDocument();
    });

    test("renders 1 alert when 1 exists", () => {
      expect.assertions(2);

      mockUseAlert.mockReturnValueOnce({
        addAlert: mockAddAlert,
        alerts: [
          { alertMessage: "Test Message", alertType: AlertType.Success, id: 1 }
        ],
        removeAlert: mockRemoveAlert
      });

      // Render the Portal div
      const { container } = render(<div id="alert" />);
      // Trigger the Render of the AlertBox component in the portal
      act(() => {
        render(<AlertBox />);
      });
      const alertBoxElement = container.querySelectorAll("div[id^='alert-']");

      expect(alertBoxElement).toHaveLength(1);

      alertBoxElement.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });

    test("renders 4 alerts when 4 exist", () => {
      expect.assertions(5);

      mockUseAlert.mockReturnValueOnce({
        addAlert: mockAddAlert,
        alerts: [
          { alertMessage: "Test Message", alertType: AlertType.Success, id: 1 },
          { alertMessage: "Test Message 2", alertType: AlertType.Error, id: 2 },
          { alertMessage: "Test Message 3", alertType: AlertType.Error, id: 3 },
          { alertMessage: "Test Message 4", alertType: AlertType.Error, id: 4 }
        ],
        removeAlert: mockRemoveAlert
      });

      // Render the Portal div
      const { container } = render(<div id="alert" />);
      // Trigger the Render of the AlertBox component in the portal
      act(() => {
        render(<AlertBox />);
      });
      const alertBoxElement = container.querySelectorAll("div[id^='alert-']");

      expect(alertBoxElement).toHaveLength(4);

      alertBoxElement.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });

    test("removes alert when close button is clicked", () => {
      expect.assertions(2);

      mockUseAlert.mockReturnValueOnce({
        addAlert: mockAddAlert,
        alerts: [
          { alertMessage: "Test Message", alertType: AlertType.Success, id: 1 }
        ],
        removeAlert: mockRemoveAlert
      });

      // Render the Portal div
      const { container } = render(<div id="alert" />);
      // Trigger the Render of the AlertBox component in the portal
      act(() => {
        render(<AlertBox />);
      });

      const closeButtonElement = container.querySelector("#alert-close-button");

      expect(closeButtonElement).toBeInTheDocument();

      fireEvent.click(closeButtonElement!);

      expect(mockRemoveAlert).toHaveBeenCalledTimes(1);
    });
  });
});
