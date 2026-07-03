import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    X, Plus, Edit2, Trash2, Image as ImageIcon,
    Save, Loader2, AlertCircle, UploadCloud, ArrowLeft
} from 'lucide-react';
import axiosInstance from '../../api/axios';

interface VariantImage {
    id: number;
    imageUrl: string;
    displayOrder: number;
}

interface Variant {
    id: number;
    storage: number;
    color: string;
    colorHex: string;
    price: number;
    discountPrice?: number;
    stockQuantity: number;
    status: string;
    images: VariantImage[];
}

interface ProductVariantsModalProps {
    productId: number;
    onClose: () => void;
}

const EMPTY_FORM = {
    storage: 128,
    color: '',
    colorHex: '#000000',
    price: 0,
    discountPrice: 0,
    stockQuantity: 0
};

type View = 'list' | 'form';

export default function ProductVariantsModal({ productId, onClose }: ProductVariantsModalProps) {
    const [view, setView] = useState<View>('list');
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [uploadingVariantId, setUploadingVariantId] = useState<number | null>(null);

    const [form, setForm] = useState({ ...EMPTY_FORM });

    const fetchVariants = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await axiosInstance.get(`/admin/products/${productId}/variants`);
            setVariants(data);
        } catch {
            setError('Lỗi tải danh sách biến thể');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, [productId]);

    // Mở form thêm mới
    const openAddForm = () => {
        setEditingVariant(null);
        setForm({ ...EMPTY_FORM });
        setView('form');
    };

    // Mở form chỉnh sửa
    const openEditForm = (variant: Variant) => {
        setEditingVariant(variant);
        setForm({
            storage: variant.storage,
            color: variant.color,
            colorHex: variant.colorHex || '#000000',
            price: variant.price,
            discountPrice: variant.discountPrice || 0,
            stockQuantity: variant.stockQuantity
        });
        setView('form');
    };

    const backToList = () => {
        setView('list');
        setEditingVariant(null);
        setForm({ ...EMPTY_FORM });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                ...form,
                discountPrice: form.discountPrice > 0 ? form.discountPrice : null
            };
            if (editingVariant) {
                await axiosInstance.put(`/admin/products/${productId}/variants/${editingVariant.id}`, payload);
            } else {
                await axiosInstance.post(`/admin/products/${productId}/variants`, payload);
            }
            backToList();
            fetchVariants();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (variantId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa biến thể này?')) return;
        try {
            await axiosInstance.delete(`/admin/products/${productId}/variants/${variantId}`);
            fetchVariants();
        } catch {
            alert('Lỗi khi xóa biến thể');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, variantId: number) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingVariantId(variantId);
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('files', file));
        try {
            await axiosInstance.post(
                `/admin/products/${productId}/variants/${variantId}/images/upload`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            fetchVariants();
        } catch {
            alert('Lỗi upload ảnh');
        } finally {
            setUploadingVariantId(null);
            e.target.value = '';
        }
    };

    const handleImageUrlAdd = async (variantId: number) => {
        const url = window.prompt('Nhập link ảnh (URL):');
        if (!url) return;
        try {
            await axiosInstance.post(`/admin/products/${productId}/variants/${variantId}/images/url`, { imageUrl: url });
            fetchVariants();
        } catch {
            alert('Lỗi thêm ảnh bằng URL');
        }
    };

    const handleDeleteImage = async (variantId: number, imageId: number) => {
        if (!window.confirm('Bạn có chắc chắn xóa ảnh này?')) return;
        try {
            await axiosInstance.delete(`/admin/products/${productId}/variants/${variantId}/images/${imageId}`);
            fetchVariants();
        } catch {
            alert('Lỗi xóa ảnh');
        }
    };

    const fmtPrice = (n: number) => (n || 0).toLocaleString('vi-VN') + 'đ';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative z-10 flex flex-col max-h-[90vh]"
            >
                {/* ─── HEADER ─── */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {view === 'form' && (
                            <button
                                onClick={backToList}
                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Quay lại danh sách"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ImageIcon className="text-indigo-600" size={22} />
                            {view === 'list'
                                ? 'Quản lý Biến thể'
                                : editingVariant ? `Sửa: ${editingVariant.color} – ${editingVariant.storage}GB` : 'Thêm biến thể mới'
                            }
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ─── BODY ─── */}
                <div className="p-5 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>

                    {/* ── LIST VIEW ── */}
                    {view === 'list' && (
                        <>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={openAddForm}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} /> Thêm biến thể
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center py-16">
                                    <Loader2 className="animate-spin text-indigo-500 mb-3" size={36} />
                                    <p className="text-sm text-gray-400">Đang tải biến thể...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            ) : variants.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <ImageIcon className="text-gray-400" size={28} />
                                    </div>
                                    <p className="text-gray-500 font-medium">Chưa có biến thể nào</p>
                                    <p className="text-gray-400 text-sm mt-1">Ấn "Thêm biến thể" để bắt đầu</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {variants.map(v => (
                                        <div key={v.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
                                                {/* Info */}
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-gray-300 flex-shrink-0"
                                                        style={{ backgroundColor: v.colorHex || '#ccc' }}
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-gray-900">{v.color} — {v.storage}GB</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${v.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                Kho: {v.stockQuantity}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm mt-0.5">
                                                            <span className="font-bold text-indigo-600">{fmtPrice(v.discountPrice || v.price)}</span>
                                                            {v.discountPrice && v.discountPrice > 0 && (
                                                                <span className="text-xs text-gray-400 line-through ml-2">{fmtPrice(v.price)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        id={`upload-img-${v.id}`}
                                                        onChange={(e) => handleImageUpload(e, v.id)}
                                                    />
                                                    <label
                                                        htmlFor={`upload-img-${v.id}`}
                                                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-600 text-sm font-semibold rounded-lg transition-colors"
                                                        title="Tải ảnh lên từ máy"
                                                    >
                                                        {uploadingVariantId === v.id
                                                            ? <Loader2 size={14} className="animate-spin" />
                                                            : <UploadCloud size={14} />
                                                        }
                                                    </label>
                                                    <button
                                                        onClick={() => handleImageUrlAdd(v.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-600 text-sm font-semibold rounded-lg transition-colors"
                                                        title="Thêm ảnh bằng link URL"
                                                    >
                                                        <ImageIcon size={14} />
                                                    </button>

                                                    <button
                                                        onClick={() => openEditForm(v)}
                                                        title="Chỉnh sửa biến thể"
                                                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(v.id)}
                                                        title="Xóa biến thể"
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Images */}
                                            {v.images && v.images.length > 0 && (
                                                <div
                                                    className="flex gap-2 overflow-x-auto pb-1 mt-2 pt-3 border-t border-gray-200"
                                                    style={{ scrollbarWidth: 'thin' }}
                                                >
                                                    {v.images
                                                        .slice()
                                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                                        .map(img => (
                                                            <div
                                                                key={img.id}
                                                                className="relative w-20 h-20 flex-shrink-0 group rounded-lg overflow-hidden border border-gray-200"
                                                            >
                                                                <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                                                <button
                                                                    onClick={() => handleDeleteImage(v.id, img.id)}
                                                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                >
                                                                    <X size={11} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── FORM VIEW ── */}
                    {view === 'form' && (
                        <form onSubmit={handleFormSubmit} className="space-y-4 max-w-lg mx-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dung lượng (GB) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={form.storage || ''}
                                        onChange={e => setForm({ ...form, storage: Number(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tồn kho {editingVariant && '(Chỉ xem)'}</label>
                                    <input
                                        type="number"
                                        required min="0"
                                        disabled={!!editingVariant}
                                        value={form.stockQuantity === 0 ? 0 : (form.stockQuantity || '')}
                                        onChange={e => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                        title={editingVariant ? "Vui lòng dùng chức năng Quản lý Tồn kho để điều chỉnh số lượng" : ""}
                                    />
                                    {editingVariant && (
                                        <p className="text-[10px] text-gray-500 mt-1">Sử dụng mục <b>Quản lý Tồn kho</b> để điều chỉnh.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tên màu sắc *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.color}
                                        onChange={e => setForm({ ...form, color: e.target.value })}
                                        placeholder="VD: Titan Xanh"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mã màu (Hex)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={form.colorHex}
                                            onChange={e => setForm({ ...form, colorHex: e.target.value })}
                                            className="w-11 h-10 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0 p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={form.colorHex}
                                            onChange={e => setForm({ ...form, colorHex: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Giá gốc (VNĐ) *</label>
                                    <input
                                        type="number"
                                        required min="0"
                                        value={form.price || ''}
                                        onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                        placeholder="VD: 25000000"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Giá khuyến mãi (VNĐ — Tùy chọn)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.discountPrice || ''}
                                        onChange={e => setForm({ ...form, discountPrice: Number(e.target.value) })}
                                        placeholder="Để trống nếu không giảm giá"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={backToList}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {editingVariant ? 'Lưu thay đổi' : 'Thêm biến thể'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
