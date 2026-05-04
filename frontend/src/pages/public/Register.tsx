import { motion } from 'framer-motion';
import { User, Mail, Lock, Check } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [rememberMe, setRememberMe] = useState(false);

    // Đổi ảnh mới: Đồng bộ phong cách với trang Login (iPhone/Technology)
    const HERO_IMAGE = "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1381&auto=format&fit=crop";

    return (
        // Nền xám - Giữ nguyên p-6 để khớp vị trí
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6 font-sans selection:bg-indigo-100">

            {/* Container chính - Giữ nguyên max-w-4xl và min-h-[550px] */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]"
            >

                {/* Cột trái: Hình ảnh - Đồng bộ Overlay và kích thước chữ */}
                <div className="hidden md:block md:w-2/5 relative overflow-hidden">
                    <img
                        alt="Cửa hàng điện thoại"
                        className="absolute inset-0 w-full h-full object-cover"
                        src={HERO_IMAGE}
                    />
                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[1px]" />

                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h2 className="text-xl font-bold mb-2 leading-tight">Công nghệ dẫn đầu.</h2>
                        <p className="text-sm text-white/80 leading-relaxed">
                            Trải nghiệm những dòng điện thoại mới nhất với ưu đãi độc quyền.
                        </p>
                    </div>
                </div>

                {/* Cột phải: Form - Giữ nguyên p-8 md:p-10 */}
                <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                    <div className="mb-8 text-center">
                        {/* Tăng lên text-3xl để bằng trang Login */}
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Tạo tài khoản</h1>
                        {/* Tăng lên text-base */}
                        <p className="text-gray-500 text-base">Bắt đầu hành trình công nghệ của bạn ngay hôm nay.</p>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        {/* Full Name */}
                        <div className="space-y-1">
                            {/* Tăng lên text-xs */}
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="full_name">
                                Họ và Tên
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                <input
                                    id="full_name"
                                    type="text"
                                    placeholder="Nguyễn Văn A"

                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all text-base placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="email">
                                Địa chỉ Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all text-base placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="password">
                                    Mật khẩu
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all text-base placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="confirm_password">
                                    Xác nhận
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        id="confirm_password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all text-base placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row tùy chọn */}
                        <div className="flex items-center justify-between py-1">
                            <label
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => setRememberMe(!rememberMe)}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300 group-hover:border-indigo-400'}`}>
                                    {rememberMe && <Check size={12} className="text-white" strokeWidth={4} />}
                                </div>
                                <span className="text-sm text-gray-600 font-medium select-none group-hover:text-gray-900 transition-colors">Tôi đồng ý với điều khoản</span>
                            </label>
                        </div>

                        {/* Button: Tăng text-base để khớp Login */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full bg-indigo-700 text-white py-3 rounded-lg font-bold text-base shadow-md shadow-indigo-100 hover:bg-indigo-800 transition-all mt-2 active:shadow-none"
                            type="submit"
                        >
                            Tạo tài khoản ngay
                        </motion.button>

                        {/* Link chuyển trang */}
                        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                            Đã có tài khoản?{" "}
                            <a className="text-indigo-600 font-bold hover:underline hover:text-indigo-700 transition-colors" href="/login">
                                Đăng nhập
                            </a>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}