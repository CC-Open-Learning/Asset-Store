import type { ReactNode } from "react";
import { createContext, useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import UserService from "../../../services/user/UserService";
import type { User } from "../../../types";

export type UserContextType = {
  isLoading: boolean;
  isLoggedIn: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<null | User>>;
  user: null | User;
};

export const UserContext = createContext<UserContextType>({
  isLoading: false,
  isLoggedIn: false,

  /**
   * Sets the loading state of the user context.
   */
  setIsLoading: () => {},

  /**
   * Sets the logged in state of the user context.
   */
  setIsLoggedIn: () => {},

  /**
   * Sets the user in the user context.
   */
  setUser: () => {},

  user: null
});

// Provider component

/**
 * Provider that wraps the application and provides the context.
 * @param root0 The children prop.
 * @param root0.children The children components.
 */
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<null | User>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();

  /**
   * Authenticates the user by checking if the user is logged in.
   */
  const authenticateUser = async () => {
    const result = await UserService.authenticate();
    if (result.success) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  /**
   * Fetches the user profile from the server.
   */
  const getUser = async () => {
    const result = await UserService.getUserProfile();
    setUser(result);
  };

  useLayoutEffect(() => {
    // Call the async function
    setIsLoading(true);
    authenticateUser()
      .then(() => {
        getUser()
          .catch((error: unknown) => {
            console.error("Error fetching user profile:", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((error: unknown) => {
        setIsLoading(false);
        console.error("Error during authentication:", error);
      });
  }, [location.pathname]);

  return (
    <UserContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        setIsLoading,
        setIsLoggedIn,
        setUser,
        user
      }}>
      {children}
    </UserContext.Provider>
  );
};
