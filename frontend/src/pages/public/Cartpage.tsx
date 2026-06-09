import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Trash2, Plus, Minus, ArrowLeft,
    ShieldCheck, Truck, RefreshCw, Tag, Loader2,
    ChevronRight, PackageOpen, AlertCircle, CheckCircle2
} from 'lucide-react';
import axiosInstance from '../../api/axios';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CartItem {
    id: number;
    variantId: number;
    productId: number;
    productName: string;
    color: string;
    storage: number;
    imageUrl?: string;
    price: number;
    originalPrice: number;
    quantity: number;
    stockQuantity: number;
    subTotal: number;
}

interface CartData {
    items: CartItem[];
    totalAmount: number;
    totalQuantity: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

// ── CartItem Row ──────────────────────────────────────────────────────────────
function CartItemRow({
                         item,
                         selected,
                         onToggle,
                         onQtyChange,
                         onRemove,
                         updating,
                     }: {
    item: CartItem;
    selected: boolean;
    onToggle: () => void;
    onQtyChange: (qty: number) => void;
    onRemove: () => void;
    updating: boolean;
}) {
    const discount = item.originalPrice > item.price
        ? Math.round((1 - item.price / item.originalPrice) * 100)
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                selected ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100 bg-white'
            }`}
        >
            {/* Checkbox */}
            <button
                onClick={onToggle}
                className="flex-shrink-0 mt-1"
                aria-label="Chọn sản phẩm"
            >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 hover:border-indigo-400'
                }`}>
                    {selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </button>

            {/* Product image */}
            <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop'; }}
                    />
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <Link
                            to={`/product/${item.productId}`}
                            className="font-semibold text-gray-900 text-sm hover:text-indigo-600 transition-colors line-clamp-2 leading-snug"
                        >
                            {item.productName}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">
                            {item.color} · {item.storage}GB
                        </p>
                    </div>
                    <button
                        onClick={onRemove}
                        className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        aria-label="Xoá"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 flex-wrap gap-2">
                    {/* Price */}
                    <div>
                        <span className="font-bold text-indigo-700 text-base">{fmtPrice(item.price)}</span>
                        {discount > 0 && (
                            <span className="text-xs text-gray-400 line-through ml-1.5">{fmtPrice(item.originalPrice)}</span>
                        )}
                        {discount > 0 && (
                            <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-md">-{discount}%</span>
                        )}
                    </div>

                    {/* Quantity stepper */}
                    <div className={`flex items-center border rounded-xl overflow-hidden transition-opacity ${updating ? 'opacity-50' : ''}`}>
                        <button
                            onClick={() => onQtyChange(item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 text-lg"
                        >
                            <Minus size={13} />
                        </button>
                        <span className="w-9 text-center font-bold text-sm text-gray-900 border-x border-gray-100">
              {updating ? <Loader2 size={12} className="animate-spin mx-auto" /> : item.quantity}
            </span>
                        <button
                            onClick={() => onQtyChange(item.quantity + 1)}
                            disabled={item.quantity >= item.stockQuantity || updating}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
                        >
                            <Plus size={13} />
                        </button>
                    </div>
                </div>

                {/* Stock warning */}
                {item.stockQuantity <= 5 && item.stockQuantity > 0 && (
                    <p className="text-xs text-orange-500 flex items-center gap-1 mt-1.5">
                        <AlertCircle size={11} /> Chỉ còn {item.stockQuantity} sản phẩm
                    </p>
                )}

                {/* Subtotal on mobile */}
                <p className="text-xs text-gray-400 mt-1">
                    Thành tiền: <span className="font-bold text-gray-700">{fmtPrice(item.subTotal)}</span>
                </p>
            </div>
        </motion.div>
    );
}

// ── Main CartPage ─────────────────────────────────────────────────────────────
export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [clearingCart, setClearingCart] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCart = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/cart');
            setCart(data);
            // Auto select all on first load
            const items = data?.items || [];
            setSelectedIds(new Set(items.map((i: CartItem) => i.variantId)));
        } catch (e: any) {
            if (e.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        fetchCart();
    }, [fetchCart, navigate]);

    // Select / deselect
    const toggleItem = (variantId: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(variantId)) next.delete(variantId);
            else next.add(variantId);
            return next;
        });
    };

    const toggleAll = () => {
        if (!cart) return;
        if (selectedIds.size === cart.items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(cart.items.map(i => i.variantId)));
        }
    };

    // Update quantity
    const handleQtyChange = async (variantId: number, newQty: number) => {
        if (newQty < 1) { handleRemove(variantId); return; }
        setUpdatingId(variantId);
        try {
            const { data } = await axiosInstance.put('/cart/update', { variantId, quantity: newQty });
            setCart(data);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    // Remove item
    const handleRemove = async (variantId: number) => {
        setRemovingId(variantId);
        try {
            const { data } = await axiosInstance.delete(`/cart/remove/${variantId}`);
            setCart(data);
            setSelectedIds(prev => { const next = new Set(prev); next.delete(variantId); return next; });
            window.dispatchEvent(new Event('cartUpdated'));
            showToast('success', 'Đã xoá sản phẩm khỏi giỏ hàng');
        } catch {
            showToast('error', 'Không thể xoá sản phẩm');
        } finally {
            setRemovingId(null);
        }
    };

    // Remove selected
    const handleRemoveSelected = async () => {
        if (!selectedIds.size) return;
        for (const vid of Array.from(selectedIds)) {
            try {
                await axiosInstance.delete(`/cart/remove/${vid}`);
            } catch { /* continue */ }
        }
        await fetchCart();
        window.dispatchEvent(new Event('cartUpdated'));
        showToast('success', `Đã xoá ${selectedIds.size} sản phẩm`);
    };

    // Clear cart
    const handleClearCart = async () => {
        if (!window.confirm('Xoá tất cả sản phẩm trong giỏ hàng?')) return;
        setClearingCart(true);
        try {
            await axiosInstance.delete('/cart/clear');
            setCart({ items: [], totalAmount: 0, totalQuantity: 0 });
            setSelectedIds(new Set());
            window.dispatchEvent(new Event('cartUpdated'));
            showToast('success', 'Đã dọn sạch giỏ hàng');
        } catch {
            showToast('error', 'Không thể xoá giỏ hàng');
        } finally {
            setClearingCart(false);
        }
    };

    // Computed
    const selectedItems = cart?.items.filter(i => selectedIds.has(i.variantId)) ?? [];
    const selectedTotal = selectedItems.reduce((s, i) => s + i.subTotal, 0);
    const selectedQty = selectedItems.reduce((s, i) => s + i.quantity, 0);
    const allSelected = !!(cart?.items.length && selectedIds.size === cart.items.length);
    const someSelected = selectedIds.size > 0;

    // Checkout
    const handleCheckout = () => {
        if (!someSelected) { showToast('error', 'Vui lòng chọn ít nhất một sản phẩm'); return; }
        // Lưu danh sách variant được chọn vào sessionStorage để trang Checkout biết
        sessionStorage.setItem('checkoutVariantIds', JSON.stringify(Array.from(selectedIds)));
        navigate('/checkout');
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold ${
                            toast.type === 'success'
                                ? 'bg-green-600 text-white'
                                : 'bg-red-500 text-white'
                        }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate(-1)}
                            className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <ShoppingCart size={22} className="text-indigo-600" />
                            Giỏ hàng của bạn
                        </h1>
                        {cart && cart.items.length > 0 && (
                            <p className="text-sm text-gray-400 mt-0.5">{cart.items.length} sản phẩm</p>
                        )}
                    </div>
                </div>

                {/* Empty state */}
                {!cart || cart.items.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 py-24 text-center">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <PackageOpen size={40} className="text-indigo-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-400 text-sm mb-8">Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm</p>
                        <Link to="/products"
                              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                            <ShoppingCart size={18} /> Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ── Left: Item list ── */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Select all toolbar */}
                            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <button onClick={toggleAll} className="flex-shrink-0">
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                            allSelected ? 'bg-indigo-600 border-indigo-600' : someSelected ? 'bg-indigo-200 border-indigo-400' : 'border-gray-300 hover:border-indigo-400'
                                        }`}>
                                            {allSelected && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                            {!allSelected && someSelected && (
                                                <div className="w-2.5 h-0.5 bg-indigo-600 rounded-full" />
                                            )}
                                        </div>
                                    </button>
                                    <span className="text-sm font-semibold text-gray-700">
                    {allSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${cart.items.length})`}
                  </span>
                                </label>

                                <div className="flex items-center gap-2">
                                    {someSelected && (
                                        <button
                                            onClick={handleRemoveSelected}
                                            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 size={12} /> Xoá đã chọn ({selectedIds.size})
                                        </button>
                                    )}
                                    <button
                                        onClick={handleClearCart}
                                        disabled={clearingCart}
                                        className="text-xs text-gray-400 hover:text-gray-600 font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                                    >
                                        {clearingCart ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                        Xoá tất cả
                                    </button>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {cart.items.map(item => (
                                        <CartItemRow
                                            key={item.variantId}
                                            item={item}
                                            selected={selectedIds.has(item.variantId)}
                                            onToggle={() => toggleItem(item.variantId)}
                                            onQtyChange={qty => handleQtyChange(item.variantId, qty)}
                                            onRemove={() => handleRemove(item.variantId)}
                                            updating={updatingId === item.variantId || removingId === item.variantId}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Continue shopping */}
                            <Link to="/products"
                                  className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline pt-2">
                                <ArrowLeft size={15} /> Tiếp tục mua sắm
                            </Link>
                        </div>

                        {/* ── Right: Summary ── */}
                        <div className="space-y-4">
                            {/* Order summary */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 sticky top-24">
                                <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                                    <Tag size={17} className="text-indigo-500" />
                                    Tóm tắt đơn hàng
                                </h2>

                                {/* Selected items summary */}
                                {selectedItems.length > 0 ? (
                                    <div className="space-y-3 mb-4">
                                        {selectedItems.map(item => (
                                            <div key={item.variantId} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                    <img
                                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop'}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop'; }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.productName}</p>
                                                    <p className="text-xs text-gray-400">{item.color} · {item.storage}GB · x{item.quantity}</p>
                                                </div>
                                                <span className="text-xs font-bold text-gray-800 flex-shrink-0">{fmtPrice(item.subTotal)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-300 text-sm">
                                        Chưa chọn sản phẩm nào
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-4 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Tạm tính ({selectedQty} sản phẩm)</span>
                                        <span className="font-semibold text-gray-800">{fmtPrice(selectedTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-green-600 font-semibold">Miễn phí</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Giảm giá</span>
                                        <span className="font-semibold text-gray-800">—</span>
                                    </div>

                                    <div className="border-t border-dashed border-gray-200 pt-3">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-gray-900">Tổng cộng</span>
                                            <span className="text-2xl font-black text-indigo-700">{fmtPrice(selectedTotal)}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5 text-right">Đã bao gồm thuế VAT</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={!someSelected}
                                    className={`w-full mt-5 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                                        someSelected
                                            ? 'bg-indigo-700 text-white hover:bg-indigo-800 shadow-lg shadow-indigo-100'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Tiến hành thanh toán
                                    <ChevronRight size={18} />
                                </button>

                                {!someSelected && (
                                    <p className="text-xs text-center text-gray-400 mt-2">Chọn ít nhất 1 sản phẩm để thanh toán</p>
                                )}

                                {/* Trust badges */}
                                <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-gray-100">
                                    {[
                                        { icon: Truck, text: 'Giao hàng miễn phí' },
                                        { icon: ShieldCheck, text: 'Bảo hành 12 tháng' },
                                        { icon: RefreshCw, text: 'Đổi trả 7 ngày' },
                                        { icon: Tag, text: 'Giá tốt nhất' },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Icon size={13} className="text-indigo-400 flex-shrink-0" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Suggested: continue exploring */}
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-5 text-white">
                                <p className="font-bold text-sm mb-1">Khám phá thêm sản phẩm</p>
                                <p className="text-xs text-white/70 mb-3">Hàng nghìn siêu phẩm đang chờ bạn</p>
                                <Link to="/products"
                                      className="inline-flex items-center gap-1.5 bg-white text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all">
                                    Xem ngay <ChevronRight size={13} />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}