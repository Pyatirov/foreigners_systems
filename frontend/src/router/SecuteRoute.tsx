import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = () => {
  const { isAuth, role } = useAuth();

  if (!isAuth) return <Navigate to="/auth" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;

  return <Outlet />;
};
