import type { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";

export enum AlertType {
  Error = "error",
  Success = "success"
}

export interface AlertBoxType {
  alertMessage?: string;
  alertType?: AlertType;
  id: number;
}

export interface AlertContextType {
  addAlert?: (alert: Omit<AlertBoxType, "id">) => void;
  alerts?: AlertBoxType[];
  removeAlert?: (id: number) => void;
}

// Creates the context with default values
export const AlertContext = createContext<AlertContextType>({
  addAlert: undefined,
  alerts: [],
  removeAlert: undefined
});

/**
 * Provider that wraps the application and provides the context.
 * @param ReactNode The children prop.
 * @param ReactNode.children The children components.
 */
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertBoxType[]>([]);
  const alertTimeouts = new Map<number, NodeJS.Timeout>();

  const MAX_ALERTS = 1; // Set the maximum number of alerts

  /**
   * Removes an alert by its ID.
   * @param id The ID of the alert to remove.
   */
  const removeAlert = (id: number) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));

    // Clear the timeout for this alert if it exists
    const timeout = alertTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      alertTimeouts.delete(id);
    }
  };

  /**
   * Adds a new alert to the list.
   * @param alert The alert to add.
   */
  const addAlert = (alert: Omit<AlertBoxType, "id">) => {
    const id = Date.now();

    setAlerts(prevAlerts => {
      // If the number of alerts exceeds the limit, remove the oldest alert
      const newAlerts = [...prevAlerts, { id, ...alert }];
      if (newAlerts.length > MAX_ALERTS) {
        const oldestAlert = newAlerts.shift(); // Remove the first alert (oldest)
        if (oldestAlert) {
          // Clear the timeout for the oldest alert
          const timeout = alertTimeouts.get(oldestAlert.id);
          if (timeout) {
            clearTimeout(timeout);
            alertTimeouts.delete(oldestAlert.id);
          }
        }
      }
      return newAlerts;
    });

    // Set a timeout for this specific alert
    const timeout = setTimeout(() => {
      removeAlert(id); // Automatically remove the alert after 6 seconds
    }, 6000);

    // Track the timeout for this alert
    alertTimeouts.set(id, timeout);
  };

  // Cleanup all timeouts when the component unmounts
  useEffect(() => {
    return () => {
      alertTimeouts.forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return (
    <AlertContext.Provider
      value={{
        addAlert,
        alerts,
        removeAlert
      }}>
      {children}
    </AlertContext.Provider>
  );
};
