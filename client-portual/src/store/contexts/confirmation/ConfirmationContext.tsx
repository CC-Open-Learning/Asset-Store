import { createContext, type ReactNode, useState } from "react";

export enum ElementType {
  asset = "asset",
  project = "project",
  user = "user"
}

export interface ConfirmationDetails {
  elementId?: string;
  elementName?: string;
  elementType?: ElementType;
}

export interface ConfirmationContextType {
  confirmationDetails?: ConfirmationDetails;
  setConfirmationDetails?: (details: ConfirmationDetails) => void;
}

export const ConfirmationContext = createContext<ConfirmationContextType>({
  confirmationDetails: undefined,
  setConfirmationDetails: undefined
});

/**
 * Provider that wraps the application and provides the context.
 * @param ReactNode The children prop.
 * @param ReactNode.children The children components.
 */
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [confirmationDetails, setConfirmationDetails] = useState<
    ConfirmationDetails | undefined
  >(undefined);

  return (
    <ConfirmationContext.Provider
      value={{
        confirmationDetails,
        setConfirmationDetails
      }}>
      {children}
    </ConfirmationContext.Provider>
  );
}
