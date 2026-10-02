import { Navigate, Outlet } from "react-router-dom";
import { getDashboardPath } from "../auth";

// localStorage is read synchronously before rendering, so reloads do not flash
// an authentication screen while the saved session is being checked.
export const RoleRedirect = () => {
  const token = localStorage.getItem("accessToken");
  const destination = getDashboardPath();
  return token && destination !== "/login" ? <Navigate to={destination} replace /> : <Outlet />;
};

export const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;

  const path = getDashboardPath();
  if (path === "/login") return <Navigate to="/login" replace />;
  if (role && path !== `/${role}/dashboard` && role !== "student") {
    return <Navigate to={path} replace />;
  }
  if (role === "student" && path !== "/dashboard") return <Navigate to={path} replace />;
  return children;
};
