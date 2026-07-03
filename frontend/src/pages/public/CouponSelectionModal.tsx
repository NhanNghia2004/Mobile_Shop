import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, AlertCircle, List } from 'lucide-react';
import axiosInstance from '../../api/axios';

interface CouponResponse {
    id: number;
    code: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
}

interface CouponSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (coupon: CouponResponse) => void;
    cartTotal: number;
}

export default function CouponSelectionModal({ isOpen, onClose, onApply, cartTotal }: CouponSelectionModalProps) {
    const [coupons, setCoupons] = useState<CouponResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            axiosInstance.get('/coupons/active')
                .then(res => setCoupons(res.data))
                .catch(() => setError('Không thể tải danh sách mã giảm giá'))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={onClose} 
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Tag className="text-indigo-600" size={20} />
                            Chọn mã giảm giá
                        </h3>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 overflow-y-auto flex-1 bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-500 mt-4">Đang tải danh sách...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle size={18} /> {error}
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-10 flex flex-col items-center">
                                <List className="text-gray-300 mb-3" size={40} />
                                <p className="text-gray-500">Hiện tại không có mã giảm giá nào khả dụng.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {coupons.map(coupon => {
                                    const isEligible = !coupon.minOrderValue || cartTotal >= coupon.minOrderValue;

                                    return (
                                        <div key={coupon.id} className={`bg-white border rounded-xl overflow-hidden flex shadow-sm transition-all ${isEligible ? 'border-gray-200 hover:border-indigo-300' : 'border-gray-200 opacity-60'}`}>
                                            {/* Left Banner */}
                                            <div className="bg-green-600 w-24 flex flex-col items-center justify-center text-white p-3 border-r border-dashed border-gray-200 relative">
                                                {/* Half-circles for styling */}
                                                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                                                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                                                
                                                <span className="text-xl font-black">
                                                    {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `${(coupon.discountValue / 1000)}K`}
                                                </span>
                                                <span className="text-[10px] font-bold tracking-widest mt-1">GIẢM</span>
                                            </div>

                                            {/* Right Content */}
                                            <div className="p-3 flex-1 flex flex-col relative justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="inline-block border border-green-500 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md">
                                                            {coupon.code}
                                                        </span>
                                                        <button 
                                                            onClick={() => onApply(coupon)}
                                                            disabled={!isEligible}
                                                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${isEligible ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                        >
                                                            Dùng ngay
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                        Giảm {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : fmtPrice(coupon.discountValue)} 
                                                        {coupon.maxDiscountAmount ? ` tối đa ${fmtPrice(coupon.maxDiscountAmount)}` : ''}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 text-[10px] font-medium">
                                                    <span className={coupon.usageLimit ? 'text-orange-500' : 'text-red-500'}>
                                                        {coupon.usageLimit ? `Còn ${(coupon.usageLimit - coupon.usedCount)} lượt` : 'Vô hạn lượt dùng'}
                                                    </span>
                                                    <span className="text-blue-500">
                                                        {coupon.minOrderValue ? `Đơn tối thiểu ${fmtPrice(coupon.minOrderValue)}` : 'Mọi đơn hàng'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
