import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, LogOut, Ticket, Warehouse, ShoppingBag, Star } from 'lucide-react';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowLogoutConfirm(false);
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white p-6 shadow-xl hidden md:flex flex-col justify-between h-screen sticky top-0 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-black mb-8 text-indigo-400">ADMIN PANEL</h2>
                    <nav className="space-y-2">
                        <Link to="/admin/dashboard">
                            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/dashboard' ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </div>
                        </Link>
                        <Link to="/admin/products">
                            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/products' ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                                <Package size={20} />
                                <span>Quản lý sản phẩm</span>
                            </div>
                        </Link>
                        <Link to="/admin/users">
                            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/users' ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                                <Users size={20} />
                                <span>Khách hàng</span>
                            </div>
                        </Link>
                        <Link to="/admin/coupons">
                            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/coupons' ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                                <Ticket size={20} />
                                <span>Mã giảm giá</span>
                            </div>
                        </Link>
                        <Link to="/admin/inventory">
                            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/inventory' ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                                <Warehouse size={20} />
                                <span>Tồn kho</span>
                            </div>
                        </Link>
                        <Link to="/admin/orders">
                            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/orders' ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                                <ShoppingBag size={20} />
                                <span>Đơn hàng</span>
                            </div>
                        </Link>
                        <Link to="/admin/reviews">
                            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${location.pathname === '/admin/reviews' ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                                <Star size={20} />
                                <span>Đánh giá</span>
                            </div>
                        </Link>
                    </nav>
                </div>

                {/* Logout Button in Sidebar */}
                <div className="pt-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 w-full rounded-lg cursor-pointer transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold"
                    >
                        <LogOut size={20} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div 
                        className="bg-white text-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận đăng xuất</h3>
                        <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản admin không?</p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4.5 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={confirmLogout}
                                className="px-4.5 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm shadow-sm"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
