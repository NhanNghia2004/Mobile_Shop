import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, Check, Clock, Tag, Sparkles, Percent, Calendar, AlertCircle } from 'lucide-react';

interface Promotion {
    id: string;
    title: string;
    description: string;
    code?: string;
    discountValue: string;
    expiryDate: string;
    bannerImage: string;
    category: 'all' | 'phone' | 'accessory' | 'payment';
    terms: string[];
}

const PROMOTIONS_DATA: Promotion[] = [
    {
        id: '1',
        title: 'Siêu Tiệc Apple - Giảm Đến 3.000.000đ',
        description: 'Áp dụng cho các dòng iPhone 15 Series, iPhone 14 Series khi thanh toán qua ví điện tử hoặc chuyển khoản.',
        code: 'APPLE3M',
        discountValue: '3.000.000đ',
        expiryDate: '2026-08-31',
        bannerImage: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=600&auto=format&fit=crop',
        category: 'phone',
        terms: [
            'Áp dụng cho khách hàng mua online hoặc trực tiếp tại cửa hàng.',
            'Mỗi số điện thoại chỉ được sử dụng mã 1 lần.',
            'Không áp dụng chung với chương trình thu cũ đổi mới.'
        ]
    },
    {
        id: '2',
        title: 'Tuần Lễ Samsung - Lên Đời Galaxy S24',
        description: 'Tặng ngay củ sạc nhanh 25W và giảm thêm 1.500.000đ trực tiếp vào hoá đơn mua Galaxy S24 Ultra.',
        code: 'SAMSUNGS24',
        discountValue: '1.500.000đ',
        expiryDate: '2026-08-25',
        bannerImage: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?q=80&w=600&auto=format&fit=crop',
        category: 'phone',
        terms: [
            'Chỉ áp dụng cho phiên bản Galaxy S24 Series chính hãng.',
            'Hỗ trợ trả góp 0% lãi suất lên tới 12 tháng qua thẻ tín dụng.'
        ]
    },
    {
        id: '3',
        title: 'Phụ Kiện Chính Hãng - Đồng Giá Từ 99k',
        description: 'Cáp sạc, tai nghe, ốp lưng, cường lực từ các thương hiệu Anker, Baseus, Apple giảm sốc đến 50%.',
        code: 'ACCESS50',
        discountValue: '50%',
        expiryDate: '2026-08-20',
        bannerImage: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop',
        category: 'accessory',
        terms: [
            'Áp dụng cho danh sách phụ kiện trong chương trình khuyến mãi.',
            'Số lượng có hạn, chương trình có thể kết thúc sớm hơn dự kiến.'
        ]
    },
    {
        id: '4',
        title: 'Ưu Đãi Thanh Toán VNPAY - Giảm Ngay 500k',
        description: 'Nhập mã giảm giá khi quét VNPAY-QR thanh toán hoá đơn từ 10.000.000đ tại MobiShop.',
        code: 'VNPAYMOB500',
        discountValue: '500.000đ',
        expiryDate: '2026-09-15',
        bannerImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
        category: 'payment',
        terms: [
            'Áp dụng khi thanh toán qua ứng dụng ngân hàng quét VNPAY-QR.',
            'Không áp dụng đồng thời với các mã giảm giá VNPAY khác.'
        ]
    }
];

export default function PromotionsPage() {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'phone' | 'accessory' | 'payment'>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeDetailId, setActiveDetailId] = useState<string | null>(null);

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredPromotions = PROMOTIONS_DATA.filter(promo => 
        selectedCategory === 'all' ? true : promo.category === selectedCategory
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Hero Banner Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-pink-600 to-rose-700 text-white py-20 px-6 sm:px-12">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                            <Sparkles size={12} className="text-yellow-300" /> SIÊU KHUYẾN MÃI MOBISHOP
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6"
                    >
                        Khuyến Mãi Ngập Tràn - Mua Sắm Thả Ga
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg sm:text-xl text-rose-100 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Tổng hợp tất cả mã giảm giá, quà tặng đi kèm và các chương trình ưu đãi độc quyền dành riêng cho khách hàng MobiShop. Nhập mã ngay để nhận ưu đãi!
                    </motion.p>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="flex flex-wrap items-center justify-center gap-3 border-b border-gray-200 pb-5">
                    {[
                        { id: 'all', label: 'Tất cả ưu đãi' },
                        { id: 'phone', label: 'Điện thoại - Tablet' },
                        { id: 'accessory', label: 'Phụ kiện công nghệ' },
                        { id: 'payment', label: 'Ưu đãi thanh toán' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedCategory(tab.id as any)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                                selectedCategory === tab.id
                                    ? 'bg-red-500 text-white shadow-md shadow-red-200 scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {tab.id === 'all' && <Gift size={14} className="inline mr-1.5 -mt-0.5" />}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid of Promotions */}
            <div className="max-w-7xl mx-auto px-6 mt-10">
                {filteredPromotions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPromotions.map((promo, idx) => (
                            <motion.div
                                key={promo.id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col group hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                            >
                                {/* Banner Image & Discount Badge */}
                                <div className="relative h-56 bg-gray-100 overflow-hidden">
                                    <img
                                        src={promo.bannerImage}
                                        alt={promo.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                                        <Percent size={12} /> GIẢM {promo.discountValue}
                                    </div>
                                    
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-xl font-bold tracking-tight line-clamp-1 drop-shadow-sm">{promo.title}</h3>
                                    </div>
                                </div>

                                {/* Promo Details */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">{promo.description}</p>
                                    
                                    {/* Expiry Date */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-4 bg-gray-50 p-3 rounded-2xl w-fit">
                                        <Clock size={14} className="text-red-500" />
                                        <span>Hạn dùng đến: <span className="text-gray-800">{new Date(promo.expiryDate).toLocaleDateString('vi-VN')}</span></span>
                                    </div>

                                    {/* Copy Coupon Section */}
                                    {promo.code && (
                                        <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Mã ưu đãi</span>
                                                <span className="font-mono font-bold text-gray-800 tracking-wide text-lg bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/80">{promo.code}</span>
                                            </div>
                                            <button
                                                onClick={() => handleCopyCode(promo.code!, promo.id)}
                                                className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                                    copiedId === promo.id
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-red-50 hover:bg-red-500 text-red-600 hover:text-white'
                                                }`}
                                            >
                                                {copiedId === promo.id ? (
                                                    <>
                                                        <Check size={14} /> Đã sao chép
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={14} /> Sao chép mã
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Dropdown terms */}
                                    <div className="mt-4 border-t border-gray-100 pt-3">
                                        <button
                                            onClick={() => setActiveDetailId(activeDetailId === promo.id ? null : promo.id)}
                                            className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
                                        >
                                            {activeDetailId === promo.id ? 'Ẩn điều kiện áp dụng' : 'Xem điều kiện áp dụng'}
                                        </button>
                                        <AnimatePresence>
                                            {activeDetailId === promo.id && (
                                                <motion.ul
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 space-y-1.5 text-xs text-gray-500 list-disc list-inside bg-gray-50/50 p-3 rounded-xl border border-gray-100 overflow-hidden"
                                                >
                                                    {promo.terms.map((term, tIdx) => (
                                                        <li key={tIdx} className="leading-relaxed">{term}</li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                        <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có khuyến mãi nào</h3>
                        <p className="text-sm text-gray-500">Danh mục này hiện tại chưa có chương trình ưu đãi nào mới. Vui lòng quay lại sau nhé!</p>
                    </div>
                )}
            </div>

            {/* FAQ/Exclusive policy */}
            <div className="max-w-7xl mx-auto px-6 mt-20">
                <div className="bg-gradient-to-br from-gray-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 max-w-3xl">
                        <h2 className="text-2xl sm:text-3xl font-black mb-6">Đặc Quyền Mua Sắm Chỉ Có Tại MobiShop</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: 'Thu Cũ Đổi Mới trợ giá 15%', desc: 'Hỗ trợ thu mua điện thoại cũ giá cao nhất thị trường, tặng thêm 15% giá trị máy cũ trừ vào hoá đơn lên đời máy mới.' },
                                { title: 'Trả Góp 0% Lãi Suất', desc: 'Mua trước trả sau siêu dễ dàng qua thẻ tín dụng hơn 25 ngân hàng hoặc công ty tài chính đối tác uy tín.' },
                                { title: 'Tích Lũy Điểm Thành Viên', desc: 'Mỗi hoá đơn mua hàng sẽ được tích luỹ điểm K-Member hoàn tiền trực tiếp tối đa 2% cho đơn hàng kế tiếp.' },
                                { title: 'Miễn Phí Giao Hàng Toàn Quốc', desc: 'Mọi đơn hàng mua điện thoại, máy tính bảng trị giá từ 2.000.000đ trở lên đều được miễn phí giao hàng hoả tốc.' },
                            ].map((policy, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base mb-1 text-indigo-200">{policy.title}</h4>
                                        <p className="text-xs text-gray-300 leading-relaxed font-light">{policy.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
