import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Edit, Trash2, Search, Loader2, AlertCircle, 
    X, Ticket
} from 'lucide-react';
import api from '../../api/axios';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Coupon {
    id: number;
    code: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    minOrderValue: number;
    maxDiscountAmount: number;
    startDate: string | null;
    endDate: string | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
}

interface PageData {
    content: Coupon[];
    totalPages: number;
    totalElements: number;
}

// ── Components ─────────────────────────────────────────────────────────────────
export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENT',
        discountValue: '',
        minOrderValue: '0',
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isActive: true
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: page.toString(), size: '10' });
            if (keyword) params.append('keyword', keyword);
            if (statusFilter !== 'ALL') params.append('isActive', statusFilter === 'ACTIVE' ? 'true' : 'false');
            
            const res = await api.get(`/admin/coupons?${params.toString()}`);
            const data: PageData = res.data;
            setCoupons(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Failed to fetch coupons', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [page, keyword, statusFilter]);

    const handleOpenModal = (coupon?: Coupon) => {
        setError('');
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue.toString(),
                minOrderValue: coupon.minOrderValue.toString(),
                maxDiscountAmount: coupon.maxDiscountAmount ? coupon.maxDiscountAmount.toString() : '',
                startDate: coupon.startDate ? coupon.startDate.substring(0, 16) : '',
                endDate: coupon.endDate ? coupon.endDate.substring(0, 16) : '',
                usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
                isActive: coupon.isActive
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                discountType: 'PERCENT',
                discountValue: '',
                minOrderValue: '0',
                maxDiscountAmount: '',
                startDate: '',
                endDate: '',
                usageLimit: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const payload = {
            ...formData,
            code: formData.code.toUpperCase(),
            discountValue: parseFloat(formData.discountValue),
            minOrderValue: parseFloat(formData.minOrderValue) || 0,
            maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        };

        try {
            if (editingCoupon) {
                await api.put(`/admin/coupons/${editingCoupon.id}`, payload);
            } else {
                await api.post('/admin/coupons', payload);
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/admin/coupons/${id}/toggle`);
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
        } catch (err) {
            alert('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            fetchCoupons();
        } catch (err) {
            alert('Lỗi khi xóa mã giảm giá');
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Ticket className="text-indigo-600" /> Quản lý Mã Giảm Giá
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Tạo và quản lý các chương trình khuyến mãi</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all active:scale-95"
                >
                    <Plus size={18} /> Thêm mã mới
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Đã khóa</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Mã</th>
                                <th className="px-6 py-4">Mức giảm</th>
                                <th className="px-6 py-4">Điều kiện</th>
                                <th className="px-6 py-4">Thời hạn</th>
                                <th className="px-6 py-4">Đã dùng</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy mã giảm giá nào.
                                    </td>
                                </tr>
                            ) : coupons.map(coupon => (
                                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded w-fit uppercase border border-gray-200 tracking-wider">
                                            {coupon.code}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-indigo-600">
                                            {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()}đ`}
                                        </div>
                                        {coupon.maxDiscountAmount && coupon.discountType === 'PERCENT' && (
                                            <div className="text-xs text-gray-500">Tối đa {coupon.maxDiscountAmount.toLocaleString()}đ</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600">
                                            Đơn từ {coupon.minOrderValue.toLocaleString()}đ
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString('vi-VN') : '---'} <br />
                                        đến {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('vi-VN') : '---'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-gray-900">{coupon.usedCount}</span>
                                            <span className="text-gray-400">/</span>
                                            <span className="text-gray-500">{coupon.usageLimit || '∞'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => handleToggle(coupon.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${coupon.isActive ? 'bg-indigo-500' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${coupon.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(coupon)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                    page === i ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-full transition-colors border border-transparent hover:border-gray-200">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}
                                <form id="couponForm" onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã giảm giá *</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-mono uppercase"
                                                placeholder="VD: SUMMER2024"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
                                            <div className="flex items-center h-[42px]">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                                    <span className="ml-3 text-sm font-medium text-gray-700">{formData.isActive ? 'Kích hoạt' : 'Tạm khóa'}</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Loại giảm giá</label>
                                            <select
                                                value={formData.discountType}
                                                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                            >
                                                <option value="PERCENT">Theo phần trăm (%)</option>
                                                <option value="FIXED">Số tiền cố định (đ)</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giá trị giảm *</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="number"
                                                    value={formData.discountValue}
                                                    onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                    placeholder={formData.discountType === 'PERCENT' ? '10' : '50000'}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                                    {formData.discountType === 'PERCENT' ? '%' : 'đ'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đơn hàng tối thiểu (đ)</label>
                                            <input
                                                type="number"
                                                value={formData.minOrderValue}
                                                onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className={`block text-sm font-semibold mb-1.5 ${formData.discountType === 'FIXED' ? 'text-gray-400' : 'text-gray-700'}`}>Giảm tối đa (đ)</label>
                                            <input
                                                type="number"
                                                value={formData.maxDiscountAmount}
                                                onChange={e => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                                disabled={formData.discountType === 'FIXED'}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="Để trống nếu không giới hạn"
                                            />
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày bắt đầu</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày kết thúc</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số lượt sử dụng tối đa</label>
                                            <input
                                                type="number"
                                                value={formData.usageLimit}
                                                onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                                placeholder="Để trống nếu không giới hạn"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors">
                                    Hủy
                                </button>
                                <button type="submit" form="couponForm" disabled={submitting} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2">
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {editingCoupon ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
