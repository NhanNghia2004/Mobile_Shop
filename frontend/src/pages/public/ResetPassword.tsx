import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Lấy token từ URL: /reset-password?token=xxx

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setIsSuccess(true);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Link đã hết hạn hoặc không hợp lệ!');
        } finally {
            setIsLoading(false);
        }
    };

    // Không có token trên URL
    if (!token) {
        return (
            <div className="py-12 bg-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans">
                <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full">
                    <p className="text-red-500 font-bold">Link không hợp lệ!</p>
                    <Link to="/forgot-password" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
                        Yêu cầu link mới
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 bg-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10"
            >
                {isSuccess ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600" size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại thành công!</h2>
                        <p className="text-gray-500 text-sm mb-6">Mật khẩu của bạn đã được cập nhật.</p>
                        <Link
                            to="/login"
                            className="inline-block bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-800 transition-all"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h2>
                            <p className="text-gray-500 text-sm">Nhập mật khẩu mới cho tài khoản của bạn.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                                    Mật khẩu mới
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-lg font-bold text-base bg-indigo-700 text-white hover:bg-indigo-800 disabled:bg-indigo-400 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <><Loader2 className="animate-spin" size={18} /> Đang xử lý...</> : 'Đặt lại mật khẩu'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}