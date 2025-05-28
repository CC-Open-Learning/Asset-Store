import type { AxiosRequestConfig } from "axios";

import type { User } from "../../types";
import AxiosService from "../axios/AxiosService";

const baseRoute = "/users";

export interface AuthResponse {
  message: string;
  success: boolean;
}

export interface UserRolesResponse {
  _id: string;
  email: string;
  role: string;
  username: string;
}

/**
 * Logs in the user with username and password.
 * @param credentials The username and password for login.
 * @param credentials.username The username of the user.
 * @param credentials.password The password of the user.
 * @returns A boolean indicating success (`true`) or failure (`false`), or an AxiosError if an error occurs.
 */
const login = async ({
  password,
  username
}: {
  password: string;
  username: string;
}): Promise<AuthResponse> => {
  const loginPayload = {
    password,
    username
  };

  return await AxiosService.POST<AuthResponse>(
    `${baseRoute}/login`,
    loginPayload
  );
};

/**
 * Gets the user profile by calling the `/profile` endpoint.
 */
const getUserProfile = async (): Promise<User> => {
  // Send request
  return await AxiosService.GET<User>(`${baseRoute}/profile`);
};

/**
 * Verifies user authentication by calling the `/authenticate` endpoint.
 * @returns An object with `success: boolean` and `message: string` if successful, or an AxiosError/Error if failed.
 */
const authenticate = async (): Promise<AuthResponse> => {
  const result = await AxiosService.GET<AuthResponse>(
    `${baseRoute}/authenticate`
  );
  return result;
};

/**
 * Logs out the user by calling the `/logout` endpoint.
 * @returns An object with `success: boolean` and `message: string` if successful, or an AxiosError/Error if failed.
 */
const logout = async (): Promise<AuthResponse> => {
  return await AxiosService.POST<AuthResponse>(`${baseRoute}/logout`);
};

/**
 * Gets all user roles by calling the `/allUserRoles` endpoint.
 * @returns An array of users and their roles if successful, or an AxiosError/Error if failed.
 */
const getUserRoles = async (): Promise<UserRolesResponse[]> => {
  const result = await AxiosService.GET<UserRolesResponse[]>(
    `${baseRoute}/allUserRoles`
  );

  return result;
};

interface DeleteResponse {
  message: string;
  success: boolean;
}

/**
 * Deletes a user by calling the `/users` endpoint.
 * @param {object} props An object containing the user ID to delete.
 * @param {string} props.id The ID of the user to delete.
 * @returns An object with `message: string` and `success: boolean` if successful, or an AxiosError/Error if failed.
 */
const deleteUser = async ({ id }: { id: string }): Promise<DeleteResponse> => {
  const queryParams: AxiosRequestConfig = {
    params: { id },

    /**
     * Serializes the query parameters for the request.
     * @param params The query parameters to serialize.
     */
    paramsSerializer: params => {
      const userParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null) userParams.append(key, String(value));
      });
      return userParams.toString();
    }
  };
  return await AxiosService.DELETE<DeleteResponse>(baseRoute, queryParams);
};

const UserService = {
  authenticate,
  deleteUser,
  getUserProfile,
  getUserRoles,
  login,
  logout
};

export default UserService;
