import { useContext } from "react";

import type { AlertContextType } from "../../store/contexts/alert/AlertContext";
import { AlertContext } from "../../store/contexts/alert/AlertContext";

/**
 * Hook that provides the alert context.
 */
export default function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
