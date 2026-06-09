import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api/axios";

export default function Register() {
    // 1. State cho các trường nhập liệu
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    // State quản lý thông báo nội bộ
    const [alertMsg, setAlertMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const showAlert = (text: string, type: 'success' | 'error') => {
        setAlertMsg({ text, type });
        setTimeout(() => setAlertMsg(null), 5000);
    };

    const navigate = useNavigate();

    // 2. State cho OTP
    const [step, setStep] = useState<1 | 2>(1); // 1: form đăng ký, 2: nhập OTP
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0); // đếm ngược gửi lại OTP
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const HERO_IMAGE = "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1381&auto=format&fit=crop";

    // Đếm ngược
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // BƯỚC 1: Gửi thông tin đăng ký -> nhận OTP qua email
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showAlert("Mật khẩu xác nhận không khớp!", "error");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            showAlert("Mã OTP đã được gửi đến email của bạn!", "success");
            setStep(2);
            setCountdown(180); // 3 phút = 180 giây
        } catch (error: any) {
            const message = error.response?.data?.message || "Đăng ký thất bại!";
            showAlert(message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // BƯỚC 2: Xác thực OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otpCode.join('');
        if (code.length !== 6) {
            showAlert("Vui lòng nhập đủ 6 số mã OTP!", "error");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/verify-otp', {
                email: formData.email,
                otpCode: code
            });

            showAlert("Xác thực thành công! Đang chuyển đến trang đăng nhập...", "success");
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error: any) {
            const message = error.response?.data?.message || "Xác thực OTP thất bại!";
            showAlert(message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Gửi lại OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;
        try {
            await api.post('/auth/resend-otp', { email: formData.email });
            showAlert("Mã OTP mới đã được gửi!", "success");
            setCountdown(180);
            setOtpCode(['', '', '', '', '', '']);
        } catch (error: any) {
            showAlert(error.response?.data?.message || "Gửi lại OTP thất bại!", "error");
        }
    };

    // Xử lý nhập OTP từng ô
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // chỉ cho nhập số

        const newOtp = [...otpCode];
        newOtp[index] = value.slice(-1); // chỉ lấy 1 ký tự cuối
        setOtpCode(newOtp);

        // Tự động focus sang ô tiếp theo
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Xử lý paste OTP
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtpCode(newOtp);
            otpRefs.current[5]?.focus();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    // Format countdown thành mm:ss
    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
                <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center relative">

                    {/* Thông báo */}
                    {alertMsg && (
                        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
                            alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            <span>{alertMsg.text}</span>
                        </div>
                    )}

                    {/* ========== BƯỚC 1: FORM ĐĂNG KÝ ========== */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Tạo tài khoản</h1>
                                <p className="text-gray-500 text-base">Bắt đầu hành trình công nghệ của bạn ngay hôm nay.</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleRegister}>
                                {/* Username */}
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
                        </motion.div>
                    )}

                    {/* ========== BƯỚC 2: XÁC THỰC OTP ========== */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                            <button
                                type="button"
                                onClick={() => { setStep(1); setOtpCode(['', '', '', '', '', '']); }}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Quay lại
                            </button>

                            <div className="mb-8 text-center">
                                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                    <Mail size={28} className="text-indigo-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Xác thực Email</h1>
                                <p className="text-gray-500 text-sm">
                                    Chúng tôi đã gửi mã OTP 6 số đến
                                </p>
                                <p className="text-indigo-600 font-bold text-sm mt-1">{formData.email}</p>
                            </div>

                            <form className="space-y-6" onSubmit={handleVerifyOtp}>
                                {/* 6 ô nhập OTP */}
                                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                                    {otpCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all bg-gray-50"
                                        />
                                    ))}
                                </div>

                                {/* Đếm ngược */}
                                <div className="text-center">
                                    {countdown > 0 ? (
                                        <p className="text-sm text-gray-500">
                                            Mã OTP hết hạn sau <span className="font-bold text-red-500">{formatCountdown(countdown)}</span>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-red-500 font-medium">
                                            Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
                                        </p>
                                    )}
                                </div>

                                {/* Nút xác thực */}
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    disabled={isLoading || countdown <= 0}
                                    className={`w-full py-3 rounded-lg font-bold text-base shadow-md transition-all ${
                                        isLoading || countdown <= 0 ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-indigo-700 text-white hover:bg-indigo-800'
                                    }`}
                                    type="submit"
                                >
                                    {isLoading ? "Đang xác thực..." : "Xác nhận mã OTP"}
                                </motion.button>

                                {/* Gửi lại OTP */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        Không nhận được mã?{" "}
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={countdown > 0}
                                            className={`font-bold transition-colors ${
                                                countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:underline cursor-pointer'
                                            }`}
                                        >
                                            Gửi lại mã
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}