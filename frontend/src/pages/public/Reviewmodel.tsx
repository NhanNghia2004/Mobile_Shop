import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Star, Send, Loader2, CheckCircle2, AlertCircle,
    Camera, Trash2, ImagePlus, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { reviewApi, type ReviewResponse } from '../../api/Reviewapi.ts';
import api from '../../api/axios';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ReviewItem {
    productId: number;
    productName: string;
    imageUrl?: string;
    color: string;
    storage: number;
    orderItemId: number;
}

interface ReviewModalProps {
    orderId: number;
    items: ReviewItem[];
    onClose: () => void;
    onSuccess?: () => void;
}

// ── Star Rating Input ──────────────────────────────────────────────────────────
const STAR_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChange(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110 active:scale-95"
                    >
                        <Star
                            size={36}
                            fill={i <= display ? '#FBBF24' : 'none'}
                            className={`transition-colors ${i <= display ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                {display > 0 && (
                    <motion.span
                        key={display}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`text-sm font-semibold ${
                            display >= 4 ? 'text-green-600' : display === 3 ? 'text-amber-600' : 'text-red-500'
                        }`}
                    >
                        {STAR_LABELS[display]}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Image Upload ───────────────────────────────────────────────────────────────
function ImageUpload({
                         images,
                         onChange,
                     }: {
    images: File[];
    onChange: (files: File[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const next = [...images, ...files].slice(0, 5);
        onChange(next);
        if (inputRef.current) inputRef.current.value = '';
    };

    const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

    return (
        <div>
            <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1.5">
                <Camera size={13} /> Thêm ảnh thực tế <span className="text-gray-400">(tối đa 5)</span>
            </p>
            <div className="flex gap-2 flex-wrap">
                {images.map((file, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} className="text-white" />
                        </button>
                    </div>
                ))}
                {images.length < 5 && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-400 hover:text-indigo-500"
                    >
                        <ImagePlus size={18} />
                        <span className="text-[10px]">Thêm</span>
                    </button>
                )}
                <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePick} />
            </div>
        </div>
    );
}

// ── Single Product Review Form ─────────────────────────────────────────────────
function SingleReviewForm({
                              item,
                              orderId,
                              onDone,
                          }: {
    item: ReviewItem;
    orderId: number;
    onDone: (productId: number, review: ReviewResponse) => void;
}) {
    const [rating, setRating]     = useState(0);
    const [comment, setComment]   = useState('');
    const [images, setImages]     = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]       = useState('');
    const [existing, setExisting] = useState<ReviewResponse | null>(null);
    const [checking, setChecking] = useState(true);
    const [canReview, setCanReview] = useState(true);

    useEffect(() => {
        (async () => {
            setChecking(true);
            try {
                const check = await reviewApi.checkCanReview(item.productId, orderId);
                setCanReview(check.canReview);
                if (check.alreadyReviewed && check.existingReview) {
                    setExisting(check.existingReview);
                    setRating(check.existingReview.rating);
                    setComment(check.existingReview.comment);
                }
            } catch {
                // Nếu backend chưa có endpoint check → cho phép review
                setCanReview(true);
            } finally {
                setChecking(false);
            }
        })();
    }, [item.productId, orderId]);

    const handleSubmit = async () => {
        if (rating === 0) { setError('Vui lòng chọn số sao đánh giá'); return; }
        if (comment.trim().length < 10) { setError('Nhận xét phải có ít nhất 10 ký tự'); return; }
        setError('');
        setSubmitting(true);

        try {
            // Upload ảnh nếu có
            let imageUrls: string[] = [];
            if (images.length > 0) {
                const formData = new FormData();
                images.forEach(f => formData.append('files', f));
                try {
                    const { data } = await api.post('/upload/images', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    imageUrls = data.urls || [];
                } catch {
                    // Nếu upload ảnh lỗi → tiếp tục không ảnh
                }
            }

            let result: ReviewResponse;
            if (existing) {
                result = await reviewApi.updateReview(existing.id, { rating, comment, imageUrls });
            } else {
                result = await reviewApi.submitReview({
                    productId: item.productId,
                    orderId,
                    rating,
                    comment,
                    imageUrls,
                });
            }
            onDone(item.productId, result);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gửi đánh giá thất bại, vui lòng thử lại');
        } finally {
            setSubmitting(false);
        }
    };

    if (checking) return (
        <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Đang kiểm tra...</span>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Product info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                    <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop'; }}
                    />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.color} · {item.storage}GB</p>
                    {existing && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full mt-1">
                            <CheckCircle2 size={9} /> Đã đánh giá — Chỉnh sửa
                        </span>
                    )}
                </div>
            </div>

            {/* Star rating */}
            <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-3">Chất lượng sản phẩm</p>
                <StarInput value={rating} onChange={setRating} />
            </div>

            {/* Comment */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Nhận xét của bạn <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={comment}
                    onChange={e => { setComment(e.target.value); setError(''); }}
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm: chất lượng màn hình, camera, pin, hiệu năng..."
                    className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all placeholder-gray-300"
                />
                <div className="flex justify-between mt-1">
                    <span className={`text-xs ${comment.length < 10 ? 'text-gray-400' : 'text-green-600'}`}>
                        {comment.length} / 1000 ký tự {comment.length < 10 && comment.length > 0 ? `(cần thêm ${10 - comment.length})` : ''}
                    </span>
                </div>
            </div>

            {/* Image upload */}
            <ImageUpload images={images} onChange={setImages} />

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
                    >
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    submitting || rating === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100'
                }`}
            >
                {submitting
                    ? <><Loader2 size={16} className="animate-spin" />Đang gửi...</>
                    : existing
                        ? <><CheckCircle2 size={16} />Cập nhật đánh giá</>
                        : <><Send size={16} />Gửi đánh giá</>
                }
            </button>
        </div>
    );
}

// ── Review Success Screen ──────────────────────────────────────────────────────
function SuccessScreen({ count, onClose }: { count: number; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center gap-4"
        >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">Cảm ơn bạn đã đánh giá!</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Bạn đã gửi {count} đánh giá thành công.
                </p>
                <p className="text-xs text-gray-400 mt-1">Đánh giá của bạn giúp ích cho nhiều người mua khác.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                <ShieldCheck size={13} />
                Đánh giá đã được xác minh — Đã mua hàng
            </div>
            <button
                onClick={onClose}
                className="mt-2 w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all"
            >
                Đóng
            </button>
        </motion.div>
    );
}

// ── Main ReviewModal ───────────────────────────────────────────────────────────
export default function ReviewModal({ orderId, items, onClose, onSuccess }: ReviewModalProps) {
    const [currentIdx, setCurrentIdx]     = useState(0);
    const [doneIds, setDoneIds]           = useState<Set<number>>(new Set());
    const [allDone, setAllDone]           = useState(false);

    const handleDone = (productId: number, _review: ReviewResponse) => {
        const next = new Set(doneIds).add(productId);
        setDoneIds(next);
        if (currentIdx < items.length - 1) {
            // Có sản phẩm tiếp theo → hỏi có muốn tiếp không
            setCurrentIdx(i => i + 1);
        } else {
            setAllDone(true);
            onSuccess?.();
        }
    };

    const currentItem = items[currentIdx];
    const progress = doneIds.size / items.length;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 60 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Modal header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div>
                            <h2 className="font-bold text-gray-900 text-base">
                                {allDone ? 'Đánh giá hoàn tất' : 'Đánh giá sản phẩm'}
                            </h2>
                            {!allDone && items.length > 1 && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Sản phẩm {currentIdx + 1} / {items.length}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            <X size={16} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Progress bar — khi có nhiều sp */}
                    {items.length > 1 && !allDone && (
                        <div className="h-1 bg-gray-100">
                            <motion.div
                                animate={{ width: `${(currentIdx / items.length) * 100}%` }}
                                className="h-full bg-indigo-500"
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    )}

                    {/* Body */}
                    <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
                        {allDone ? (
                            <SuccessScreen count={doneIds.size} onClose={onClose} />
                        ) : (
                            <>
                                {/* Product tabs — khi có nhiều sp */}
                                {items.length > 1 && (
                                    <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                        {items.map((item, idx) => (
                                            <button
                                                key={item.productId}
                                                onClick={() => setCurrentIdx(idx)}
                                                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                    idx === currentIdx
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : doneIds.has(item.productId)
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {doneIds.has(item.productId) && <CheckCircle2 size={11} />}
                                                <span className="max-w-[100px] truncate">{item.productName}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <SingleReviewForm
                                    key={currentItem.productId}
                                    item={currentItem}
                                    orderId={orderId}
                                    onDone={handleDone}
                                />

                                {/* Skip / Next navigation */}
                                {items.length > 1 && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                                            disabled={currentIdx === 0}
                                            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                                        >
                                            ← Sản phẩm trước
                                        </button>
                                        {currentIdx < items.length - 1 && (
                                            <button
                                                onClick={() => setCurrentIdx(i => i + 1)}
                                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                            >
                                                Bỏ qua <ChevronRight size={13} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}