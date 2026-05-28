import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./store";

export function RequireAuth() {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  // Chưa có token -> quay về trang đăng nhập
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}
