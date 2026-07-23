import { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart, DollarSign, Loader2, TrendingUp, Calendar, Box, Activity } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    revenueByDate: { date: string; revenue: number }[];
    ordersByStatus: { status: string; count: number }[];
}

interface RecentOrder {
    id: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    user: { username: string; email: string };
    items: { quantity: number; variant: { color: string; storage: number; product: { name: string } } }[];
}

export default function AdminDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7days');

    const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
    const STATUS_LABELS: Record<string, string> = {
        'PENDING': 'Chờ xử lý',
        'PROCESSING': 'Đang xử lý',
        'SHIPPED': 'Đang giao',
        'DELIVERED': 'Thành công',
        'CANCELLED': 'Đã hủy'
    };

    const fmtPrice = (n: number) => n?.toLocaleString('vi-VN') + 'đ';
    const fmtDate = (s: string) => new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, ordersRes] = await Promise.all([
                    axiosInstance.get('/admin/dashboard/stats', { params: { period } }),
                    axiosInstance.get('/admin/orders', { params: { size: 5, sort: 'createdAt,desc' } })
                ]);
                setStats(statsRes.data);
                setRecentOrders(ordersRes.data.content);
            } catch (error) {
                console.error("Lỗi tải dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    const statCards = [
        { label: 'Tổng doanh thu', value: stats ? fmtPrice(stats.totalRevenue) : '0đ', icon: <DollarSign className="text-emerald-600" size={24} />, color: 'bg-emerald-100', trend: '+12%' },
        { label: 'Tổng đơn hàng', value: stats?.totalOrders || 0, icon: <ShoppingCart className="text-blue-600" size={24} />, color: 'bg-blue-100', trend: '+5%' },
        { label: 'Sản phẩm', value: stats?.totalProducts || 0, icon: <Package className="text-amber-600" size={24} />, color: 'bg-amber-100' },
        { label: 'Người dùng', value: stats?.totalUsers || 0, icon: <Users className="text-purple-600" size={24} />, color: 'bg-purple-100', trend: '+18%' },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-sm border border-slate-700">
                    <p className="font-bold mb-1">{label}</p>
                    <p className="text-emerald-400 font-bold">{fmtPrice(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Đang tổng hợp dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Chào quay trở lại, {user?.username || 'Admin'}! 👋</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng quan tình hình kinh doanh của shop</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 shadow-sm hover:border-indigo-300 transition-colors">
                    <Calendar size={16} className="text-indigo-500" />
                    <select 
                        className="bg-transparent border-none outline-none cursor-pointer font-semibold text-gray-700"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="7days">7 ngày gần nhất</option>
                        <option value="1month">1 tháng qua</option>
                        <option value="1year">1 năm qua</option>
                    </select>
                </div>
            </header>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            {stat.trend && (
                                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                                    <TrendingUp size={14} /> {stat.trend} so với tuần trước
                                </p>
                            )}
                        </div>
                        <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Biểu đồ doanh thu */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Activity className="text-indigo-500" size={20} />
                                Biểu đồ Doanh thu
                            </h3>
                            <p className="text-xs text-gray-500">
                                Dựa trên các đơn hàng đã giao thành công 
                                ({period === '7days' ? ' 7 ngày gần nhất' : period === '1month' ? ' 1 tháng qua' : ' 1 năm qua'})
                            </p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.revenueByDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ tròn trạng thái đơn hàng */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <Box className="text-indigo-500" size={20} />
                            Trạng thái đơn hàng
                        </h3>
                    </div>
                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.ordersByStatus || []}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {(stats?.ordersByStatus || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => [value, STATUS_LABELS[name as string] || name]} 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend 
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => <span className="text-sm font-semibold text-gray-700 ml-1">{STATUS_LABELS[value as string] || value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Đơn hàng mới nhất */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <Box className="text-indigo-500" size={20} />
                        Đơn hàng mới nhất
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {recentOrders.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-gray-400 text-sm">Chưa có đơn hàng nào</div>
                    ) : (
                        recentOrders.map(order => (
                            <div key={order.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all bg-gray-50/50 flex flex-col justify-between">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{order.user?.username || 'Khách vãng lai'}</p>
                                        <p className="text-[11px] text-gray-400 mt-1">{fmtDate(order.createdAt)}</p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap ${
                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                        order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {STATUS_LABELS[order.status] || order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100">
                                    <div className="text-xs text-gray-500 font-medium">
                                        {order.items?.length || 0} sản phẩm
                                    </div>
                                    <p className="font-black text-indigo-600">{fmtPrice(order.totalPrice)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                </div>
            </div>

    );
}