import { describe, expect, test, vi } from "vitest";

import AxiosService from "../axios/AxiosService";
import UserService from "./UserService";

// Mock AxiosService
vi.mock("../axios/AxiosService");

describe("userService", () => {
  describe("login", () => {
    test("should make a POST request to login endpoint with correct credentials", async () => {
      expect.assertions(2);

      const mockResponse = { message: "Login successful", status: 200 };
      const credentials = { password: "password123", username: "testuser" };

      vi.mocked(AxiosService.POST).mockResolvedValueOnce(mockResponse);

      const response = await UserService.login(credentials);

      expect(AxiosService.POST).toHaveBeenCalledWith(
        "/users/login",
        credentials
      );
      expect(response).toStrictEqual(mockResponse);
    });
  });

  describe("getUserProfile", () => {
    test("should make a GET request to profile endpoint", async () => {
      expect.assertions(2);

      const mockUser = {
        email: "test@test.com",
        id: "123",
        username: "testuser"
      };

      vi.mocked(AxiosService.GET).mockResolvedValueOnce(mockUser);

      const response = await UserService.getUserProfile();

      expect(AxiosService.GET).toHaveBeenCalledWith("/users/profile");
      expect(response).toStrictEqual(mockUser);
    });
  });

  describe("authenticate", () => {
    test("should make a GET request to authenticate endpoint", async () => {
      expect.assertions(2);

      const mockResponse = { message: "Authenticated", success: true };

      vi.mocked(AxiosService.GET).mockResolvedValueOnce(mockResponse);

      const response = await UserService.authenticate();

      expect(AxiosService.GET).toHaveBeenCalledWith("/users/authenticate");
      expect(response).toStrictEqual(mockResponse);
    });
  });

  describe("logout", () => {
    test("should make a POST request to logout endpoint", async () => {
      expect.assertions(2);

      const mockResponse = { message: "Logged out", success: true };

      vi.mocked(AxiosService.POST).mockResolvedValueOnce(mockResponse);

      const response = await UserService.logout();

      expect(AxiosService.POST).toHaveBeenCalledWith("/users/logout");
      expect(response).toStrictEqual(mockResponse);
    });
  });

  describe("getUserRoles", () => {
    test("should make a GET request to allUserRoles endpoint", async () => {
      expect.assertions(2);

      const mockRoles = [
        { _id: "1", email: "user1@test.com", role: "user", username: "user1" },
        { _id: "2", email: "user2@test.com", role: "admin", username: "user2" }
      ];

      vi.mocked(AxiosService.GET).mockResolvedValueOnce(mockRoles);

      const response = await UserService.getUserRoles();

      expect(AxiosService.GET).toHaveBeenCalledWith("/users/allUserRoles");
      expect(response).toStrictEqual(mockRoles);
    });
  });

  describe("deleteUser", () => {
    test("should make a DELETE request with correct query parameters", async () => {
      expect.assertions(2);

      const mockResponse = { message: "User deleted", success: true };
      const userId = "123";

      vi.mocked(AxiosService.DELETE).mockResolvedValueOnce(mockResponse);

      const response = await UserService.deleteUser({ id: userId });

      expect(AxiosService.DELETE).toHaveBeenCalledWith("/users", {
        params: { id: userId },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        paramsSerializer: expect.any(Function)
      });
      expect(response).toStrictEqual(mockResponse);
    });

    test("should correctly serialize parameters", async () => {
      expect.assertions(1);

      const mockResponse = { message: "User deleted", success: true };
      const userId = "123";

      vi.mocked(AxiosService.DELETE).mockResolvedValueOnce(mockResponse);

      await UserService.deleteUser({ id: userId });

      const [[url, config]] = vi.mocked(AxiosService.DELETE).mock.calls;
      const serializer = config?.paramsSerializer;
      const serializedParams =
        typeof serializer === "function" ? serializer({ id: userId }) : null;

      expect(serializedParams).toBe("id=123");
    });

    test("should handle error responses", async () => {
      expect.assertions(1);

      const mockError = new Error("Failed to delete user");
      const userId = "123";

      vi.mocked(AxiosService.DELETE).mockRejectedValueOnce(mockError);

      await expect(UserService.deleteUser({ id: userId })).rejects.toThrow(
        "Failed to delete user"
      );
    });
  });
});
