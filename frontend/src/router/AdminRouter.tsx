import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminRoute = () => {
  const { isAuth, role } = useAuth();

  if (!isAuth) return <Navigate to="/auth" replace />;
  if (role !== "admin") return <Navigate to="/students" replace />;

  return <Outlet />;
};