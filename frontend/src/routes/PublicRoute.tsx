import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
    const token = localStorage.getItem("token");

    // Nếu đã có token (đã đăng nhập), đá về trang chủ ngay
    if (token) {
        return <Navigate to="/" replace />;
    }

    // Nếu chưa có token, cho phép xem trang Login/Register
    return <Outlet />;
};

export default PublicRoute;