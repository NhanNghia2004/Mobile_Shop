import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Lock, Save, Loader2 } from 'lucide-react';
import api from "../../api/axios";

export default function Profile() {
    // 1. Khai báo State
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        phone: '',
        address: '',
        avatarUrl: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // 2. Lấy dữ liệu Profile khi load trang
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const userString = localStorage.getItem('user');
            if (!userString) {
                window.location.href = '/login';
                return;
            }

            const userData = JSON.parse(userString);

            // KIỂM TRA: Nếu console hiện undefined thì Backend của bạn trả về sai tên trường
            console.log("Username dùng để gọi API:", userData.username);

            const response = await api.get(`/profile/${userData.username}`);
            setProfile(response.data);
        } catch (error: any) {
            // In ra lỗi thật để debug
            console.error("Lỗi chi tiết:", error.response);

            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
                localStorage.clear();
                window.location.href = '/login';
            } else {
                alert("Không thể kết nối đến máy chủ!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Xử lý cập nhật thông tin (Update Profile)
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await api.put(`/profile/${userData.username}/update`, {
                email: profile.email,
                phone: profile.phone,
                address: profile.address,
                avatarUrl: profile.avatarUrl
            });
            alert("Cập nhật thông tin thành công!");
            setProfile(response.data);
        } catch (error: any) {
            alert(error.response?.data?.message || "Cập nhật thất bại!");
        } finally {
            setIsUpdating(false);
        }
    };

    // 4. Xử lý đổi mật khẩu
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Mật khẩu mới không khớp!");
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            await api.put(`/profile/${userData.username}/change-password`, passwordData);
            alert("Đổi mật khẩu thành công!");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            alert(error.response?.data?.message || "Đổi mật khẩu thất bại!");
        }
    };

    if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 font-sans">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* CỘT TRÁI: AVATAR & THÔNG TIN CHUNG */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <img
                                src={profile.avatarUrl || "https://ui-avatars.com/api/?name=" + profile.username}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover border-4 border-indigo-50"
                            />
                            <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h2 className="text-xl font-black text-gray-900">@{profile.username}</h2>
                        <p className="text-gray-500 text-sm">{profile.email}</p>
                    </div>
                </div>

                {/* CỘT PHẢI: FORM CẬP NHẬT & ĐỔI MẬT KHẨU */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Form Cập nhật thông tin */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><User size={20} /></div>
                            <h3 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h3>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email" value={profile.email}
                                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text" value={profile.phone || ''}
                                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Địa chỉ</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text" value={profile.address || ''}
                                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    disabled={isUpdating}
                                    className="bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-800 transition-all disabled:bg-gray-400"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Form Đổi mật khẩu */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-red-50 rounded-lg text-red-600"><Lock size={20} /></div>
                            <h3 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h3>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <input
                                    type="password" placeholder="Mật khẩu cũ" required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                                />
                                <input
                                    type="password" placeholder="Mật khẩu mới" required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                                />
                                <input
                                    type="password" placeholder="Xác nhận mật khẩu mới" required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                                />
                            </div>
                            <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all">
                                Cập nhật mật khẩu
                            </button>
                        </form>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}