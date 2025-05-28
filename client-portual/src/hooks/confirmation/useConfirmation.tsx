import { useContext } from "react";

import type { ConfirmationContextType } from "../../store/contexts/confirmation/ConfirmationContext";
import { ConfirmationContext } from "../../store/contexts/confirmation/ConfirmationContext";

/**
 * Hook that provides the confirmation context.
 */
export default function useConfirmation(): ConfirmationContextType {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error(
      "useConfirmation must be used within a ConfirmationProvider"
    );
  }

  return context;
}
