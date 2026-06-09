import { Navigate, Outlet } from "react-router-dom";

interface Props {
    allowedRoles?: string[]; // Danh sách các role được phép vào (ví dụ: ['ADMIN'])
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    // 1. Kiểm tra đăng nhập
    if (!token || !userRaw || userRaw === "undefined") {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userRaw);

        // 2. Kiểm tra quyền truy cập (Nếu Route đó yêu cầu role cụ thể)
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Nếu không đủ quyền, đá về trang chủ hoặc trang 403
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;