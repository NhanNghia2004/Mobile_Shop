import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axios';

interface ProductFormModalProps {
    productId: number | null;
    onClose: (needsRefresh: boolean) => void;
}

export default function ProductFormModal({ productId, onClose }: ProductFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        brand: '',
        category: 'PHONE',
        imageUrl: '',
        os: 'OTHER',
        ram: 0,
        screenSize: 0,
        batteryCapacity: 0,
        description: ''
    });

    useEffect(() => {
        if (productId) {
            setLoading(true);
            axiosInstance.get(`/admin/products/${productId}`)
                .then(res => {
                    const p = res.data;
                    setForm({
                        name: p.name || '',
                        brand: p.brand || '',
                        category: p.category || 'PHONE',
                        imageUrl: p.imageUrl || '',
                        os: p.os || 'OTHER',
                        ram: p.ram || 0,
                        screenSize: p.screenSize || 0,
                        batteryCapacity: p.batteryCapacity || 0,
                        description: p.description || ''
                    });
                })
                .catch(() => setError('Không thể tải thông tin sản phẩm'))
                .finally(() => setLoading(false));
        }
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!form.name.trim() || !form.brand.trim()) {
            setError('Tên và Thương hiệu không được để trống');
            return;
        }

        setSaving(true);
        try {
            if (productId) {
                await axiosInstance.put(`/admin/products/${productId}`, form);
            } else {
                await axiosInstance.post('/admin/products', form);
            }
            onClose(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => onClose(false)} 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {productId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <button 
                        onClick={() => onClose(false)} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
                    {loading ? (
                        <div className="flex flex-col items-center py-10">
                            <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                            <p className="text-gray-500 text-sm">Đang tải...</p>
                        </div>
                    ) : (
                        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tên sản phẩm *</label>
                                    <input 
                                        type="text" 
                                        value={form.name}
                                        onChange={e => setForm({...form, name: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Ví dụ: iPhone 15 Pro Max"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Thương hiệu *</label>
                                    <input 
                                        type="text" 
                                        value={form.brand}
                                        onChange={e => setForm({...form, brand: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Ví dụ: Apple"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh sản phẩm (URL)</label>
                                    <input 
                                        type="text" 
                                        value={form.imageUrl}
                                        onChange={e => setForm({...form, imageUrl: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Nhập đường dẫn ảnh sản phẩm (tuỳ chọn)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hệ điều hành</label>
                                    <select 
                                        value={form.os}
                                        onChange={e => setForm({...form, os: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="IOS">iOS</option>
                                        <option value="ANDROID">Android</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">RAM (GB)</label>
                                    <input 
                                        type="number" 
                                        value={form.ram || ''}
                                        onChange={e => setForm({...form, ram: Number(e.target.value)})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Màn hình (inch)</label>
                                    <input 
                                        type="number" step="0.1"
                                        value={form.screenSize || ''}
                                        onChange={e => setForm({...form, screenSize: Number(e.target.value)})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pin (mAh)</label>
                                    <input 
                                        type="number" 
                                        value={form.batteryCapacity || ''}
                                        onChange={e => setForm({...form, batteryCapacity: Number(e.target.value)})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả sản phẩm</label>
                                    <textarea 
                                        value={form.description}
                                        onChange={e => setForm({...form, description: e.target.value})}
                                        rows={4}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        placeholder="Nhập mô tả chi tiết..."
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                    <button 
                        onClick={() => onClose(false)}
                        className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit"
                        form="product-form"
                        disabled={saving || loading}
                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {productId ? 'Lưu thay đổi' : 'Thêm mới'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
