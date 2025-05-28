import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig
} from "axios";

/**
 * Processes and returns Axios errors for further handling.
 *
 * This function accepts an Axios error object, optionally logs the error,
 * and then returns the error to be handled by the calling function. If no
 * error is provided, a generic "unknown error" message is returned.
 * @param error The error object captured during a failed Axios request.
 */
const handleAxiosError = (error: unknown): AxiosError => {
  // If it's already an AxiosError, return it directly
  if (error instanceof AxiosError) {
    return error;
  }

  // Otherwise, create a new AxiosError with a generic "unknown error" message
  const axiosError = new AxiosError(
    error instanceof Error ? error.message : "An unknown error occurred",
    "unknown"
  );

  return axiosError;
};

// Initialize Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_BASE_URL as string}/api`,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 60000,
  withCredentials: true
});

/**
 * Makes a GET request to a given dynamic endpoint.
 * @param endpoint The API route to make the GET request to (after `/api`).
 * @param config Optional AxiosRequestConfig for query parameters or other settings.
 * @returns The full Axios response object.
 */
const GET = async <T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    return (await axiosInstance.get<T>(endpoint, config)).data;
  } catch (error: unknown) {
    throw handleAxiosError(error);
  }
};

/**
 * Makes a POST request to a given dynamic endpoint.
 * @param endpoint The API route to make the POST request to (after `/api`).
 * @param data The payload to send in the request body, typically a JSON object.
 * @param config Optional AxiosRequestConfig for custom headers or other settings.
 * @returns The full Axios response object.
 */
const POST = async <T>(
  endpoint: string,
  data?: FormData | Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    return (await axiosInstance.post<T>(endpoint, data, config)).data;
  } catch (error: unknown) {
    throw handleAxiosError(error);
  }
};

/**
 * Makes a PUT request to a given dynamic endpoint.
 * @param endpoint The API route to make the PUT request to (after `/api`).
 * @param data The payload to send in the request body, typically a JSON object.
 * @param config Optional AxiosRequestConfig for custom headers or other settings.
 * @returns The full Axios response object.
 */
const PUT = async <T>(
  endpoint: string,
  data: FormData | Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    return (await axiosInstance.put<T>(endpoint, data, config)).data;
  } catch (error: unknown) {
    throw handleAxiosError(error);
  }
};

/**
 * Makes a DELETE request to a given dynamic endpoint.
 * @param endpoint The API route to make the DELETE request to (after `/api`).
 * @param config Optional AxiosRequestConfig for query parameters or other settings.
 * @returns The full Axios response object.
 */
const DELETE = async <T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    return (await axiosInstance.delete<T>(endpoint, config)).data;
  } catch (error: unknown) {
    throw handleAxiosError(error);
  }
};

const AxiosService = {
  DELETE,
  GET,
  POST,
  PUT
};

export default AxiosService;
