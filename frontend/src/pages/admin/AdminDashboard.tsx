import { LayoutDashboard, Users, Package, ShoppingCart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const stats = [
        { label: 'Tổng đơn hàng', value: '1,250', icon: <ShoppingCart className="text-blue-600" />, color: 'bg-blue-100' },
        { label: 'Sản phẩm', value: '48', icon: <Package className="text-green-600" />, color: 'bg-green-100' },
        { label: 'Người dùng', value: '850', icon: <Users className="text-purple-600" />, color: 'bg-purple-100' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar mini bên trái */}
            <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:block">
                <h2 className="text-2xl font-black mb-10 text-indigo-400">ADMIN PANEL</h2>
                <nav className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-indigo-600 rounded-lg cursor-pointer">
                        <LayoutDashboard size={20} />
                        <span className="font-bold">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
                        <Package size={20} />
                        <span>Quản lý sản phẩm</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
                        <Users size={20} />
                        <span>Khách hàng</span>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Chào quay trở lại, {user.username}!</h1>
                        <p className="text-gray-500">Hôm nay cửa hàng của bạn thế nào?</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    >
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </header>

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Khu vực bảng dữ liệu mẫu */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4">Đơn hàng mới nhất</h3>
                    <div className="border-t border-gray-100 py-4 text-center text-gray-400 italic">
                        Dữ liệu đang được tải từ Server...
                    </div>
                </div>
            </div>
        </div>
    );
}