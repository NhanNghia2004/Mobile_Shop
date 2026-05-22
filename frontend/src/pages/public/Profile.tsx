import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, Camera, ShieldAlert } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 2. Lấy dữ liệu Profile khi load trang
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/user/profile');
            setProfile(response.data);
        } catch (error: any) {
            console.error("Lỗi chi tiết:", error.response?.status, error.response?.data);
            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý chọn file ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 3. Xử lý cập nhật thông tin (Update Profile)
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('email', profile.email);
            if (profile.phone) formData.append('phone', profile.phone);
            if (profile.address) formData.append('address', profile.address);

            if (selectedFile) {
                formData.append('avatarFile', selectedFile);
            } else if (profile.avatarUrl) {
                formData.append('avatarUrl', profile.avatarUrl);
            }

            const response = await api.put('/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Lấy data mới từ response
            setProfile(response.data);
            setSelectedFile(null);
            setPreviewUrl(null);

            // Cập nhật localStorage với data mới nhất từ server
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...savedUser,
                avatarUrl: response.data.avatarUrl
            }));

            window.dispatchEvent(new Event("storage"));
            alert("Cập nhật thành công!");

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
            await api.put('/user/profile/change-password', passwordData);
            alert("Đổi mật khẩu thành công!");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            alert(error.response?.data?.message || "Đổi mật khẩu thất bại!");
        }
    };

    if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* CỘT TRÁI: AVATAR & THÔNG TIN CHUNG (1/4 cột) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative">
                        {/* Avatar Image container with edit overlay */}
                        <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer overflow-hidden rounded-full border-4 border-indigo-50">
                            <img
                                key={profile.avatarUrl}
                                src={previewUrl || profile.avatarUrl || "https://ui-avatars.com/api/?name=" + profile.username}
                                alt="Avatar"
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                            />
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                                <Camera size={20} className="mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Tải ảnh lên</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        
                        <h2 className="text-lg font-black text-gray-900 truncate">{profile.username}</h2>
                        <p className="text-gray-400 text-xs truncate mb-4">{profile.email}</p>

                        {selectedFile && (
                            <div className="bg-indigo-50/50 text-indigo-700 text-xs py-2 px-3 rounded-xl mb-4 font-bold border border-indigo-100 truncate">
                                Đã chọn: {selectedFile.name}
                            </div>
                        )}

                        <hr className="my-4 border-gray-100" />

                        {/* Ô dán link ảnh đại diện (URL) */}
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nhập link ảnh (URL)</label>
                            <input
                                type="text"
                                placeholder="Dán link ảnh tại đây..."
                                value={profile.avatarUrl || ''}
                                onChange={(e) => setProfile({...profile, avatarUrl: e.target.value})}
                                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: TABS & FORMS (3/4 cột) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-100 mb-8 gap-6 text-sm font-bold">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`pb-4 px-1 transition-all flex items-center gap-2 ${
                                    activeTab === 'profile'
                                        ? 'border-b-2 border-indigo-700 text-indigo-700'
                                        : 'text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <User size={16} /> Hồ sơ cá nhân
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`pb-4 px-1 transition-all flex items-center gap-2 ${
                                    activeTab === 'security'
                                        ? 'border-b-2 border-indigo-700 text-indigo-700'
                                        : 'text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                <Lock size={16} /> Bảo mật & Mật khẩu
                            </button>
                        </div>

                        {/* Tab Content 1: Profile */}
                        {activeTab === 'profile' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email" value={profile.email}
                                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
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
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
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
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 pt-2">
                                        <button
                                            disabled={isUpdating}
                                            className="bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-800 transition-all disabled:bg-gray-400 shadow-lg shadow-indigo-100"
                                        >
                                            {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Tab Content 2: Security */}
                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex gap-3 text-yellow-800 text-sm mb-4">
                                    <ShieldAlert size={20} className="flex-shrink-0 text-yellow-600" />
                                    <div>
                                        <p className="font-bold">Thay đổi mật khẩu</p>
                                        <p className="text-xs text-yellow-700/80">Khuyên dùng mật khẩu từ 8 ký tự trở lên bao gồm cả chữ cái và số để đảm bảo tính an toàn cao nhất.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu cũ</label>
                                            <input
                                                type="password" placeholder="Nhập mật khẩu hiện tại" required
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu mới</label>
                                            <input
                                                type="password" placeholder="Nhập mật khẩu mới" required
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Xác nhận mật khẩu mới</label>
                                            <input
                                                type="password" placeholder="Xác nhận lại mật khẩu mới" required
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200">
                                        Cập nhật mật khẩu
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </div>
                </div>

            </motion.div>
        </div>
    );
}