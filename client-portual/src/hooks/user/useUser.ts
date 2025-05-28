import { useContext } from "react";

import type { UserContextType } from "../../store/contexts/user/UserContext";
import { UserContext } from "../../store/contexts/user/UserContext";

/**
 * A custom hook that returns the user context.
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
