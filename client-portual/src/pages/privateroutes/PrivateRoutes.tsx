import { Navigate, Outlet, useLocation } from "react-router-dom";

import Icons from "../../assets/icons/Icons";
import { useUser } from "../../hooks/user/useUser";

interface PrivateRoutesProps {
  // These are the only allowed user roles for the props
  requiredRole?: "admin" | "user";
}

/**
 * A component that checks if the user is authenticated and has the required role.
 * @param PrivateRoutesProps The props for the private route.
 * @param PrivateRoutesProps.requiredRole The required role for the private route.
 */
export default function PrivateRoutes({ requiredRole }: PrivateRoutesProps) {
  const { isLoading, isLoggedIn, user } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex size-full flex-col items-center justify-center gap-12">
        {/* Larger spinner */}
        <div className="size-20 animate-spin rounded-full border-8 border-yellow-80 border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  // Allow admin to access user routes, but not vice versa
  if (requiredRole === "admin" && user?.role !== "admin") {
    return <Navigate replace to="/unauthorized" />;
  }

  // If authenticated, render the child routes
  if (isLoggedIn && !isLoading) return <Outlet />;
}
