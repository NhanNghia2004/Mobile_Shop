import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../pages/public/MainLayout";
import Home from "../pages/public/Home";
import LoginPage from "../pages/public/LoginPage";
import Register from "../pages/public/Register";
import ProductDetail from "../pages/public/ProductDetail";
import Profile from "../pages/public/Profile";
import AdminDashboard from "../pages/admin/AdminDashboard.tsx";
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/product" element={<ProductDetail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Private Routes - Phải đăng nhập (USER hoặc ADMIN đều được) */}
                <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
                    <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Admin Routes - CHỈ ADMIN mới vào được */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                    {/* Giả sử bạn có trang Dashboard trong thư mục pages/admin */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

            </Route>

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />


            {/* Điều hướng mặc định */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;