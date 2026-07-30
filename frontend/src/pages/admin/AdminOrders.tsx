import React, { useEffect, useState, useCallback } from 'react';
import {
    Loader2, ChevronUp, Eye,
    Clock, CheckCircle2, Truck, Package, XCircle,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axios';

// ─── Types ──────────────────────────────────────────────────────────────────
interface OrderItem {
    id: number;
    variantId: number;
    productId: number;
    productName: string;
    color: string;
    storage: number;
    imageUrl: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    recipientName: string;
    phone: string;
    shippingAddress: string;
    totalAmount: number;
    discountAmount: number;
    shippingFee?: number;
    couponCode: string;
    paymentMethod: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    items: OrderItem[];
}

// ─── Status Config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    PENDING:    { label: 'Chờ xử lý',   color: 'bg-amber-100 text-amber-700',  icon: Clock },
    PROCESSING: { label: 'Đang xử lý',  color: 'bg-blue-100 text-blue-700',    icon: Package },
    SHIPPED:    { label: 'Đang giao',   color: 'bg-indigo-100 text-indigo-700', icon: Truck },
    DELIVERED:  { label: 'Đã giao',     color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
    CANCELLED:  { label: 'Đã hủy',      color: 'bg-red-100 text-red-700',      icon: XCircle },
};

const STATUS_FLOW: Record<string, string[]> = {
    PENDING:    ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED:    ['DELIVERED'],
    DELIVERED:  [],
    CANCELLED:  [],
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');

    // Expanded order row
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    // Status update
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fmtPrice = (n: number) => (n || 0).toLocaleString('vi-VN') + 'đ';
    const fmtDate = (s: string) =>
        new Date(s).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    // ── Fetch Orders ─────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/admin/orders', {
                params: {
                    page,
                    size: 15,
                    status: statusFilter || undefined,
                }
            });
            setOrders(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch {
            console.error('Lỗi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Update Status ─────────────────────────────────────────────────────────
    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await axiosInstance.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
        } finally {
            setUpdatingId(null);
        }
    };

    // ── Status counts (from current page - for visual indicator) ─────────────
    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // ── Status Badge ──────────────────────────────────────────────────────────
    const StatusBadge = ({ status }: { status: string }) => {
        const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-600', icon: Clock };
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
                <Icon size={11} /> {cfg.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Quản lý Đơn hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tổng cộng <span className="font-bold text-indigo-600">{totalElements.toLocaleString('vi-VN')}</span> đơn hàng
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors font-semibold text-sm"
                >
                    <RefreshCw size={15} /> Làm mới
                </button>
            </div>

            {/* ── Status Filter Tabs ── */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { value: '', label: 'Tất cả' },
                    { value: 'PENDING',    label: 'Chờ xử lý' },
                    { value: 'PROCESSING', label: 'Đang xử lý' },
                    { value: 'SHIPPED',    label: 'Đang giao' },
                    { value: 'DELIVERED',  label: 'Đã giao' },
                    { value: 'CANCELLED',  label: 'Đã hủy' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            statusFilter === tab.value
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                        {tab.label}
                        {tab.value && statusCounts[tab.value] > 0 && (
                            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                                statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {statusCounts[tab.value]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold">Mã đơn / Thời gian</th>
                            <th className="p-4 font-semibold">Khách hàng</th>
                            <th className="p-4 font-semibold">Thanh toán</th>
                            <th className="p-4 font-semibold text-right">Tổng tiền</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-center">Cập nhật</th>
                            <th className="p-4 font-semibold text-center">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center">
                                    <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={32} />
                                    <p className="text-gray-400 text-sm">Đang tải đơn hàng...</p>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center text-gray-400">
                                    Không có đơn hàng nào
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        {/* Order ID & Time */}
                                        <td className="p-4">
                                            <p className="font-bold text-indigo-600">#{order.id}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
                                        </td>

                                        {/* Customer */}
                                        <td className="p-4">
                                            <p className="font-semibold text-gray-900">{order.recipientName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{order.phone}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate">{order.shippingAddress}</p>
                                        </td>

                                        {/* Payment Method */}
                                        <td className="p-4">
                                            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                                                order.paymentMethod === 'VNPAY'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {order.paymentMethod === 'VNPAY' ? '💳 VNPay' : '💵 COD'}
                                            </span>
                                            {order.couponCode && (
                                                <p className="text-[10px] text-green-600 mt-1 font-semibold">🏷 {order.couponCode}</p>
                                            )}
                                        </td>

                                        {/* Total */}
                                        <td className="p-4 text-right">
                                            <p className="font-black text-gray-900">{fmtPrice(order.totalAmount)}</p>
                                            {order.discountAmount > 0 && (
                                                <p className="text-xs text-green-600 mt-0.5">-{fmtPrice(order.discountAmount)}</p>
                                            )}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-4 text-center">
                                            <StatusBadge status={order.status} />
                                        </td>

                                        {/* Status Update Actions */}
                                        <td className="p-4 text-center">
                                            {STATUS_FLOW[order.status]?.length > 0 ? (
                                                <div className="flex flex-col gap-1 items-center">
                                                    {STATUS_FLOW[order.status].map(nextStatus => {
                                                        const cfg = STATUS_CONFIG[nextStatus];
                                                        const isCancel = nextStatus === 'CANCELLED';
                                                        return (
                                                            <button
                                                                key={nextStatus}
                                                                onClick={() => handleUpdateStatus(order.id, nextStatus)}
                                                                disabled={updatingId === order.id}
                                                                className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-colors w-full whitespace-nowrap disabled:opacity-50 ${
                                                                    isCancel
                                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                                                }`}
                                                            >
                                                                {updatingId === order.id
                                                                    ? <Loader2 size={12} className="animate-spin mx-auto" />
                                                                    : cfg?.label
                                                                }
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>

                                        {/* Expand Details */}
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                {expandedOrderId === order.id ? <ChevronUp size={18} /> : <Eye size={18} />}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* ── Expanded Detail Row ── */}
                                    <AnimatePresence>
                                        {expandedOrderId === order.id && (
                                            <tr>
                                                <td colSpan={7} className="p-0 bg-indigo-50/30">
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-5 space-y-3">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                                Sản phẩm trong đơn #{order.id}
                                                            </p>
                                                            {order.items.map(item => (
                                                                <div
                                                                    key={item.id}
                                                                    className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-4"
                                                                >
                                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                                        <img
                                                                            src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80'}
                                                                            alt={item.productName}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">{item.color} — {item.storage}GB</p>
                                                                    </div>
                                                                    <div className="text-right flex-shrink-0">
                                                                        <p className="font-bold text-gray-800">{fmtPrice(item.price)}</p>
                                                                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                                    </div>
                                                                    <div className="text-right flex-shrink-0 w-28">
                                                                        <p className="font-black text-indigo-600">{fmtPrice(item.price * item.quantity)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {/* Order Summary */}
                                                            <div className="bg-white rounded-xl border border-gray-200 p-4 mt-2">
                                                                <div className="flex flex-col gap-1.5 text-sm max-w-xs ml-auto">
                                                                    <div className="flex justify-between text-gray-600">
                                                                        <span>Tạm tính:</span>
                                                                        <span className="font-semibold">{fmtPrice(order.totalAmount + (order.discountAmount || 0) - (order.shippingFee || 0))}</span>
                                                                    </div>
                                                                    {(order.shippingFee || 0) > 0 && (
                                                                        <div className="flex justify-between text-gray-600">
                                                                            <span>Phí vận chuyển:</span>
                                                                            <span className="font-semibold">{fmtPrice(order.shippingFee || 0)}</span>
                                                                        </div>
                                                                    )}
                                                                    {order.discountAmount > 0 && (
                                                                        <div className="flex justify-between text-green-600">
                                                                            <span>Giảm giá ({order.couponCode}):</span>
                                                                            <span className="font-semibold">-{fmtPrice(order.discountAmount)}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between text-base font-black text-gray-900 pt-1.5 border-t border-gray-100">
                                                                        <span>Tổng cộng:</span>
                                                                        <span className="text-indigo-600">{fmtPrice(order.totalAmount)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                                                    <p>📍 Địa chỉ: {order.shippingAddress}</p>
                                                                    <p className="mt-1">📱 SĐT: {order.phone}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            Trang <b>{page + 1}</b> / {totalPages}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ←
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                                const pageNum = totalPages <= 7
                                    ? i
                                    : page < 4 ? i
                                    : page > totalPages - 5 ? totalPages - 7 + i
                                    : page - 3 + i;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                                            page === pageNum
                                                ? 'bg-indigo-600 text-white'
                                                : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
