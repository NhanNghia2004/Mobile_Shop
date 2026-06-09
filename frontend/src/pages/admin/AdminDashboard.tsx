import { Users, Package, ShoppingCart } from 'lucide-react';

export default function AdminDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const stats = [
        { label: 'Tổng đơn hàng', value: '1,250', icon: <ShoppingCart className="text-blue-600" />, color: 'bg-blue-100' },
        { label: 'Sản phẩm', value: '48', icon: <Package className="text-green-600" />, color: 'bg-green-100' },
        { label: 'Người dùng', value: '850', icon: <Users className="text-purple-600" />, color: 'bg-purple-100' },
    ];

    return (
        <div>
            <header className="mb-10">
                <h1 className="text-2xl font-bold text-gray-800">Chào quay trở lại, {user.username}!</h1>
                <p className="text-gray-500">Hôm nay cửa hàng của bạn thế nào?</p>
            </header>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
                        <div className={`p-4 rounded-xl ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Khu vực bảng dữ liệu mẫu */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Đơn hàng mới nhất</h3>
                <div className="border-t border-gray-100 py-10 text-center text-gray-400 italic bg-gray-50 rounded-xl mt-4">
                    Dữ liệu đang được tải từ Server...
                </div>
            </div>
        </div>
    );
}