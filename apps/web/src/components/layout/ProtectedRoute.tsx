import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { selectAccessToken } from "@/features/auth/auth.slice";

export default function ProtectedRoute() {
  const token = useSelector(selectAccessToken);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
