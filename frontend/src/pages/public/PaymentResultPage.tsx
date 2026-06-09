import { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle2, XCircle, Clock, Loader2, Package,
    ShoppingCart, Home, RefreshCw, Phone, ChevronRight,
    Receipt, Truck, ShieldCheck, Calendar, Hash, CreditCard
} from 'lucide-react';
import axiosInstance from '../../api/axios';

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderItem {
    id: number; variantId: number; productId: number;
    productName: string; color: string; storage: number;
    imageUrl?: string; quantity: number; price: number;
}

interface OrderData {
    id: number;
    recipientName: string;
    phone: string;
    shippingAddress: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

interface PaymentStatus {
    status: string;
    txnRef?: string;
    amount?: number;
    responseCode?: string;
    transactionNo?: string;
    bankCode?: string;
    payDate?: string;
}

const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const STATUS_MAP: Record<string, {
    icon: any; color: string; bg: string; border: string;
    title: string; subtitle: string;
}> = {
    SUCCESS: {
        icon: CheckCircle2,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        title: 'Đặt hàng thành công! 🎉',
        subtitle: 'Cảm ơn bạn đã mua hàng. Đơn hàng đang được xử lý.',
    },
    FAILED: {
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'Thanh toán thất bại',
        subtitle: 'Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.',
    },
    PENDING: {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        title: 'Đang chờ thanh toán',
        subtitle: 'Đơn hàng đã tạo, chờ xác nhận thanh toán từ VNPay.',
    },
    INVALID_SIGNATURE: {
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'Chữ ký không hợp lệ',
        subtitle: 'Phản hồi từ VNPay không hợp lệ. Vui lòng liên hệ hỗ trợ.',
    },
};

// ── Timeline step ──────────────────────────────────────────────────────────────
function TimelineStep({
                          icon: Icon, label, active, done,
                      }: {
    icon: any; label: string; active?: boolean; done?: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                    ? 'bg-green-500 border-green-500 text-white'
                    : active
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-200 text-gray-300'
            }`}>
                <Icon size={16} />
            </div>
            <span className={`text-[10px] font-semibold text-center ${
                done ? 'text-green-600' : active ? 'text-indigo-600' : 'text-gray-400'
            }`}>{label}</span>
        </div>
    );
}

function TimelineLine({ done }: { done?: boolean }) {
    return (
        <div className={`flex-1 h-0.5 mb-5 transition-all ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
    );
}

// ── Main PaymentResultPage ─────────────────────────────────────────────────────
export default function PaymentResultPage() {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Từ COD: truyền qua location.state
    const stateData = location.state as {
        status?: string; orderId?: number; method?: string; order?: OrderData;
    } | null;

    // Từ VNPay redirect: query params
    const queryStatus = searchParams.get('status');      // SUCCESS | FAILED | INVALID_SIGNATURE
    const queryOrderId = searchParams.get('orderId');
    const queryCode = searchParams.get('code');           // VNPay response code

    // Determine final values
    const finalStatus = stateData?.status || queryStatus || 'FAILED';
    const finalOrderId = stateData?.orderId || (queryOrderId ? Number(queryOrderId) : null);
    const isCOD = stateData?.method === 'COD';

    const [orderData, setOrderData] = useState<OrderData | null>(stateData?.order || null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(!stateData?.order && !!finalOrderId);
    const [retrying, setRetrying] = useState(false);
    const [retryUrl, setRetryUrl] = useState<string | null>(null);

    // Load order + payment status if not from state
    useEffect(() => {
        if (!finalOrderId) { setLoadingOrder(false); return; }

        const promises: Promise<any>[] = [];

        if (!stateData?.order) {
            promises.push(
                axiosInstance.get(`/orders/${finalOrderId}`)
                    .then(r => setOrderData(r.data))
                    .catch(() => {})
            );
        }

        if (!isCOD) {
            promises.push(
                axiosInstance.get(`/payment/status/${finalOrderId}`)
                    .then(r => setPaymentStatus(r.data))
                    .catch(() => {})
            );
        }

        Promise.all(promises).finally(() => setLoadingOrder(false));
    }, [finalOrderId]);

    // Retry VNPay payment
    const handleRetryPayment = async () => {
        if (!finalOrderId) return;
        setRetrying(true);
        try {
            const { data } = await axiosInstance.post('/payment/vnpay/create', {
                orderId: finalOrderId,
                orderInfo: `Thanh toan lai don hang ${finalOrderId}`,
            });
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể tạo link thanh toán');
        } finally {
            setRetrying(false);
        }
    };

    const statusInfo = STATUS_MAP[finalStatus] || STATUS_MAP.FAILED;
    const StatusIcon = statusInfo.icon;
    const isSuccess = finalStatus === 'SUCCESS';

    // Order status timeline
    const statusTimeline: Array<{ icon: any; label: string }> = [
        { icon: ShoppingCart, label: 'Đặt hàng' },
        { icon: CreditCard, label: 'Thanh toán' },
        { icon: Package, label: 'Xử lý' },
        { icon: Truck, label: 'Vận chuyển' },
        { icon: CheckCircle2, label: 'Hoàn thành' },
    ];

    const getTimelineDone = (idx: number) => {
        if (!isSuccess) return false;
        const orderStatus = orderData?.status;
        const doneMap: Record<string, number> = {
            PENDING: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 4,
        };
        return idx <= (doneMap[orderStatus || 'PENDING'] || 1);
    };

    if (loadingOrder) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">

                {/* ── Status card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                    className={`bg-white rounded-3xl border-2 ${statusInfo.border} p-8 text-center mb-6`}
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                        className={`w-20 h-20 ${statusInfo.bg} rounded-full flex items-center justify-center mx-auto mb-5`}
                    >
                        <StatusIcon size={36} className={statusInfo.color} />
                    </motion.div>

                    <h1 className="text-2xl font-black text-gray-900 mb-2">{statusInfo.title}</h1>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">{statusInfo.subtitle}</p>

                    {finalOrderId && (
                        <div className="inline-flex items-center gap-2 mt-4 bg-gray-100 rounded-xl px-4 py-2">
                            <Hash size={14} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">Mã đơn hàng: #{finalOrderId}</span>
                        </div>
                    )}

                    {/* VNPay response code */}
                    {queryCode && queryCode !== '00' && (
                        <p className="text-xs text-gray-400 mt-2">
                            Mã phản hồi VNPay: <span className="font-mono font-bold text-red-500">{queryCode}</span>
                        </p>
                    )}
                </motion.div>

                {/* ── Order timeline (only on success) ── */}
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white rounded-3xl border border-gray-100 p-6 mb-6"
                    >
                        <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-sm">
                            <Truck size={16} className="text-indigo-500" /> Trạng thái đơn hàng
                        </h2>
                        <div className="flex items-start gap-0">
                            {statusTimeline.map((step, i) => (
                                <div key={step.label} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <TimelineStep
                                            icon={step.icon}
                                            label={step.label}
                                            done={getTimelineDone(i)}
                                            active={!getTimelineDone(i) && getTimelineDone(i - 1)}
                                        />
                                    </div>
                                    {i < statusTimeline.length - 1 && (
                                        <TimelineLine done={getTimelineDone(i)} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Order details ── */}
                {orderData && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl border border-gray-100 p-6 mb-6"
                    >
                        <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                            <Receipt size={18} className="text-indigo-500" />
                            Chi tiết đơn hàng
                        </h2>

                        {/* Info grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {[
                                {
                                    icon: Package, label: 'Người nhận',
                                    value: orderData.recipientName,
                                },
                                {
                                    icon: Phone, label: 'Điện thoại',
                                    value: orderData.phone,
                                },
                                {
                                    icon: Truck, label: 'Địa chỉ giao hàng',
                                    value: orderData.shippingAddress,
                                },
                                {
                                    icon: CreditCard, label: 'Phương thức TT',
                                    value: orderData.paymentMethod === 'VNPAY' ? '🏦 VNPay' : '💵 COD - Tiền mặt',
                                },
                                {
                                    icon: Calendar, label: 'Ngày đặt',
                                    value: orderData.createdAt
                                        ? new Date(orderData.createdAt).toLocaleString('vi-VN')
                                        : '—',
                                },
                                {
                                    icon: ShieldCheck, label: 'Trạng thái',
                                    value: {
                                        PENDING: '⏳ Chờ xử lý',
                                        PROCESSING: '⚙️ Đang xử lý',
                                        SHIPPED: '🚚 Đang giao',
                                        DELIVERED: '✅ Đã giao',
                                        CANCELLED: '❌ Đã hủy',
                                    }[orderData.status] || orderData.status,
                                },
                            ].map(row => (
                                <div key={row.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <row.icon size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-400 font-medium">{row.label}</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5 leading-snug">{row.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* VNPay payment info */}
                        {paymentStatus && paymentStatus.status === 'SUCCESS' && (
                            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-5">
                                <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
                                    <ShieldCheck size={12} /> Thông tin giao dịch VNPay
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {paymentStatus.transactionNo && (
                                        <div><span className="text-blue-400">Mã GD:</span> <span className="font-mono font-semibold text-blue-700">{paymentStatus.transactionNo}</span></div>
                                    )}
                                    {paymentStatus.bankCode && (
                                        <div><span className="text-blue-400">Ngân hàng:</span> <span className="font-semibold text-blue-700">{paymentStatus.bankCode}</span></div>
                                    )}
                                    {paymentStatus.payDate && (
                                        <div className="col-span-2">
                                            <span className="text-blue-400">Thời gian TT:</span>{' '}
                                            <span className="font-semibold text-blue-700">
                        {paymentStatus.payDate.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$3/$2/$1 $4:$5:$6')}
                      </span>
                                        </div>
                                    )}
                                    {paymentStatus.amount && (
                                        <div><span className="text-blue-400">Số tiền:</span> <span className="font-bold text-blue-700">{fmtPrice(paymentStatus.amount)}</span></div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Items */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sản phẩm đã đặt</p>
                            <div className="space-y-3">
                                {orderData.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100">
                                                <img
                                                    src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop'}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover"
                                                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop'; }}
                                                />
                                            </div>
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                        {item.quantity}
                      </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/product/${item.productId}`}
                                                  className="text-xs font-semibold text-gray-800 hover:text-indigo-600 line-clamp-1 transition-colors">
                                                {item.productName}
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-0.5">{item.color} · {item.storage}GB</p>
                                        </div>
                                        <span className="text-xs font-bold text-gray-800 flex-shrink-0">
                      {fmtPrice(item.price * item.quantity)}
                    </span>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                <span className="font-black text-gray-900">Tổng thanh toán</span>
                                <span className="text-xl font-black text-indigo-700">{fmtPrice(orderData.totalAmount)}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Actions ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                >
                    {/* Retry VNPay (only if failed and not COD) */}
                    {!isSuccess && !isCOD && finalOrderId && (
                        <button
                            onClick={handleRetryPayment}
                            disabled={retrying}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60"
                        >
                            {retrying
                                ? <><Loader2 size={18} className="animate-spin" /> Đang tạo link...</>
                                : <><RefreshCw size={18} /> Thử lại thanh toán VNPay</>
                            }
                        </button>
                    )}

                    {/* View orders */}
                    <Link to="/profile?tab=orders"
                          className="w-full py-4 bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-100">
                        <Package size={18} /> Xem đơn hàng của tôi <ChevronRight size={16} />
                    </Link>

                    {/* Continue shopping */}
                    <Link to="/products"
                          className="w-full py-3.5 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:bg-gray-50 hover:border-gray-300 transition-all">
                        <ShoppingCart size={18} /> Tiếp tục mua sắm
                    </Link>

                    {/* Home */}
                    <Link to="/"
                          className="w-full py-3.5 text-gray-400 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:text-gray-600 transition-colors">
                        <Home size={16} /> Về trang chủ
                    </Link>
                </motion.div>

                {/* ── Support note ── */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        Cần hỗ trợ? Liên hệ{' '}
                        <a href="tel:1900xxxx" className="text-indigo-600 font-semibold hover:underline">1900 xxxx</a>
                        {' '}hoặc{' '}
                        <a href="mailto:support@mobishop.vn" className="text-indigo-600 font-semibold hover:underline">
                            support@mobishop.vn
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}