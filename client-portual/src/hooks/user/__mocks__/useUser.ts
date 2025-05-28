// Src/hooks/user/__mocks__/useUser.ts
import type { UserContextType } from "../../../store/contexts/user/UserContext";

const mockSetIsLoading = vi.fn();
const mockSetIsLoggedIn = vi.fn();
const mockSetUser = vi.fn();

export const defaultUserContext: UserContextType = {
  isLoading: false,
  isLoggedIn: false,
  setIsLoading: mockSetIsLoading,
  setIsLoggedIn: mockSetIsLoggedIn,
  setUser: mockSetUser,
  user: null
};

export const useUser = vi.fn();

/**
 * @param overrides
 */
export const createUserContextMock = (
  overrides: Partial<UserContextType> = {}
): UserContextType => {
  return { ...defaultUserContext, ...overrides };
};
