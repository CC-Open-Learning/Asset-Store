import { useContext } from "react";

import type { SasTokenContextType } from "../../store/contexts/sastoken/SasTokenContext";
import { SasTokenContext } from "../../store/contexts/sastoken/SasTokenContext";

/**
 * Hook that provides the SAS token context.
 */
export default function useSasToken(): SasTokenContextType {
  const context = useContext(SasTokenContext);
  if (!context) {
    throw new Error("useSasToken must be used within a SasTokenProvider");
  }
  return context;
}
