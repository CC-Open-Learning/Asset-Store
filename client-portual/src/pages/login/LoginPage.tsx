import { AxiosError } from "axios";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import useAlert from "../../hooks/alert/useAlert";
import { useUser } from "../../hooks/user/useUser";
import UserService from "../../services/user/UserService";
import { AlertType } from "../../store/contexts/alert/AlertContext";

interface IFormInput {
  password: string;
  username: string;
}

/**
 * Login page component.
 */
export default function LoginPage() {
  const UNAUTHORIZED_STATUS = 401;

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError
  } = useForm<IFormInput>();

  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useUser();
  const { addAlert } = useAlert();

  /**
   * Handles form submission.
   * @param data Form data containing username and password.
   */
  const onSubmit: SubmitHandler<IFormInput> = async data => {
    try {
      const result = await UserService.login({
        password: data.password,
        username: data.username
      });
      if (result.success) {
        addAlert!({
          alertMessage: result.message,
          alertType: AlertType.Success
        });
        setIsLoggedIn(true);
        navigate("/");
      } else {
        addAlert!({
          alertMessage: result.message,
          alertType: AlertType.Error
        });
        throw new Error(result.message);
      }
    } catch (error) {
      let alertMessage = "An error occurred";
      if (error instanceof AxiosError) {
        if (error.response?.data) {
          alertMessage = (error.response.data as { message: string }).message;
          //Customize the error handling based on your API response
          if (error.response.status === UNAUTHORIZED_STATUS) {
            setError("username", {
              message: alertMessage
            });
            setError("password", {
              message: alertMessage
            });
          }
        } else {
          alertMessage = error.message;
        }
      } else if (error instanceof Error) {
        alertMessage = error.message;
      }
      //Handle other types of errors if necessary
      addAlert!({
        alertMessage,
        alertType: AlertType.Error
      });
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div
        className="flex w-1/4 min-w-[250px] flex-col items-center justify-center rounded-lg bg-general-40 p-10 px-16"
        id="login-container">
        <img
          alt="Varlab Logo"
          className="w-1/3 object-scale-down"
          draggable="false"
          src="/assets/varlab_logo_transparent.png"
        />
        <h1 className="pb-7 pt-3 text-xl font-semibold">Asset Storage</h1>

        <form
          className="mx-0 flex flex-col justify-center"
          onSubmit={e => {
            e.preventDefault();
            handleSubmit(onSubmit)(e).catch((error: unknown) => {
              console.error("Error during form submission:", error);
            });
          }}>
          {/* Username Field */}

          <input
            className={`mb-2 w-full rounded-lg border-2 bg-general-10 px-3 py-2 text-sm text-black ${
              errors.username ? "border-red-500" : "border-transparent"
            }`}
            placeholder="Username"
            {...register("username", {
              required: "Username is required"
            })}
            required
            type="text"
          />

          {/* Password Field */}

          <input
            className={`mb-2 w-full rounded-lg border-2 bg-general-10 px-3 py-2 text-sm text-black ${
              errors.password ? "border-red-500" : "border-transparent"
            }`}
            placeholder="Password"
            type="password"
            {...register("password", {
              required: "Password is required"
            })}
            required
          />

          {/* Sign In Button */}
          <button
            className="w-full rounded-lg bg-yellow-80 py-2 text-xs font-bold text-black"
            type="submit">
            Sign In
          </button>

          <p className="my-2 text-center">or</p>

          {/* Sign in with Google */}
          <button
            className="flex w-full items-center justify-center rounded-lg bg-white py-2 text-black"
            onClick={() =>
              (window.location.href = `${
                import.meta.env.VITE_SERVER_URL as string
              }/oauth/google`)
            }
            type="button">
            <img
              alt="Google Logo"
              className="mr-1 inline size-4"
              draggable="false"
              src="/assets/googlelogo.png"
            />
            <span className="text-xs font-bold text-general-40">
              Sign in with Google
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
