import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Save, Loader2, ShieldAlert, ShoppingBag, Heart,
    RefreshCw, LogOut, Edit3, Package, ChevronRight,
    CheckCircle2, Clock, XCircle, Star, ShoppingCart,
    Trash2, ChevronLeft, AlertCircle, Search, SlidersHorizontal,
    TrendingDown, Sparkles,
    // OrderHistory icons
    Receipt, RotateCcw, MapPin, CreditCard, PackageOpen, PackageX,
    Filter, Calendar, ChevronDown, ChevronUp, Truck,
} from 'lucide-react';
import api from '../../api/axios';
import { favoritesApi, dispatchFavoriteChange, onFavoriteChange, type FavoriteProduct } from '../../api/favoritesApi';
import ReviewModal from "./Reviewmodel";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const fmtDate  = (s: string) =>
    new Date(s).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

// ══════════════════════════════════════════════════════════════════════════════
// ORDERS TAB — full OrderHistory embedded
// ══════════════════════════════════════════════════════════════════════════════
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

interface OrderItem {
    id: number; productId: number; variantId: number; productName: string;
    color: string; storage: number; imageUrl?: string;
    price: number; quantity: number;
}
interface Order {
    id: number; createdAt: string; status: OrderStatus;
    paymentMethod: string; province?: string;
    shippingFee?: number; totalAmount: number; discountAmount?: number; couponCode?: string; items: OrderItem[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; textColor: string; bgColor: string; borderColor: string }> = {
    PENDING:    { label: 'Chờ xác nhận',  icon: Clock,        textColor: 'text-amber-700',  bgColor: 'bg-amber-50',   borderColor: 'border-amber-200' },
    CONFIRMED:  { label: 'Đã xác nhận',   icon: CheckCircle2, textColor: 'text-blue-700',   bgColor: 'bg-blue-50',    borderColor: 'border-blue-200' },
    PROCESSING: { label: 'Đang đóng gói', icon: Package,      textColor: 'text-indigo-700', bgColor: 'bg-indigo-50',  borderColor: 'border-indigo-200' },
    SHIPPING:   { label: 'Đang giao',     icon: Truck,        textColor: 'text-sky-700',    bgColor: 'bg-sky-50',     borderColor: 'border-sky-200' },
    DELIVERED:  { label: 'Đã giao',       icon: PackageOpen,  textColor: 'text-green-700',  bgColor: 'bg-green-50',   borderColor: 'border-green-200' },
    COMPLETED:  { label: 'Hoàn thành',    icon: CheckCircle2, textColor: 'text-green-700',  bgColor: 'bg-green-50',   borderColor: 'border-green-200' },
    CANCELLED:  { label: 'Đã hủy',        icon: XCircle,      textColor: 'text-red-600',    bgColor: 'bg-red-50',     borderColor: 'border-red-200' },
};

const TRACK_STEPS: { key: OrderStatus; label: string; icon: React.ElementType }[] = [
    { key: 'PENDING',    label: 'Đặt hàng',  icon: Receipt },
    { key: 'CONFIRMED',  label: 'Xác nhận',  icon: CheckCircle2 },
    { key: 'PROCESSING', label: 'Đóng gói',  icon: Package },
    { key: 'SHIPPING',   label: 'Đang giao', icon: Truck },
    { key: 'DELIVERED',  label: 'Đã giao',   icon: PackageOpen },
];
const STEP_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'];
const getStepIndex = (status: OrderStatus) => {
    if (status === 'COMPLETED') return 4;
    if (status === 'CANCELLED') return -1;
    return STEP_ORDER.indexOf(status);
};

const STATUS_TABS: { key: OrderStatus | 'ALL'; label: string }[] = [
    { key: 'ALL',       label: 'Tất cả' },
    { key: 'PENDING',   label: 'Chờ xác nhận' },
    { key: 'SHIPPING',  label: 'Đang giao' },
    { key: 'DELIVERED', label: 'Đã giao' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' },
];

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.textColor} ${cfg.bgColor} ${cfg.borderColor}`}>
            <Icon size={11} />{cfg.label}
        </span>
    );
}

function TrackBar({ status }: { status: OrderStatus }) {
    if (status === 'CANCELLED') return null;
    const current = getStepIndex(status);
    return (
        <div className="flex items-start px-4 py-3 border-b border-gray-100">
            {TRACK_STEPS.map((step, i) => {
                const done = i <= current;
                const active = i === current;
                const Icon = step.icon;
                return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                        {i > 0 && (
                            <div className={`absolute top-[11px] right-1/2 left-0 h-[1.5px] transition-colors ${i <= current ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            done ? (active ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-green-500') : 'bg-gray-100 border border-gray-200'
                        }`}>
                            <Icon size={12} className={done ? 'text-white' : 'text-gray-400'} />
                        </div>
                        <span className={`text-[10px] mt-1.5 text-center leading-tight ${active ? 'text-indigo-700 font-semibold' : done ? 'text-green-700' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function OrderCard({ order, defaultExpanded = false, onCancelOrder }: { order: Order; defaultExpanded?: boolean; onCancelOrder?: (id: number) => void; }) {
    const [expanded, setExpanded]         = useState(defaultExpanded);
    const [showReview, setShowReview]     = useState(false);
    const [reviewedIds, setReviewedIds]   = useState<Set<number>>(new Set());
    const showItems = order.items.slice(0, expanded ? undefined : 2);
    const extra = !expanded && order.items.length > 2 ? order.items.length - 2 : 0;
    const shippingFee = order.shippingFee ?? 0;
    const canReviewOrder = order.status === 'DELIVERED' || order.status === 'COMPLETED';
    const allReviewed = canReviewOrder && order.items.every(i => reviewedIds.has(i.productId));

    const reviewItems = order.items.map(i => ({
        productId:   i.productId,
        variantId:   i.variantId,
        productName: i.productName,
        imageUrl:    i.imageUrl,
        color:       i.color,
        storage:     i.storage,
        orderItemId: i.id,
    }));

    return (
        <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Receipt size={14} className="text-gray-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">#{order.id}</p>
                            {order.couponCode && (
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border border-green-200">
                                    {order.couponCode}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />{fmtDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <StatusBadge status={order.status} />
            </div>

            {/* Track bar */}
            <TrackBar status={order.status} />

            {/* Items */}
            <div className="divide-y divide-gray-50">
                <AnimatePresence>
                    {showItems.map(item => (
                        <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 px-4 py-3">
                            <div className="w-13 h-13 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100" style={{ width: 52, height: 52 }}>
                                <img
                                    src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop'}
                                    alt={item.productName} className="w-full h-full object-cover"
                                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop'; }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link to={`/product/${item.productId}`}>
                                    <p className="text-sm font-medium text-gray-900 truncate hover:text-indigo-600 transition-colors">{item.productName}</p>
                                </Link>
                                <p className="text-xs text-gray-400 mt-0.5">{item.color} · {item.storage}GB · x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 flex-shrink-0">{fmtPrice(item.price * item.quantity)}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {extra > 0 && (
                    <button onClick={() => setExpanded(true)}
                            className="w-full px-4 py-2.5 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1.5 font-medium">
                        <ChevronDown size={13} />Xem thêm {extra} sản phẩm
                    </button>
                )}
                {expanded && order.items.length > 2 && (
                    <button onClick={() => setExpanded(false)}
                            className="w-full px-4 py-2.5 text-xs text-gray-400 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                        <ChevronUp size={13} />Thu gọn
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3 bg-gray-50/50">
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><CreditCard size={12} />{order.paymentMethod}</span>
                    {order.province && <span className="flex items-center gap-1"><MapPin size={11} />{order.province}</span>}
                    <span className="flex items-center gap-1">
                        <Truck size={11} />{shippingFee === 0 ? '🆓 Miễn phí ship' : fmtPrice(shippingFee)}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Tổng thanh toán</p>
                        <p className="text-base font-black text-indigo-700">{fmtPrice(order.totalAmount)}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {canReviewOrder && (
                            <>
                                <Link to={`/product/${order.items[0].productId}`}
                                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                                    <RotateCcw size={12} />Mua lại
                                </Link>
                                {allReviewed ? (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700">
                                        <CheckCircle2 size={12} />Đã đánh giá
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setShowReview(true)}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                                    >
                                        <Star size={12} fill="#D97706" />Đánh giá
                                    </button>
                                )}
                            </>
                        )}
                        {order.status === 'SHIPPING' && (
                            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors">
                                <MapPin size={12} />Theo dõi
                            </button>
                        )}
                        {order.status === 'PENDING' && (
                            <button 
                                onClick={() => onCancelOrder && onCancelOrder(order.id)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                                <XCircle size={12} />Hủy đơn
                            </button>
                        )}
                        <Link to={`/orders/${order.id}`}
                              className="flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                            Chi tiết<ChevronRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReview && (
                <ReviewModal
                    orderId={order.id}
                    items={reviewItems}
                    onClose={() => setShowReview(false)}
                    onSuccess={() => {
                        setReviewedIds(new Set(order.items.map(i => i.productId)));
                        setShowReview(false);
                    }}
                />
            )}
        </motion.div>
    );
}

function StatsStrip({ orders }: { orders: Order[] }) {
    const total     = orders.length;
    const delivered = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
    const shipping  = orders.filter(o => o.status === 'SHIPPING').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
    return (
        <div className="grid grid-cols-4 gap-3 mb-5">
            {[
                { label: 'Tổng đơn',  value: total,     icon: ShoppingBag, color: 'text-gray-700',  bg: 'bg-gray-100' },
                { label: 'Đã giao',   value: delivered, icon: PackageOpen, color: 'text-green-700', bg: 'bg-green-100' },
                { label: 'Đang giao', value: shipping,  icon: Truck,       color: 'text-sky-700',   bg: 'bg-sky-100' },
                { label: 'Đã hủy',   value: cancelled, icon: PackageX,    color: 'text-red-600',   bg: 'bg-red-100' },
            ].map(s => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                        <s.icon size={15} className={s.color} />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400">{s.label}</p>
                        <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function OrdersTab() {
    const [orders, setOrders]           = useState<Order[]>([]);
    const [loading, setLoading]         = useState(true);
    const [activeTab, setActiveTab]     = useState<OrderStatus | 'ALL'>('ALL');
    const [search, setSearch]           = useState('');
    const [sortBy, setSortBy]           = useState<'newest' | 'oldest' | 'highest'>('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage]               = useState(1);
    const ITEMS_PER_PAGE = 5;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders?size=1000');
            setOrders(data.content || data || []);
        } catch { setOrders([]); }
        finally { setLoading(false); }
    }, []);

    const handleCancelOrder = async (orderId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
        try {
            await api.put(`/orders/${orderId}/cancel`);
            fetchOrders();
        } catch (err: any) {
            console.error(err);
            alert("Lỗi khi hủy đơn hàng: " + (err.response?.data?.message || ""));
        }
    };

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = orders
        .filter(o => activeTab === 'ALL' || o.status === activeTab)
        .filter(o => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return String(o.id).includes(q) || o.items.some(i => i.productName.toLowerCase().includes(q));
        })
        .sort((a, b) => {
            if (sortBy === 'newest')  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'oldest')  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return b.totalAmount - a.totalAmount;
        });

    useEffect(() => {
        setPage(1);
    }, [activeTab, search, sortBy]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedOrders = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const tabCount = (key: OrderStatus | 'ALL') =>
        key === 'ALL' ? orders.length : orders.filter(o => o.status === key).length;

    return (
        <div>
            {/* Header */}
            <div className="border-b border-gray-100 pb-4 mb-5 flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-medium text-gray-800 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-indigo-500" />
                        Đơn hàng của bạn
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Theo dõi trạng thái và lịch sử mua hàng</p>
                </div>
                <button onClick={fetchOrders} disabled={loading}
                        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Làm mới
                </button>
            </div>

            {/* Stats */}
            {!loading && orders.length > 0 && <StatsStrip orders={orders} />}

            {/* Search + filter */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <Search size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm theo mã đơn, tên sản phẩm..."
                        className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                            <XCircle size={13} />
                        </button>
                    )}
                </div>
                <button onClick={() => setShowFilters(f => !f)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                            showFilters ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                    <Filter size={13} />Lọc
                </button>
            </div>

            {/* Sort options */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><SlidersHorizontal size={12} />Sắp xếp:</span>
                            {[{ key: 'newest', label: 'Mới nhất' }, { key: 'oldest', label: 'Cũ nhất' }, { key: 'highest', label: 'Giá trị cao' }].map(opt => (
                                <button key={opt.key} onClick={() => setSortBy(opt.key as typeof sortBy)}
                                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                                            sortBy === opt.key ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-white'
                                        }`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
                {STATUS_TABS.map(tab => {
                    const count = tabCount(tab.key);
                    if (count === 0 && tab.key !== 'ALL') return null;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                                    activeTab === tab.key
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }`}>
                            {tab.label}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 size={28} className="animate-spin text-indigo-500" />
                    <p className="text-sm text-gray-400">Đang tải đơn hàng...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <PackageX size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-semibold mb-1">{search ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}</p>
                    <p className="text-gray-400 text-sm mb-5">{search ? 'Thử từ khóa khác' : 'Hãy mua sắm và quay lại đây sau!'}</p>
                    {search
                        ? <button onClick={() => setSearch('')} className="text-sm text-indigo-600 hover:underline">Xóa tìm kiếm</button>
                        : <Link to="/products" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">
                            <ShoppingBag size={14} />Mua sắm ngay
                        </Link>
                    }
                </div>
            ) : (
                <motion.div layout className="space-y-4">
                    {paginatedOrders.map(order => (
                        <OrderCard key={order.id} order={order} defaultExpanded={paginatedOrders.length === 1} onCancelOrder={handleCancelOrder} />
                    ))}
                </motion.div>
            )}

            {/* Pagination UI */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                                page === i + 1
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <p className="text-center text-xs text-gray-400 mt-5">
                    Hiển thị {filtered.length}/{orders.length} đơn hàng
                </p>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// FAVORITES TAB
// ══════════════════════════════════════════════════════════════════════════════
function FavoriteCard({ item, onRemove, removing }: { item: FavoriteProduct; onRemove: (id: number) => void; removing: boolean }) {
    const [addingCart, setAddingCart] = useState(false);
    const [addedCart, setAddedCart]   = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setAddingCart(true);
        try {
            const { data } = await api.get(`/products/${item.productId}`);
            const firstVariant = data.variants?.find((v: any) => v.status === 'ACTIVE' && v.stockQuantity > 0);
            if (!firstVariant) { alert('Sản phẩm hiện hết hàng!'); return; }
            await api.post('/cart/add', { variantId: firstVariant.id, quantity: 1 });
            window.dispatchEvent(new Event('cartUpdated'));
            setAddedCart(true);
            setTimeout(() => setAddedCart(false), 2000);
        } catch (err: any) { alert(err.response?.data?.message || 'Không thể thêm vào giỏ'); }
        finally { setAddingCart(false); }
    };

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: removing ? 0.4 : 1, scale: removing ? 0.95 : 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }} transition={{ duration: 0.2 }}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden group flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <Link to={`/product/${item.productId}`} className="block relative">
                <div className="h-44 bg-gray-50 overflow-hidden">
                    <img src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop'}
                         alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                         onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop'; }} />
                </div>
                <button onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(item.productId); }} disabled={removing}
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                    {removing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
                <div className="absolute top-2.5 left-2.5 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                    <Heart size={13} fill="white" className="text-white" />
                </div>
            </Link>
            <div className="p-3.5 flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide mb-1">{item.brand}</span>
                <Link to={`/product/${item.productId}`}>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 hover:text-indigo-600 transition-colors">{item.productName}</h3>
                </Link>
                <div className="flex items-center gap-1 mb-2.5">
                    {[1,2,3,4,5].map(i => (
                        <Star key={i} size={11}
                              fill={i <= Math.round(item.rating ?? 0) ? '#FBBF24' : 'none'}
                              className={i <= Math.round(item.rating ?? 0) ? 'text-yellow-400' : 'text-gray-200'} />
                    ))}
                    {item.reviewCount > 0 && <span className="text-[11px] text-gray-400 ml-0.5">({item.reviewCount})</span>}
                </div>
                <div className="mt-auto">
                    <p className="text-base font-black text-indigo-700 mb-2.5">{fmtPrice(item.price || 0)}</p>
                    <button onClick={handleAddToCart} disabled={addingCart}
                            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${addedCart ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-indigo-700'}`}>
                        {addingCart ? <Loader2 size={13} className="animate-spin" />
                            : addedCart ? <><CheckCircle2 size={13} />Đã thêm!</>
                                : <><ShoppingCart size={13} />Thêm vào giỏ</>}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function FavoritesTab() {
    const [items, setItems]                 = useState<FavoriteProduct[]>([]);
    const [loading, setLoading]             = useState(true);
    const [page, setPage]                   = useState(0);
    const [totalPages, setTotalPages]       = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [removingIds, setRemovingIds]     = useState<Set<number>>(new Set());
    const [search, setSearch]               = useState('');
    const [sortBy, setSortBy]               = useState<'default' | 'price_asc' | 'price_desc' | 'rating'>('default');
    const [toast, setToast]                 = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const fetchFavorites = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const data = await favoritesApi.getFavorites(p, 12);
            setItems(data.content || []);
            setTotalPages(data.totalPages ?? 0);
            setTotalElements(data.totalElements ?? 0);
            setPage(p);
        } catch { setItems([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchFavorites(0); }, [fetchFavorites]);
    useEffect(() => {
        return onFavoriteChange((productId, wished) => {
            if (!wished) { setItems(prev => prev.filter(i => i.productId !== productId)); setTotalElements(prev => Math.max(0, prev - 1)); }
            else fetchFavorites(page);
        });
    }, [fetchFavorites, page]);

    const handleRemove = async (productId: number) => {
        setRemovingIds(prev => new Set(prev).add(productId));
        try {
            await favoritesApi.removeFavorite(productId);
            dispatchFavoriteChange(productId, false);
            setItems(prev => prev.filter(i => i.productId !== productId));
            setTotalElements(prev => Math.max(0, prev - 1));
            showToast('Đã xóa khỏi danh sách yêu thích');
        } catch { showToast('Không thể xóa, vui lòng thử lại'); }
        finally { setRemovingIds(prev => { const next = new Set(prev); next.delete(productId); return next; }); }
    };

    const filtered = items
        .filter(i => !search || i.productName.toLowerCase().includes(search.toLowerCase()) || i.brand.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'price_asc')  return (a.price ?? 0) - (b.price ?? 0);
            if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
            if (sortBy === 'rating')     return (b.rating ?? 0) - (a.rating ?? 0);
            return 0;
        });

    return (
        <div>
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl">
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-medium text-gray-800 flex items-center gap-2">
                            <Heart size={18} className="text-red-500" fill="#EF4444" />Sản phẩm yêu thích
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">{totalElements > 0 ? `${totalElements} sản phẩm đã lưu` : 'Chưa có sản phẩm nào'}</p>
                    </div>
                    <button onClick={() => fetchFavorites(page)} disabled={loading}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Cập nhật
                    </button>
                </div>
                {totalElements > 0 && (
                    <div className="flex gap-2 mt-4">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Tìm trong danh sách yêu thích..." value={search}
                                   onChange={e => setSearch(e.target.value)}
                                   className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
                        </div>
                        <div className="relative">
                            <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                                    className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 appearance-none bg-white cursor-pointer">
                                <option value="default">Mặc định</option>
                                <option value="price_asc">Giá: Thấp → Cao</option>
                                <option value="price_desc">Giá: Cao → Thấp</option>
                                <option value="rating">Đánh giá cao nhất</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <p className="text-sm text-gray-400">Đang tải danh sách yêu thích...</p>
                </div>
            ) : filtered.length === 0 && search ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Search size={36} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium mb-1">Không tìm thấy kết quả</p>
                    <button onClick={() => setSearch('')} className="mt-4 text-sm text-indigo-600 hover:underline">Xóa tìm kiếm</button>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20">
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <Heart size={40} className="text-red-300" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Sparkles size={14} className="text-indigo-500" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có sản phẩm yêu thích</h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto mb-6">Nhấn vào biểu tượng ❤️ trên bất kỳ sản phẩm nào để lưu vào đây</p>
                    <Link to="/products" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100">
                        <ShoppingCart size={16} />Khám phá sản phẩm
                    </Link>
                    <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-400">
                        {[{ icon: Heart, text: 'Nhấn tim để lưu' }, { icon: TrendingDown, text: 'Theo dõi giá' }, { icon: ShoppingCart, text: 'Thêm vào giỏ nhanh' }].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex flex-col items-center gap-1.5">
                                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"><Icon size={16} className="text-gray-400" /></div>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {!search && (
                        <div className="flex items-center gap-4 mb-5 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                            <span className="flex items-center gap-1.5"><Heart size={12} className="text-red-400" fill="#f87171" /><strong className="text-gray-700">{totalElements}</strong> sản phẩm đã lưu</span>
                            <span className="w-px h-4 bg-gray-200" />
                            <span className="flex items-center gap-1.5"><Star size={12} className="text-yellow-400" fill="#FBBF24" />TB đánh giá {items.length > 0 ? (items.reduce((s, i) => s + (i.rating ?? 0), 0) / items.length).toFixed(1) : '—'}</span>
                        </div>
                    )}
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {filtered.map(item => (
                                <FavoriteCard key={item.productId} item={item} onRemove={handleRemove} removing={removingIds.has(item.productId)} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                    {totalPages > 1 && !search && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button onClick={() => fetchFavorites(page - 1)} disabled={page === 0 || loading}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <ChevronLeft size={15} />Trước
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i} onClick={() => fetchFavorites(i)}
                                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${i === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 border border-gray-200'}`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => fetchFavorites(page + 1)} disabled={page >= totalPages - 1 || loading}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                Sau<ChevronRight size={15} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PROFILE
// ══════════════════════════════════════════════════════════════════════════════
export default function Profile() {
    const [profile, setProfile] = useState({ username: '', email: '', phone: '', address: '', avatarUrl: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading]       = useState(false);
    const [isUpdating, setIsUpdating]     = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as 'profile' | 'security' | 'orders' | 'favorites') || 'profile';
    const [activeTab, setActiveTab]       = useState<'profile' | 'security' | 'orders' | 'favorites'>(initialTab);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [alertMsg, setAlertMsg]         = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const showAlert = (text: string, type: 'success' | 'error') => {
        setAlertMsg({ text, type });
        setTimeout(() => setAlertMsg(null), 5000);
    };

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/user/profile');
            setProfile({ username: response.data.username || '', email: response.data.email || '', phone: response.data.phone || '', address: response.data.address || '', avatarUrl: response.data.avatarUrl || '' });
        } catch (error: any) {
            if (error.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
        } finally { setIsLoading(false); }
    };

    const changeTab = (tab: typeof activeTab) => { setActiveTab(tab); setSearchParams({ tab }); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault(); setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('email', profile.email);
            if (profile.username) formData.append('username', profile.username);
            if (profile.phone)    formData.append('phone', profile.phone);
            if (profile.address)  formData.append('address', profile.address);
            if (selectedFile)     formData.append('avatarFile', selectedFile);
            else if (profile.avatarUrl) formData.append('avatarUrl', profile.avatarUrl);
            const response = await api.put('/user/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProfile({ username: response.data.username || '', email: response.data.email || '', phone: response.data.phone || '', address: response.data.address || '', avatarUrl: response.data.avatarUrl || '' });
            setSelectedFile(null); setPreviewUrl(null); setIsEditingMode(false);
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...savedUser, avatarUrl: response.data.avatarUrl }));
            window.dispatchEvent(new Event('storage'));
            showAlert('Cập nhật thành công!', 'success');
        } catch (error: any) { showAlert(error.response?.data?.message || 'Cập nhật thất bại!', 'error'); }
        finally { setIsUpdating(false); }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) { showAlert('Mật khẩu mới không khớp!', 'error'); return; }
        try {
            await api.put('/user/profile/change-password', passwordData);
            showAlert('Đổi mật khẩu thành công!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) { showAlert(error.response?.data?.message || 'Đổi mật khẩu thất bại!', 'error'); }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
    );

    const NAV = [
        { key: 'profile',   label: 'Thông tin tài khoản', icon: User,        iconColor: 'text-blue-500' },
        { key: 'orders',    label: 'Đơn hàng của bạn',    icon: ShoppingBag, iconColor: 'text-teal-500' },
        { key: 'favorites', label: 'Sản phẩm yêu thích',  icon: Heart,       iconColor: 'text-red-400' },
        { key: 'security',  label: 'Đổi mật khẩu',        icon: RefreshCw,   iconColor: 'text-amber-500' },
    ] as const;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 font-sans bg-[#fbfbfb] min-h-screen text-[#333]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

                {/* Sidebar */}
                <div className="md:col-span-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                        <img src={previewUrl || profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || 'U')}&background=6366f1&color=fff`}
                             alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100" />
                        <div className="leading-tight min-w-0">
                            <p className="text-xs text-gray-400">Tài khoản của</p>
                            <p className="font-semibold text-sm text-gray-800 truncate">{profile.username || 'Người dùng'}</p>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {NAV.map(({ key, label, icon: Icon, iconColor }) => (
                            <button key={key} type="button" onClick={() => changeTab(key)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === key ? 'text-indigo-700 bg-indigo-50 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Icon size={16} className={activeTab === key ? 'text-indigo-600' : iconColor} />
                                <span>{label}</span>
                                {key === 'favorites' && activeTab !== key && <Heart size={11} fill="#f87171" className="text-red-400 ml-auto" />}
                            </button>
                        ))}
                        <div className="pt-2 mt-2 border-t border-gray-100">
                            <button type="button" onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <LogOut size={16} />Đăng xuất
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main */}
                <div className="md:col-span-3 bg-white border border-gray-100 rounded-xl p-8 shadow-sm min-h-[580px]">
                    {alertMsg && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                    className={`mb-5 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {alertMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {alertMsg.text}
                        </motion.div>
                    )}

                    {/* Tab: Profile */}
                    {activeTab === 'profile' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="border-b border-gray-100 pb-4 mb-8">
                                <h1 className="text-xl font-medium text-center text-gray-800">Hồ Sơ Của Tôi</h1>
                                <p className="text-xs text-center text-gray-500 mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-5 text-sm">
                                    {[
                                        { label: 'Email',          key: 'email',    type: 'email', placeholder: 'email@example.com' },
                                        { label: 'Tên',            key: 'username', type: 'text',  placeholder: 'Họ và tên' },
                                        { label: 'Số điện thoại', key: 'phone',    type: 'text',  placeholder: '0912 345 678' },
                                        { label: 'Địa chỉ',       key: 'address',  type: 'text',  placeholder: 'Địa chỉ của bạn' },
                                    ].map(field => (
                                        <div key={field.key} className="grid grid-cols-3 items-center gap-4">
                                            <label className="text-right text-gray-500 pr-2">{field.label}</label>
                                            <div className="col-span-2">
                                                <input type={field.type} disabled={!isEditingMode}
                                                       value={(profile as any)[field.key] || ''} placeholder={field.placeholder}
                                                       onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                                                       className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-all text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 text-sm" />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-3 gap-4 pt-4">
                                        <div />
                                        <div className="col-span-2 flex gap-3">
                                            {!isEditingMode ? (
                                                <button type="button" onClick={e => { e.preventDefault(); setIsEditingMode(true); }}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-sm">
                                                    <Edit3 size={14} />Chỉnh sửa hồ sơ
                                                </button>
                                            ) : (
                                                <>
                                                    <button type="submit" disabled={isUpdating}
                                                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-sm px-8 py-2.5 rounded-lg transition-all disabled:bg-gray-400 flex items-center gap-2">
                                                        {isUpdating && <Loader2 className="animate-spin" size={14} />}
                                                        <Save size={14} />Lưu thay đổi
                                                    </button>
                                                    <button type="button" onClick={e => { e.preventDefault(); setIsEditingMode(false); fetchProfile(); }}
                                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm px-6 py-2.5 rounded-lg transition-all">
                                                        Hủy
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-1 border-l border-gray-100 flex flex-col items-center justify-start pt-4 px-4 text-center">
                                    <div className="w-28 h-28 rounded-full border-2 border-gray-100 mb-4 overflow-hidden">
                                        <img src={previewUrl || profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || 'U')}&background=6366f1&color=fff`}
                                             alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <label className={`border border-gray-200 text-sm px-4 py-2 rounded-lg transition-all mb-3 block text-gray-700 ${isEditingMode ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50 bg-gray-50'}`}>
                                        Chọn Ảnh
                                        <input type="file" accept="image/*" disabled={!isEditingMode} onChange={handleFileChange} className="hidden" />
                                    </label>
                                    <p className="text-xs text-gray-400">Tối đa 5 MB · JPG, PNG, WEBP</p>
                                    {selectedFile && <span className="text-[11px] text-emerald-600 mt-2 block font-medium truncate max-w-full">✓ {selectedFile.name}</span>}
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Tab: Orders — NEW */}
                    {activeTab === 'orders' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <OrdersTab />
                        </motion.div>
                    )}

                    {/* Tab: Favorites */}
                    {activeTab === 'favorites' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <FavoritesTab />
                        </motion.div>
                    )}

                    {/* Tab: Security */}
                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="border-b border-gray-100 pb-4 mb-8">
                                <h1 className="text-xl font-medium text-gray-800">Thay đổi mật khẩu</h1>
                                <p className="text-xs text-gray-500 mt-1">Cập nhật mật khẩu định kỳ để nâng cao tính bảo mật.</p>
                            </div>
                            <div className="bg-yellow-50/70 border border-yellow-100 rounded-xl p-4 flex gap-3 text-sm mb-6">
                                <ShieldAlert size={20} className="flex-shrink-0 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-bold text-gray-800">Lưu ý bảo mật</p>
                                    <p className="text-xs text-gray-600 mt-0.5">Khuyên dùng mật khẩu từ 8 ký tự trở lên bao gồm chữ cái và số.</p>
                                </div>
                            </div>
                            <form onSubmit={handleChangePassword} className="max-w-xl space-y-5 text-sm">
                                {[
                                    { label: 'Mật khẩu cũ', key: 'currentPassword', placeholder: 'Nhập mật khẩu hiện tại' },
                                    { label: 'Mật khẩu mới', key: 'newPassword',     placeholder: 'Nhập mật khẩu mới' },
                                    { label: 'Xác nhận',     key: 'confirmPassword', placeholder: 'Nhập lại mật khẩu mới' },
                                ].map(f => (
                                    <div key={f.key} className="grid grid-cols-3 items-center gap-4">
                                        <label className="text-gray-500 text-right pr-2">{f.label}</label>
                                        <input type="password" placeholder={f.placeholder} required
                                               value={(passwordData as any)[f.key]}
                                               onChange={e => setPasswordData({ ...passwordData, [f.key]: e.target.value })}
                                               className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-all text-sm" />
                                    </div>
                                ))}
                                <div className="grid grid-cols-3 gap-4 pt-2">
                                    <div />
                                    <button type="submit" className="col-span-2 w-max bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-all">
                                        Cập nhật mật khẩu
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white text-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận đăng xuất</h3>
                        <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
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