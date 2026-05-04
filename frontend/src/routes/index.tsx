import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../pages/public/MainLayout";
import Home from "../pages/public/Home";
import LoginPage from "../pages/public/LoginPage";
import Register from "../pages/public/Register";
import ProductDetail from "../pages/public/ProductDetail";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />

                <Route path="/product" element={<ProductDetail />} />
            </Route>

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />

            {/* Điều hướng mặc định */}
            <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
    );
};

export default AppRoutes;