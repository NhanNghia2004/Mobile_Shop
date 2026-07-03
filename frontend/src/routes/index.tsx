import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../pages/public/MainLayout";
import Home from "../pages/public/Home";
import Products from "../pages/public/Products";
import LoginPage from "../pages/public/LoginPage";
import Register from "../pages/public/Register";
import ProductDetail from "../pages/public/ProductDetail";
import Profile from "../pages/public/Profile";
import CartPage from "../pages/public/Cartpage";
import CheckoutPage from "../pages/public/CheckoutPage";
import PaymentResultPage from "../pages/public/PaymentResultPage";
import OrderDetailPage from "../pages/public/OrderDetailPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminCoupons from "../pages/admin/AdminCoupons";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminInventory from "../pages/admin/AdminInventory";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminReviews from '../pages/admin/AdminReviews';
import AdminLayout from "../pages/admin/AdminLayout";
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import PublicRoute from "./PublicRoute";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />


                {/* Private Routes - Phải đăng nhập (USER hoặc ADMIN đều được) */}
                <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment/result" element={<PaymentResultPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                </Route>
            </Route>

            {/* Admin Routes - CHỈ ADMIN mới vào được, sử dụng AdminLayout */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/coupons" element={<AdminCoupons />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/inventory" element={<AdminInventory />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/reviews" element={<AdminReviews />} />
                </Route>
            </Route>

            {/* Các trang CHỈ dành cho người CHƯA đăng nhập */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Điều hướng mặc định */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;