import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setIsSent(true); // Luôn hiện thông báo thành công dù email có tồn tại hay không (bảo mật)
        } catch (error) {
            setIsSent(true); // Vẫn hiện thành công để tránh lộ thông tin email
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10"
            >
                <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-8">
                    <ArrowLeft size={16} /> Quay lại đăng nhập
                </Link>

                {isSent ? (
                    // Màn hình sau khi gửi email
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="text-green-600" size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kiểm tra email!</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Nếu email <span className="font-bold text-gray-700">{email}</span> tồn tại trong hệ thống,
                            chúng tôi đã gửi link đặt lại mật khẩu. Link có hiệu lực trong <span className="font-bold">15 phút</span>.
                        </p>
                        <Link
                            to="/login"
                            className="mt-6 inline-block bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-800 transition-all"
                        >
                            Về trang đăng nhập
                        </Link>
                    </div>
                ) : (
                    // Form nhập email
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h2>
                            <p className="text-gray-500 text-sm">Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                                    Địa chỉ Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@vidu.com"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-lg font-bold text-base bg-indigo-700 text-white hover:bg-indigo-800 disabled:bg-indigo-400 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <><Loader2 className="animate-spin" size={18} /> Đang gửi...</> : 'Gửi link đặt lại mật khẩu'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}