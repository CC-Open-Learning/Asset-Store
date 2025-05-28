import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import AssetDetails from "./components/details/AssetDetails";
import AdminPage from "./pages/admin/AdminPage";
import AssetDisplayPage from "./pages/assetdisplay/AssetDisplayPage";
import NotFoundPage from "./pages/error/NotFoundPage";
import UnauthorizedPage from "./pages/error/UnauthorizedPage";
import HomePage from "./pages/homepage/HomePage";
import LoginPage from "./pages/login/LoginPage";
import PrivateRoutes from "./pages/privateroutes/PrivateRoutes";

// CreateBrowserRouter uses the DOM History API to update the URL and manage the history stack.
const router = createBrowserRouter([
  {
    // Root path for the application that renders the various context providers
    // And the main App component central to the website
    // All proceeding children components to be rendered inside of App
    // "/" is the main URL route representing the home page with no extra / after the main URL
    children: [
      {
        element: <LoginPage />,
        path: "/login"
      },
      {
        element: <UnauthorizedPage />,
        path: "/unauthorized"
      },
      {
        children: [
          {
            element: <HomePage />,
            path: "/"
          },
          {
            element: <AssetDisplayPage />,
            path: "/asset"
          },
          {
            element: (
              <div className="fixed inset-0 flex items-center justify-center overflow-auto">
                <div className="relative block size-full max-h-[calc(100vh-56px-2.5rem-1rem)]">
                  <AssetDetails />
                </div>
              </div>
            ),

            path: "/asset/:id"
          }
        ],
        element: <PrivateRoutes requiredRole="user" />
      },
      {
        children: [
          {
            element: <AdminPage />,
            path: "admin"
          }
        ],
        element: <PrivateRoutes requiredRole="admin" />
      }
    ],
    element: <App />,
    errorElement: <NotFoundPage />,
    path: "/"
  }
]);

createRoot(document.getElementById("root")!).render(
  // All data router objects are passed to this component to render your app and enable the rest of the data APIs.
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
