import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, LogOut, Ticket, Warehouse, ShoppingBag, Star } from 'lucide-react';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:block">
                <h2 className="text-2xl font-black mb-10 text-indigo-400">ADMIN PANEL</h2>
                <nav className="space-y-4">
                    <Link to="/admin/dashboard">
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/dashboard' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'}`}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </div>
                    </Link>
                    <Link to="/admin/products">
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/products' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'}`}>
                            <Package size={20} />
                            <span>Quản lý sản phẩm</span>
                        </div>
                    </Link>
                    <Link to="/admin/users">
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/users' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'}`}>
                            <Users size={20} />
                            <span>Khách hàng</span>
                        </div>
                    </Link>
                    <Link to="/admin/coupons">
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/coupons' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'}`}>
                            <Ticket size={20} />
                            <span>Mã giảm giá</span>
                        </div>
                    </Link>
                    <Link to="/admin/inventory">
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/inventory' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'}`}>
                            <Warehouse size={20} />
                            <span>Tồn kho</span>
                        </div>
                    </Link>
                    <Link to="/admin/orders">
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/orders' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'}`}>
                            <ShoppingBag size={20} />
                            <span>Đơn hàng</span>
                        </div>
                    </Link>
                    <Link to="/admin/reviews">
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/reviews' ? 'bg-indigo-600 font-bold' : 'hover:bg-slate-800'}`}>
                            <Star size={20} />
                            <span>Đánh giá</span>
                        </div>
                    </Link>
                </nav>
            </div>


            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="flex justify-end items-center bg-white p-4 shadow-sm z-10 border-b">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    >
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </header>
                
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
