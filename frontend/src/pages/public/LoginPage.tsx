import { Mail, Lock, Apple, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

import api from "../../api/axios";
import { Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // State quản lý lỗi validation
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    // State quản lý thông báo nội bộ
    const [alertMsg, setAlertMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const showAlert = (text: string, type: 'success' | 'error') => {
        setAlertMsg({ text, type });
        setTimeout(() => setAlertMsg(null), 5000);
    };

    const navigate = useNavigate();

    const HERO_IMAGE = "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1381&auto=format&fit=crop";

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: undefined }));
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate inputs
        const newErrors: { email?: string; password?: string } = {};
        if (!email.trim()) {
            newErrors.email = "Hãy nhập email";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = "Email không hợp lệ";
            }
        }

        if (!password) {
            newErrors.password = "Hãy nhập mật khẩu";
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu ít nhất 6 ký tự";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            showAlert("Đăng nhập thành công!", "success");

            // Kích hoạt Header cập nhật lại
            window.dispatchEvent(new Event("storage"));

            // Đợi một chút để người dùng thấy thông báo thành công rồi chuyển hướng
            setTimeout(() => {
                if (user.role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }, 1000);

        } catch (error: any) {
            showAlert(error.response?.data?.message || "Lỗi đăng nhập", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6 font-sans selection:bg-indigo-100">

            {/* Container chính - Giữ nguyên min-h-[550px] */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]"
            >

                {/* Cột trái: Hình ảnh - Giữ nguyên tỷ lệ 2/5 */}
                <div className="hidden md:block md:w-2/5 relative overflow-hidden">
                    <img
                        src={HERO_IMAGE}
                        alt="Mobile Phone Technology"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[1px]" />

                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h2 className="text-xl font-bold mb-2 leading-tight">Thế giới trong tầm tay.</h2>
                        <p className="text-sm text-white/80 leading-relaxed">
                            Đăng nhập để quản lý đơn hàng và nhận thông báo về các siêu phẩm mới nhất.
                        </p>
                    </div>
                </div>

                {/* Cột phải: Form - Giữ nguyên p-8 và space-y-4 */}
                <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center relative">

                    {/* Thông báo cập nhật */}
                    {alertMsg && (
                        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
                            alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            <span>{alertMsg.text}</span>
                        </div>
                    )}

                    <div className="mb-8 text-center">
                        {/* Tăng từ text-2xl lên text-3xl */}
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Đăng nhập</h2>
                        {/* Tăng từ text-sm lên text-base */}
                        <p className="text-gray-500 text-base">Chào mừng bạn quay trở lại với cửa hàng</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin} noValidate>
                        {/* Email */}
                        <div className="space-y-1">

                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="email">
                                Địa chỉ Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="email@vidu.com"

                                    className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border rounded-lg text-base outline-none transition-all placeholder:text-gray-400 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50'}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{errors.email}</p>
                            )}
                        </div>

                        {/* Mật khẩu */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="password">
                                Mật khẩu
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"

                                    className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border rounded-lg text-base outline-none transition-all placeholder:text-gray-400 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-gray-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50'}`}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-semibold">{errors.password}</p>
                            )}
                        </div>


                        <div className="flex items-center justify-between py-1">
                            <label
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => setRememberMe(!rememberMe)}
                            >
                                <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300 group-hover:border-indigo-400'}`}
                                >
                                    {rememberMe && <Check size={12} className="text-white" strokeWidth={4} />}
                                </div>

                                <span className="text-sm font-medium text-gray-600 select-none group-hover:text-gray-900 transition-colors">Ghi nhớ đăng nhập</span>
                            </label>

                            <Link to="/forgot-password" className="text-sm font-bold text-indigo-600 hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg font-bold text-base shadow-md transition-all mt-2 ${
                                isLoading ? 'bg-indigo-400' : 'bg-indigo-700 hover:bg-indigo-800'
                            } text-white`}
                        >
                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
                        </motion.button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-white px-4 text-gray-400">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    const res = await api.post('/auth/google', {
                                        idToken: credentialResponse.credential  // đây chính là ID Token
                                    });
                                    const { token, user } = res.data;
                                    localStorage.setItem('token', token);
                                    localStorage.setItem('user', JSON.stringify(user));
                                    window.dispatchEvent(new Event("storage"));
                                    
                                    showAlert("Đăng nhập Google thành công!", "success");
                                    
                                    setTimeout(() => {
                                        if (user.role === 'ADMIN') navigate('/admin/dashboard');
                                        else navigate('/');
                                    }, 1000);
                                } catch (error: any) {
                                    showAlert(error.response?.data?.message || "Đăng nhập Google thất bại!", "error");
                                }
                            }}
                            onError={() => showAlert("Đăng nhập Google thất bại!", "error")}
                            width="100%"
                            text="signin_with"
                            shape="rectangular"
                            theme="outline"
                        />
                        <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                            <Apple className="w-4 h-4 fill-gray-900" />
                            Apple
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                        Chưa có tài khoản? {' '}
                        <a href="/register" className="text-indigo-600 font-bold hover:underline hover:text-indigo-700 transition-colors">Tạo tài khoản mới</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}