import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, MapPin, Phone, User as UserIcon, CreditCard,
    Truck, CheckCircle2, Loader2, Edit2, ShieldCheck,
    Package, AlertCircle, Lock, Wallet, QrCode, ChevronRight,
    Tag, RefreshCw, List
} from 'lucide-react';
import axiosInstance from '../../api/axios';
import CouponSelectionModal from './CouponSelectionModal';

interface CartItem {
    id: number; variantId: number; productId: number;
    productName: string; color: string; storage: number;
    imageUrl?: string; price: number; originalPrice: number;
    quantity: number; stockQuantity: number; subTotal: number;
}

interface UserProfile {
    username: string; email: string; phone?: string; address?: string;
}

interface FormData {
    recipientName: string;
    phone: string;
    shippingAddress: string;
    paymentMethod: 'COD' | 'VNPAY';
    couponCode?: string;
}

const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

function StepBar({ step }: { step: 1 | 2 | 3 }) {
    const steps = [
        { label: 'Giỏ hàng' },
        { label: 'Đặt hàng' },
        { label: 'Xác nhận' },
    ];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => {
                const n = i + 1;
                const done = step > n;
                const active = step === n;
                return (
                    <div key={s.label} className="flex items-center">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                            done ? 'text-green-600' : active ? 'text-indigo-700' : 'text-gray-400'
                        }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                                done
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : active
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white border-gray-200 text-gray-400'
                            }`}>
                                {done ? '✓' : n}
                            </div>
                            <span className="hidden sm:block">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-px w-8 sm:w-14 transition-colors ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}


function PaymentCard({
                         method, selected, onSelect,
                     }: {
    method: 'COD' | 'VNPAY'; selected: boolean; onSelect: () => void;
}) {
    const info = {
        COD: {
            label: 'Thanh toán khi nhận hàng (COD)',
            desc: 'Thanh toán bằng tiền mặt khi nhận hàng',
            icon: Wallet,
            badge: null,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        VNPAY: {
            label: 'Thanh toán qua VNPay',
            desc: 'Thẻ ATM nội địa, Visa/Master, QR Code, ví điện tử',
            icon: QrCode,
            badge: 'Phổ biến',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
    }[method];

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                selected
                    ? 'border-indigo-500 bg-indigo-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selected ? info.bg : 'bg-gray-100'
            }`}>
                <info.icon size={20} className={selected ? info.color : 'text-gray-400'} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
            {info.label}
          </span>
                    {info.badge && (
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              {info.badge}
            </span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{info.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                selected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
            }`}>
                {selected && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
        </button>
    );
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Partial<FormData>>({});

    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

    const [form, setForm] = useState<FormData>({
        recipientName: '',
        phone: '',
        shippingAddress: '',
        paymentMethod: 'COD',
    });

    // Load profile + cart
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        Promise.all([
            axiosInstance.get('/user/profile').catch(() => null),
            axiosInstance.get('/cart').catch(() => null),
        ]).then(([profRes, cartRes]) => {
            if (profRes) {
                const p: UserProfile = profRes.data;
                setProfile(p);
                setForm(f => ({
                    ...f,
                    recipientName: p.username || '',
                    phone: p.phone || '',
                    shippingAddress: p.address || '',
                }));
            }
            if (cartRes) {
                let items: CartItem[] = cartRes.data.items || [];
                if (items.length === 0) { navigate('/cart'); return; }

                const storedIdsStr = sessionStorage.getItem('checkoutVariantIds');
                if (storedIdsStr) {
                    try {
                        const selectedVariantIds: number[] = JSON.parse(storedIdsStr);
                        if (selectedVariantIds.length > 0) {
                            items = items.filter(item => selectedVariantIds.includes(item.variantId));
                        }
                    } catch (e) {
                        console.error("Lỗi parse checkoutVariantIds từ sessionStorage", e);
                    }
                }
                if (items.length === 0) { navigate('/cart'); return; }
                setCartItems(items);
            } else {
                navigate('/cart');
            }
        }).finally(() => setLoadingCart(false));
    }, [navigate]);

    const setField = (k: keyof FormData, v: string) => {
        setForm(f => ({ ...f, [k]: v }));
        setFieldErrors(e => ({ ...e, [k]: '' }));
        if (error) setError('');
    };

    const validate = (): boolean => {
        const errs: Partial<FormData> = {};
        if (!form.recipientName.trim()) errs.recipientName = 'Vui lòng nhập tên người nhận';
        if (!form.phone.trim()) {
            errs.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{9,12}$/.test(form.phone.replace(/[\s\-]/g, ''))) {
            errs.phone = 'Số điện thoại không hợp lệ (9–12 số)';
        }
        if (!form.shippingAddress.trim()) errs.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setError('');
        setSubmitting(true);

        const payload = {
            recipientName: form.recipientName.trim(),
            phone: form.phone.trim(),
            shippingAddress: form.shippingAddress.trim(),
            paymentMethod: form.paymentMethod,
            variantIds: cartItems.map(item => item.variantId),
            couponCode: form.couponCode,
        };

        try {
            if (form.paymentMethod === 'COD') {
                // COD → đặt hàng trực tiếp
                const { data } = await axiosInstance.post('/orders/checkout', payload);
                window.dispatchEvent(new Event('cartUpdated'));
                sessionStorage.removeItem('checkoutVariantIds');
                navigate('/payment/result', {
                    state: { status: 'SUCCESS', orderId: data.id, method: 'COD', order: data },
                });

            } else {
                // VNPay → tạo đơn hàng + lấy paymentUrl, redirect sang VNPay
                const { data } = await axiosInstance.post('/orders/checkout/vnpay', payload);
                window.dispatchEvent(new Event('cartUpdated'));

                if (data.paymentUrl) {
                    // Lưu để trang result có thể kiểm tra
                    sessionStorage.setItem('pendingOrderId', String(data.order?.id || ''));
                    sessionStorage.removeItem('checkoutVariantIds');
                    // Hard redirect sang cổng VNPay
                    window.location.href = data.paymentUrl;
                } else {
                    throw new Error(data.message || 'Không tạo được link thanh toán VNPay');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Đặt hàng thất bại, vui lòng thử lại');
            setSubmitting(false);
        }
    };

    const totalAmount = cartItems.reduce((s, i) => s + i.subTotal, 0);
    const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

    // Loading skeleton
    if (loadingCart) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* Page header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/cart"
                          className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Đặt hàng</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Kiểm tra thông tin trước khi thanh toán</p>
                    </div>
                </div>

                <StepBar step={2} />

                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* ── Left column: forms ── */}
                        <div className="lg:col-span-3 space-y-5">

                            {/* Shipping info */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                                <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                                    <MapPin size={18} className="text-indigo-500" />
                                    Thông tin giao hàng
                                </h2>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Họ và tên người nhận <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={form.recipientName}
                                                onChange={e => setField('recipientName', e.target.value)}
                                                placeholder="Nguyễn Văn A"
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                                                    fieldErrors.recipientName
                                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                                                        : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                                                }`}
                                            />
                                        </div>
                                        {fieldErrors.recipientName && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle size={11} /> {fieldErrors.recipientName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={e => setField('phone', e.target.value)}
                                                placeholder="0912 345 678"
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                                                    fieldErrors.phone
                                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                                                        : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                                                }`}
                                            />
                                        </div>
                                        {fieldErrors.phone && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle size={11} /> {fieldErrors.phone}
                                            </p>
                                        )}
                                        {profile?.phone && form.phone !== profile.phone && (
                                            <button type="button" onClick={() => setField('phone', profile.phone!)}
                                                    className="mt-1 text-xs text-indigo-500 hover:underline flex items-center gap-1">
                                                <Edit2 size={10} /> Dùng số đã lưu: {profile.phone}
                                            </button>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Địa chỉ giao hàng <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                                            <textarea
                                                value={form.shippingAddress}
                                                onChange={e => setField('shippingAddress', e.target.value)}
                                                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                                rows={3}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                                                    fieldErrors.shippingAddress
                                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-50'
                                                        : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                                                }`}
                                            />
                                        </div>
                                        {fieldErrors.shippingAddress && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle size={11} /> {fieldErrors.shippingAddress}
                                            </p>
                                        )}
                                        {profile?.address && form.shippingAddress !== profile.address && (
                                            <button type="button" onClick={() => setField('shippingAddress', profile.address!)}
                                                    className="mt-1 text-xs text-indigo-500 hover:underline flex items-center gap-1">
                                                <Edit2 size={10} /> Dùng địa chỉ đã lưu: {profile.address.slice(0, 50)}{profile.address.length > 50 ? '...' : ''}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping method (static, always free) */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                                <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <Truck size={18} className="text-indigo-500" />
                                    Phương thức vận chuyển
                                </h2>
                                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Truck size={18} className="text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">Giao hàng tiêu chuẩn</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Dự kiến 2–5 ngày làm việc</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-green-600 text-sm">Miễn phí</p>
                                        <p className="text-xs text-gray-400">Toàn quốc</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment method */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                                <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                                    <CreditCard size={18} className="text-indigo-500" />
                                    Phương thức thanh toán
                                </h2>

                                <div className="space-y-3">
                                    <PaymentCard method="COD" selected={form.paymentMethod === 'COD'}
                                                 onSelect={() => setField('paymentMethod', 'COD')} />
                                    <PaymentCard method="VNPAY" selected={form.paymentMethod === 'VNPAY'}
                                                 onSelect={() => setField('paymentMethod', 'VNPAY')} />
                                </div>

                                {/* VNPay info panel */}
                                <AnimatePresence>
                                    {form.paymentMethod === 'VNPAY' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                                <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5">
                                                    <Lock size={11} /> Thanh toán bảo mật 256-bit SSL qua VNPay
                                                </p>
                                                <p className="text-xs text-blue-600 leading-relaxed mb-3">
                                                    Bạn sẽ được chuyển đến cổng thanh toán VNPay sau khi đặt hàng.
                                                    Hỗ trợ thẻ ATM nội địa, Visa, MasterCard, JCB và ví điện tử.
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {['Vietcombank', 'Techcombank', 'BIDV', 'Agribank', 'MB Bank', 'VietinBank', 'SHB', 'VPBank'].map(b => (
                                                        <span key={b}
                                                              className="text-[10px] bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded-lg font-semibold">
                              {b}
                            </span>
                                                    ))}
                                                    <span className="text-[10px] text-blue-400 self-center">+ 40 ngân hàng</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Global error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm"
                                    >
                                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">Đặt hàng thất bại</p>
                                            <p className="text-xs mt-0.5 text-red-600">{error}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Right column: order summary ── */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 sticky top-24">
                                <h2 className="font-black text-gray-900 mb-1 flex items-center gap-2">
                                    <Package size={18} className="text-indigo-500" />
                                    Đơn hàng của bạn
                                </h2>
                                <p className="text-xs text-gray-400 mb-5">{totalQty} sản phẩm</p>

                                {/* Item list */}
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-5"
                                     style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
                                    {cartItems.map(item => (
                                        <div key={item.variantId} className="flex items-center gap-3">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                                    <img
                                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop'}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover"
                                                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop'; }}
                                                    />
                                                </div>
                                                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                          {item.quantity}
                        </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 line-clamp-1 leading-snug">{item.productName}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{item.color} · {item.storage}GB</p>
                                            </div>
                                            <span className="text-xs font-bold text-gray-800 flex-shrink-0 ml-2">{fmtPrice(item.subTotal)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t border-dashed border-gray-200 pt-4 space-y-2.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Tạm tính ({totalQty} SP)</span>
                                        <span className="font-semibold text-gray-800">{fmtPrice(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Truck size={13} className="text-gray-400" /> Vận chuyển
                    </span>
                                        <span className="font-semibold text-green-600">Miễn phí</span>
                                    </div>
                                    
                                    {/* Coupon Input */}
                                    <div className="pt-2 pb-2">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={couponInput}
                                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                    placeholder="Mã giảm giá"
                                                    disabled={!!form.couponCode}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 font-mono uppercase disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            {form.couponCode ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setForm(f => ({ ...f, couponCode: undefined }));
                                                        setDiscountAmount(0);
                                                        setCouponInput('');
                                                        setCouponSuccess('');
                                                        setCouponError('');
                                                    }}
                                                    className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                                >
                                                    Hủy
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!couponInput.trim()) return;
                                                        setCouponError('');
                                                        setCouponSuccess('');
                                                        try {
                                                            const res = await axiosInstance.get('/coupons/validate', {
                                                                params: { code: couponInput, total: totalAmount }
                                                            });
                                                            const coupon = res.data;
                                                            let discount = 0;
                                                            if (coupon.discountType === 'FIXED') {
                                                                discount = coupon.discountValue;
                                                            } else {
                                                                discount = totalAmount * (coupon.discountValue / 100.0);
                                                            }
                                                            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                                                                discount = coupon.maxDiscountAmount;
                                                            }
                                                            setDiscountAmount(discount);
                                                            setForm(f => ({ ...f, couponCode: coupon.code }));
                                                            setCouponSuccess(`Áp dụng thành công mã ${coupon.code}`);
                                                        } catch (err: any) {
                                                            setCouponError(err.response?.data?.message || err.response?.data || 'Mã không hợp lệ');
                                                        }
                                                    }}
                                                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
                                                    disabled={!couponInput.trim()}
                                                >
                                                    Áp dụng
                                                </button>
                                            )}
                                            {!form.couponCode && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCouponModalOpen(true)}
                                                    className="px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
                                                >
                                                    <List size={16} />
                                                    Chọn mã
                                                </button>
                                            )}
                                        </div>
                                        {couponError && <p className="text-xs text-red-500 mt-1.5 ml-1">{couponError}</p>}
                                        {couponSuccess && <p className="text-xs text-green-600 mt-1.5 ml-1">{couponSuccess}</p>}
                                    </div>

                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 flex items-center gap-1.5 font-medium">
                                                <Tag size={13} /> Mã giảm giá ({form.couponCode})
                                            </span>
                                            <span className="font-bold text-green-600">-{fmtPrice(discountAmount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                        <span className="font-black text-gray-900">Tổng thanh toán</span>
                                        <span className="text-2xl font-black text-indigo-700">{fmtPrice(Math.max(0, totalAmount - discountAmount))}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 text-right">Đã bao gồm VAT (nếu có)</p>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full mt-5 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all ${
                                        submitting
                                            ? 'bg-indigo-400 cursor-not-allowed text-white'
                                            : form.paymentMethod === 'VNPAY'
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                                                : 'bg-indigo-700 text-white hover:bg-indigo-800 shadow-lg shadow-indigo-100'
                                    }`}
                                >
                                    {submitting ? (
                                        <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                                    ) : form.paymentMethod === 'VNPAY' ? (
                                        <><QrCode size={18} /> Thanh toán qua VNPay <ChevronRight size={16} /></>
                                    ) : (
                                        <><CheckCircle2 size={18} /> Đặt hàng ngay <ChevronRight size={16} /></>
                                    )}
                                </button>

                                {form.paymentMethod === 'VNPAY' && !submitting && (
                                    <p className="text-xs text-center text-gray-400 mt-2.5 flex items-center justify-center gap-1">
                                        <Lock size={10} /> Chuyển hướng đến VNPay để thanh toán
                                    </p>
                                )}

                                {/* Trust row */}
                                <div className="flex items-center justify-around mt-5 pt-5 border-t border-gray-100">
                                    {[
                                        { icon: ShieldCheck, text: 'Bảo mật SSL' },
                                        { icon: Truck, text: 'Giao nhanh' },
                                        { icon: RefreshCw, text: 'Đổi trả 7 ngày' },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex flex-col items-center gap-1.5 text-gray-400">
                                            <Icon size={16} className="text-indigo-400" />
                                            <span className="text-[10px] font-medium">{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <CouponSelectionModal 
                isOpen={isCouponModalOpen}
                onClose={() => setIsCouponModalOpen(false)}
                cartTotal={totalAmount}
                onApply={(coupon) => {
                    setCouponInput(coupon.code);
                    let discount = 0;
                    if (coupon.discountType === 'FIXED') {
                        discount = coupon.discountValue;
                    } else {
                        discount = totalAmount * (coupon.discountValue / 100.0);
                    }
                    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                        discount = coupon.maxDiscountAmount;
                    }
                    setDiscountAmount(discount);
                    setForm(f => ({ ...f, couponCode: coupon.code }));
                    setCouponSuccess(`Áp dụng thành công mã ${coupon.code}`);
                    setCouponError('');
                    setIsCouponModalOpen(false);
                }}
            />
        </div>
    );
}