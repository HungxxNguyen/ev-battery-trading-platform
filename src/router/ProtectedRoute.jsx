// src/routes/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/loading/Loading";

const ProtectedRoute = ({
  isPublic = false,
  redirectTo = "/login",
  allowedRoles = [],
}) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (loading) return <Loading />;

  // Chưa đăng nhập mà route không public -> về login
  if (!isPublic && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Có yêu cầu role nhưng role hiện tại không hợp lệ -> Forbidden
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Cho phép render các route con
  return <Outlet />;
};

export default ProtectedRoute;
