import { motion } from 'framer-motion';
import { User, Mail, Lock} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api/axios"; // Đảm bảo đường dẫn này đúng

export default function Register() {
    // 1. Khai báo State cho các trường nhập liệu
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const HERO_IMAGE = "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1381&auto=format&fit=crop";

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        setIsLoading(true);
        try {
            // Sửa lỗi đỏ response:
            // Nếu không dùng dữ liệu trả về, không cần const response =
            await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            alert("Đăng ký thành công! Hãy đăng nhập.");
            navigate('/login');
        } catch (error: any) { // Thêm : any để sửa lỗi đỏ ở catch
            const message = error.response?.data?.message || "Đăng ký thất bại!";
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]"
            >
                {/* Cột trái: Hình ảnh */}
                <div className="hidden md:block md:w-2/5 relative overflow-hidden">
                    <img alt="Cửa hàng" className="absolute inset-0 w-full h-full object-cover" src={HERO_IMAGE} />
                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[1px]" />
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h2 className="text-xl font-bold mb-2 leading-tight">Công nghệ dẫn đầu.</h2>
                        <p className="text-sm text-white/80 leading-relaxed">Trải nghiệm những dòng điện thoại mới nhất với ưu đãi độc quyền.</p>
                    </div>
                </div>

                {/* Cột phải: Form */}
                <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Tạo tài khoản</h1>
                        <p className="text-gray-500 text-base">Bắt đầu hành trình công nghệ của bạn ngay hôm nay.</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleRegister}>
                        {/* Username (Ánh xạ từ Họ và Tên) */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="username">
                                Tên đăng nhập (Ít nhất 3 ký tự)
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="nguyenvan_a"
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
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all text-base placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="password">
                                    Mật khẩu (≥ 6 ký tự)
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all text-base placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1" htmlFor="confirmPassword">
                                    Xác nhận
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all text-base placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Button Đăng ký */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg font-bold text-base shadow-md transition-all mt-2 ${
                                isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-700 text-white hover:bg-indigo-800'
                            }`}
                            type="submit"
                        >
                            {isLoading ? "Đang xử lý..." : "Tạo tài khoản ngay"}
                        </motion.button>

                        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                            Đã có tài khoản?{" "}
                            <Link className="text-indigo-600 font-bold hover:underline" to="/login">
                                Đăng nhập
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}