import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    // Kiểm tra token trong localStorage (hoặc state của bạn)
    const isAuthenticated = !!localStorage.getItem("token");

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;