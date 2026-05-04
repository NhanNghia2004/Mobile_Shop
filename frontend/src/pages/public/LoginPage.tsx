import { Mail, Lock, Apple, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Ảnh mới: Sang trọng, tối giản, khớp với phong cách công nghệ
    const HERO_IMAGE = "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1381&auto=format&fit=crop";

    return (
        // Nền xám - Giữ nguyên p-6
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
                <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center">

                    <div className="mb-8 text-center">
                        {/* Tăng từ text-2xl lên text-3xl */}
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Đăng nhập</h2>
                        {/* Tăng từ text-sm lên text-base */}
                        <p className="text-gray-500 text-base">Chào mừng bạn quay trở lại với cửa hàng</p>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        {/* Email */}
                        <div className="space-y-1">
                            {/* Tăng từ text-[10px] lên text-xs */}
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="email">
                                Địa chỉ Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@vidu.com"

                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
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
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"

                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Row tùy chọn */}
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
                                {/* Tăng từ text-xs lên text-sm */}
                                <span className="text-sm font-medium text-gray-600 select-none group-hover:text-gray-900 transition-colors">Ghi nhớ đăng nhập</span>
                            </label>
                            {/* Tăng từ text-xs lên text-sm */}
                            <a href="#" className="text-sm font-bold text-indigo-600 hover:underline hover:text-indigo-700 transition-colors">Quên mật khẩu?</a>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}

                            className="w-full bg-indigo-700 text-white py-3 rounded-lg font-bold text-base shadow-md shadow-indigo-100 hover:bg-indigo-800 transition-all mt-2"
                        >
                            Đăng nhập ngay
                        </motion.button>
                    </form>

                    {/* Dấu phân cách */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-white px-4 text-gray-400">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Tăng từ text-xs lên text-sm */}
                        <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
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