import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Loader2, Receipt, MapPin, CreditCard, ChevronLeft, Calendar,
    Package, ShieldCheck, XCircle, Tag
} from 'lucide-react';
import axiosInstance from '../../api/axios';

interface OrderItem {
    id: number; variantId: number; productId: number; productName: string;
    color: string; storage: number; imageUrl?: string; quantity: number; price: number;
}

interface OrderData {
    id: number; recipientName: string; phone: string; shippingAddress: string;
    totalAmount: number; discountAmount?: number; couponCode?: string; paymentMethod: string;
    shippingFee?: number;
    status: string; createdAt: string; items: OrderItem[];
}

const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/orders/${id}`);
            setOrder(data);
        } catch (err: any) {
            alert('Không tìm thấy đơn hàng hoặc lỗi hệ thống');
            navigate('/profile?tab=orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrder(); }, [id]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
        try {
            await axiosInstance.put(`/orders/${id}/cancel`);
            fetchOrder(); // refresh
        } catch (err: any) {
            alert("Lỗi khi hủy đơn hàng: " + (err.response?.data?.message || ""));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!order) return null;

    const subTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = order.shippingFee || 0;
    const finalTotal = order.totalAmount;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 font-sans">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate('/profile?tab=orders')} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-6">
                    <ChevronLeft size={16} /> Quay lại danh sách đơn hàng
                </button>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 mb-6 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-5 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <Receipt size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900">Đơn hàng #{order.id}</h1>
                                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                                    <Calendar size={14} /> {new Date(order.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                order.status === 'SHIPPING' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                                order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                                'bg-red-100 text-red-700 border-red-200'
                            } border`}>
                                {order.status === 'PENDING' ? '⏳ Chờ xử lý' :
                                 order.status === 'PROCESSING' ? '⚙️ Đang xử lý' :
                                 order.status === 'SHIPPING' ? '🚚 Đang giao' :
                                 order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '✅ Đã hoàn thành' : '❌ Đã hủy'}
                            </span>
                            {order.status === 'PENDING' && (
                                <button onClick={handleCancelOrder} className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                                    <XCircle size={14} /> Hủy đơn hàng
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin size={14} /> Thông tin giao hàng</h3>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="font-bold text-gray-900 mb-1">{order.recipientName}</p>
                                <p className="text-sm text-gray-600 mb-2">{order.phone}</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{order.shippingAddress}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CreditCard size={14} /> Thanh toán</h3>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                        <CreditCard size={14} className="text-indigo-600" />
                                    </span>
                                    <p className="font-bold text-gray-900 text-sm">
                                        {order.paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPay' : 'Thanh toán khi nhận hàng (COD)'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                        <ShieldCheck size={14} className="text-green-600" />
                                    </span>
                                    <p className="font-medium text-green-700 text-sm">
                                        {order.paymentMethod === 'VNPAY' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Items List */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 mb-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                        <Package size={18} className="text-indigo-500" /> Danh sách sản phẩm
                    </h2>
                    <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/product/${item.productId}`} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                                        {item.productName}
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-1">{item.color} · {item.storage}GB</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-black text-gray-900">{fmtPrice(item.price)}</p>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5">SL: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tạm tính ({order.items.length} sản phẩm)</span>
                            <span className="font-semibold text-gray-800">{fmtPrice(subTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Phí vận chuyển</span>
                            <span className="font-semibold text-gray-800">{shippingFee === 0 ? 'Miễn phí' : fmtPrice(shippingFee)}</span>
                        </div>
                        {order.discountAmount && order.discountAmount > 0 ? (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600 flex items-center gap-1 font-medium"><Tag size={14} /> Giảm giá ({order.couponCode})</span>
                                <span className="font-bold text-green-600">-{fmtPrice(order.discountAmount)}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                            <span className="text-base font-black text-gray-900">Tổng thanh toán</span>
                            <span className="text-2xl font-black text-indigo-700">{fmtPrice(finalTotal)}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
