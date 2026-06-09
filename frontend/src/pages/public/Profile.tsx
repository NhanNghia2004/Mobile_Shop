import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Save, Loader2, ShieldAlert, ShoppingBag, Heart, RefreshCw, LogOut, Edit3, Package, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
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
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as 'profile' | 'security' | 'orders') || 'profile';
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'orders'>(initialTab);
    
    // Đơn hàng state
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // State quản lý chế độ xem / chỉnh sửa hồ sơ
    const [isEditingMode, setIsEditingMode] = useState(false);

    // State quản lý thông báo nội bộ
    const [alertMsg, setAlertMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const showAlert = (text: string, type: 'success' | 'error') => {
        setAlertMsg({ text, type });
        setTimeout(() => setAlertMsg(null), 5000);
    };

    // 2. Lấy dữ liệu Profile khi load trang
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/user/profile');
            setProfile({
                username: response.data.username || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                address: response.data.address || '',
                avatarUrl: response.data.avatarUrl || ''
            });
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

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const { data } = await api.get('/orders');
            // data.content vì API trả về PageResponse
            setOrders(data.content || []);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
            showAlert("Không thể lấy danh sách đơn hàng", "error");
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'orders' && orders.length === 0) {
            fetchOrders();
        }
    }, [activeTab]);

    const changeTab = (tab: 'profile' | 'security' | 'orders') => {
        setActiveTab(tab);
        setSearchParams({ tab });
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
            if (profile.username) formData.append('username', profile.username);
            if (profile.phone) formData.append('phone', profile.phone);
            if (profile.address) formData.append('address', profile.address);

            if (selectedFile) {
                formData.append('avatarFile', selectedFile);
            } else if (profile.avatarUrl) {
                formData.append('avatarUrl', profile.avatarUrl);
            }

            const response = await api.put('/user/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setProfile({
                username: response.data.username || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                address: response.data.address || '',
                avatarUrl: response.data.avatarUrl || ''
            });

            setSelectedFile(null);
            setPreviewUrl(null);
            setIsEditingMode(false); // Lưu thành công -> Khóa form lại

            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...savedUser,
                avatarUrl: response.data.avatarUrl
            }));

            window.dispatchEvent(new Event("storage"));
            showAlert("Cập nhật thành công!", "success");

        } catch (error: any) {
            showAlert(error.response?.data?.message || "Cập nhật thất bại!", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    // 4. Xử lý đổi mật khẩu
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showAlert("Mật khẩu mới không khớp!", "error");
            return;
        }

        try {
            await api.put('/user/profile/change-password', passwordData);
            showAlert("Đổi mật khẩu thành công!", "success");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            showAlert(error.response?.data?.message || "Đổi mật khẩu thất bại!", "error");
        }
    };

    if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 font-sans bg-[#fbfbfb] min-h-screen text-[#333]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

                {/* --- CỘT TRÁI: SIDEBAR DI CHUYỂN MENU --- */}
                <div className="md:col-span-1 space-y-6 pl-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src={previewUrl || profile.avatarUrl || "https://ui-avatars.com/api/?name=" + (profile.username || "Admin")}
                            alt="User mini avatar"
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                        <div className="leading-tight">
                            <p className="text-xs text-gray-400">Tài khoản của</p>
                            <h3 className="font-semibold text-sm text-gray-800 truncate max-w-[150px]">{profile.username || "Nguyễn admin"}</h3>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <button
                            type="button"
                            onClick={() => changeTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'profile'
                                    ? 'text-[#00b050] bg-emerald-50/60 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <User size={16} className={activeTab === 'profile' ? 'text-[#00b050]' : 'text-blue-500'} />
                            <span>Thông tin tài khoản</span>
                        </button>

                        <button 
                            type="button" 
                            onClick={() => changeTab('orders')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'orders'
                                    ? 'text-[#00b050] bg-emerald-50/60 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <ShoppingBag size={16} className={activeTab === 'orders' ? 'text-[#00b050]' : 'text-teal-500'} />
                            <span>Đơn hàng của bạn</span>
                        </button>

                        <button type="button" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                            <Heart size={16} className="text-red-400" />
                            <span>Danh sách yêu thích</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => changeTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'security'
                                    ? 'text-[#00b050] bg-emerald-50/60 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <RefreshCw size={16} className={activeTab === 'security' ? 'text-[#00b050]' : 'text-amber-500'} />
                            <span>Đổi mật khẩu</span>
                        </button>

                        <div className="pt-2 border-t border-gray-100 mt-2">
                            <button
                                type="button"
                                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <LogOut size={16} />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </nav>
                </div>

                {/* --- CỘT PHẢI: KHU VỰC THÔNG TIN CHÍNH --- */}
                <div className="md:col-span-3 bg-white border border-gray-100 rounded-lg p-8 shadow-sm min-h-[550px] relative">
                    
                    {/* Thông báo cập nhật */}
                    {alertMsg && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
                            alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            <span>{alertMsg.text}</span>
                        </div>
                    )}

                    {/* Tab 1: Hồ Sơ Của Tôi */}
                    {activeTab === 'profile' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="border-b border-gray-100 pb-4 mb-8">
                                <h1 className="text-xl font-medium text-center text-gray-800">Hồ Sơ Của Tôi</h1>
                                <p className="text-xs text-center text-gray-500 mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Khối các ô Input nhập liệu (Trái) */}
                                <div className="lg:col-span-2 space-y-5 text-sm">

                                    {/* Hàng Email */}
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label className="text-right text-gray-500 pr-2">Email</label>
                                        <div className="col-span-2">
                                            <input
                                                type="email"
                                                disabled={!isEditingMode}
                                                value={profile.email}
                                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-gray-400 transition-all text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Hàng Tên */}
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label className="text-right text-gray-500 pr-2">Tên</label>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                disabled={!isEditingMode}
                                                value={profile.username || ''}
                                                placeholder="Nhập họ tên của bạn"
                                                onChange={(e) => setProfile({...profile, username: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-gray-400 transition-all text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Hàng Số điện thoại */}
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label className="text-right text-gray-500 pr-2">Số điện thoại</label>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                disabled={!isEditingMode}
                                                value={profile.phone || ''}
                                                placeholder="Nhập số điện thoại"
                                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-gray-400 transition-all text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Hàng Địa chỉ */}
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label className="text-right text-gray-500 pr-2">Địa chỉ</label>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                disabled={!isEditingMode}
                                                value={profile.address || ''}
                                                placeholder="Nhập địa chỉ của bạn"
                                                onChange={(e) => setProfile({...profile, address: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-gray-400 transition-all text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Khu vực Xử lý Nút Hành Động */}
                                    <div className="grid grid-cols-3 gap-4 pt-4">
                                        <div></div>
                                        <div className="col-span-2 flex gap-3">
                                            {!isEditingMode ? (
                                                <button
                                                    type="button" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setIsEditingMode(true);
                                                    }}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium text-sm px-6 py-2.5 rounded transition-all flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <Edit3 size={14} />
                                                    Chỉnh sửa hồ sơ
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        type="submit"
                                                        disabled={isUpdating}
                                                        className="bg-[#004b23] hover:bg-[#003c1c] text-white font-medium text-sm px-8 py-2.5 rounded transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
                                                    >
                                                        {isUpdating && <Loader2 className="animate-spin" size={14} />}
                                                        <Save size={14} />
                                                        Lưu thay đổi
                                                    </button>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setIsEditingMode(false);
                                                            // Đặt lại dữ liệu về cũ (tùy chọn)
                                                            fetchProfile();
                                                        }}
                                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm px-6 py-2.5 rounded transition-all flex items-center justify-center shadow-sm"
                                                    >
                                                        Hủy
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                {/* Khối Avatar bên phải */}
                                <div className="lg:col-span-1 border-l border-gray-100 flex flex-col items-center justify-start pt-4 px-4 text-center">
                                    <div className="w-28 h-28 rounded-full border border-gray-100 mb-4 overflow-hidden relative group">
                                        <img
                                            src={previewUrl || profile.avatarUrl || "https://ui-avatars.com/api/?name=" + (profile.username || "Admin")}
                                            alt="Avatar Large Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Nút Chọn Ảnh cục bộ */}
                                    <label className={`border border-gray-200 text-sm px-4 py-2 rounded transition-all mb-3 block text-gray-700 ${isEditingMode ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50 bg-gray-50'}`}>
                                        Chọn Ảnh
                                        <input
                                            type="file"
                                            accept="image/*"
                                            disabled={!isEditingMode}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <div className="text-xs text-gray-400 space-y-1 leading-relaxed mb-4">
                                        <p>Dung lượng file tối đa 5 MB</p>
                                        <p>Định dạng: .JPEG, .PNG, .JPG</p>
                                    </div>

                                    {/* Ô nhập link ảnh (URL) */}
                                    <div className="w-full text-left space-y-1.5 border-t border-gray-100 pt-4">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block pl-0.5">Hoặc nhập link ảnh (URL)</label>
                                        <input
                                            type="text"
                                            disabled={!isEditingMode}
                                            placeholder={isEditingMode ? "Dán link ảnh tại đây..." : "Bấm chỉnh sửa để nhập..."}
                                            value={profile.avatarUrl || ''}
                                            onChange={(e) => setProfile({...profile, avatarUrl: e.target.value})}
                                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-gray-400 focus:bg-white transition-all text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                                        />
                                    </div>

                                    {selectedFile && (
                                        <span className="text-[11px] text-emerald-600 mt-3 block font-medium truncate max-w-full">
                                            Đã chọn: {selectedFile.name}
                                        </span>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Tab 2: Bảo mật & Đổi mật khẩu (Giữ nguyên vẹn) */}
                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="border-b border-gray-100 pb-4 mb-8">
                                <h1 className="text-xl font-medium text-gray-800">Thay đổi mật khẩu</h1>
                                <p className="text-xs text-gray-500 mt-1">Quản lý và cập nhật mật khẩu định kỳ để nâng cao tính bảo mật.</p>
                            </div>

                            <div className="bg-yellow-50/70 border border-yellow-100 rounded-xl p-4 flex gap-3 text-yellow-800 text-sm mb-6">
                                <ShieldAlert size={20} className="flex-shrink-0 text-yellow-600" />
                                <div>
                                    <p className="font-bold text-gray-800">Thay đổi mật khẩu</p>
                                    <p className="text-xs text-gray-600 mt-0.5">Khuyên dùng mật khẩu từ 8 ký tự trở lên bao gồm cả chữ cái và số để đảm bảo tính an toàn cao nhất.</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="max-w-xl space-y-5 text-sm">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-gray-500 text-right pr-2">Mật khẩu cũ</label>
                                    <input
                                        type="password" placeholder="Nhập mật khẩu hiện tại" required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="col-span-2 px-3 py-2 border border-gray-200 rounded outline-none focus:border-gray-400 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-gray-500 text-right pr-2">Mật khẩu mới</label>
                                    <input
                                        type="password" placeholder="Nhập mật khẩu mới" required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className="col-span-2 px-3 py-2 border border-gray-200 rounded outline-none focus:border-gray-400 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-gray-500 text-right pr-2">Xác nhận mật khẩu</label>
                                    <input
                                        type="password" placeholder="Xác nhận lại mật khẩu mới" required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className="col-span-2 px-3 py-2 border border-gray-200 rounded outline-none focus:border-gray-400 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-2">
                                    <div></div>
                                    <button type="submit" className="col-span-2 w-max bg-gray-900 text-white px-6 py-2 rounded text-sm font-medium hover:bg-black transition-all">
                                        Cập nhật mật khẩu
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Tab 3: Đơn hàng */}
                    {activeTab === 'orders' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
                                <div>
                                    <h1 className="text-xl font-medium text-gray-800">Đơn hàng của bạn</h1>
                                    <p className="text-xs text-gray-500 mt-1">Theo dõi trạng thái và lịch sử mua hàng</p>
                                </div>
                                <button onClick={fetchOrders} className="text-sm text-indigo-600 flex items-center gap-1 hover:text-indigo-800">
                                    <RefreshCw size={14} className={loadingOrders ? "animate-spin" : ""} /> Cập nhật
                                </button>
                            </div>

                            {loadingOrders ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
                                    <Link to="/products" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                                        Mua sắm ngay
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: any) => (
                                        <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100 text-sm">
                                                <div className="flex items-center gap-4 text-gray-600 font-medium">
                                                    <span>Mã ĐH: #{order.id}</span>
                                                    <span>|</span>
                                                    <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                                <div className={`font-bold flex items-center gap-1.5 ${
                                                    order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'text-green-600' :
                                                    order.status === 'CANCELLED' ? 'text-red-500' : 'text-blue-600'
                                                }`}>
                                                    {order.status === 'COMPLETED' || order.status === 'DELIVERED' ? <CheckCircle2 size={16} /> :
                                                     order.status === 'CANCELLED' ? <XCircle size={16} /> : <Clock size={16} />}
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                {order.items && order.items.map((item: any) => (
                                                    <div key={item.id} className="flex gap-4 py-2 border-b border-gray-50 last:border-0 last:pb-0">
                                                        <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                            <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.productName} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <Link to={`/product/${item.productId}`} className="text-sm font-semibold text-gray-800 hover:text-indigo-600 line-clamp-1">{item.productName}</Link>
                                                            <p className="text-xs text-gray-500">{item.color} · {item.storage}GB</p>
                                                            <p className="text-xs text-gray-500 mt-1">x{item.quantity}</p>
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-800 flex-shrink-0">
                                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                                    <div className="text-xs text-gray-500">
                                                        Thanh toán: <span className="font-semibold uppercase">{order.paymentMethod}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        Tổng tiền: <span className="text-lg font-black text-indigo-700">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
}