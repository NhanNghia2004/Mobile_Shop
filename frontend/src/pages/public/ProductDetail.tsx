import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, ShoppingCart, ShieldCheck, Truck, ArrowLeft,
    Package, ChevronRight, Loader2, MessageCircle,
    ThumbsUp, Share2, RefreshCw, ZoomIn, GitCompare,
    Pencil, Trash2, X, Send, Camera, ImagePlus, CheckCircle2, AlertCircle
} from 'lucide-react';
import axiosInstance from '../../api/axios';
import type { ProductResponse, VariantResponse } from '../../types/product';
import WishlistButton from '../../components/WishlistButton';
import { useCompare } from '../../hooks/useCompare';


interface ReviewData {
    id: number;
    userId: number;
    username: string;
    userAvatar?: string;
    variantId: number;
    variantColor: string;
    variantStorage: number;
    rating: number;
    comment: string;
    imageUrls: string[];
    images?: { id: number; url: string }[];
    adminReply?: string;
    createdAt: string;
}

interface ReviewSummary {
    avgRating: number;
    totalReviews: number;
    breakdown: Record<number, number>;
}

interface RelatedProduct extends ProductResponse {}

const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const StarRow = ({ rating, size = 16 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={size}
                  fill={i <= Math.round(rating) ? '#FBBF24' : 'none'}
                  className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'} />
        ))}
    </div>
);

function ImageZoom({ src, onClose }: { src: string; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.img
                src={src}
                alt=""
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="max-w-full max-h-full rounded-2xl object-contain"
                onClick={e => e.stopPropagation()}
            />
        </motion.div>
    );
}


// ── Edit Review Modal (inline) ────────────────────────────────────────────────
const STAR_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

function EditReviewModal({
    productId, review, onClose, onSaved
}: {
    productId: number;
    review: ReviewData;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [rating, setRating]         = useState(review.rating);
    const [comment, setComment]       = useState(review.comment || '');
    const [hovered, setHovered]       = useState(0);
    const [existingImages, setExistingImages] = useState(review.images || []);
    const [images, setImages]         = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const display = hovered || rating;

    const handleDeleteExistingImage = async (imageId: number) => {
        if (!window.confirm('Xóa ảnh này?')) return;
        try {
            await axiosInstance.delete(`/products/${productId}/reviews/${review.id}/images/${imageId}`);
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch {
            alert('Không thể xóa ảnh này');
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) { setError('Vui lòng chọn số sao'); return; }
        if (comment.trim().length < 10) { setError('Nhận xét phải có ít nhất 10 ký tự'); return; }
        setError('');
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('rating', String(rating));
            fd.append('comment', comment);
            images.forEach(f => fd.append('images', f));
            await axiosInstance.put(`/products/${productId}/reviews/${review.id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSaved();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Chỉnh sửa đánh giá</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>
                <div className="px-5 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Stars */}
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-3">Chất lượng sản phẩm</p>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1.5">
                                {[1,2,3,4,5].map(i => (
                                    <button key={i} type="button"
                                        onClick={() => setRating(i)}
                                        onMouseEnter={() => setHovered(i)}
                                        onMouseLeave={() => setHovered(0)}
                                        className="transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star size={36} fill={i <= display ? '#FBBF24' : 'none'}
                                            className={`transition-colors ${i <= display ? 'text-yellow-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                            {display > 0 && <span className={`text-sm font-semibold ${ display >= 4 ? 'text-green-600' : display === 3 ? 'text-amber-600' : 'text-red-500'}`}>{STAR_LABELS[display]}</span>}
                        </div>
                    </div>
                    {/* Comment */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Nhận xét <span className="text-red-500">*</span></label>
                        <textarea value={comment} onChange={e => { setComment(e.target.value); setError(''); }}
                            rows={4} placeholder="Nhận xét của bạn..."
                            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
                        <span className={`text-xs mt-1 block ${comment.length < 10 ? 'text-gray-400' : 'text-green-600'}`}>
                            {comment.length} / 1000 ký tự
                        </span>
                    </div>
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-2">Ảnh đã đăng</p>
                            <div className="flex gap-2 flex-wrap">
                                {existingImages.map(img => (
                                    <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => handleDeleteExistingImage(img.id)}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-xs">
                                            <Trash2 size={14} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Image upload */}
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1.5"><Camera size={13} /> Thêm ảnh mới <span className="text-gray-400">(tối đa {5 - existingImages.length})</span></p>
                        <div className="flex gap-2 flex-wrap">
                            {images.map((file, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setImages(imgs => imgs.filter((_, i) => i !== idx))}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14} className="text-white" />
                                    </button>
                                </div>
                            ))}
                            {existingImages.length + images.length < 5 && (
                                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-400 hover:text-indigo-500 cursor-pointer">
                                    <ImagePlus size={18} />
                                    <span className="text-[10px]">Thêm</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                                        const files = Array.from(e.target.files || []);
                                        const limit = 5 - existingImages.length;
                                        setImages(prev => [...prev, ...files].slice(0, limit));
                                        e.target.value = '';
                                    }} />
                                </label>
                            )}
                        </div>
                    </div>
                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                                <AlertCircle size={14} className="flex-shrink-0" />{error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Submit */}
                    <button type="button" onClick={handleSubmit} disabled={submitting || rating === 0}
                        className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            submitting || rating === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100'
                        }`}>
                        {submitting ? <><Loader2 size={16} className="animate-spin" />Đang lưu...</> : <><CheckCircle2 size={16} />Cập nhật đánh giá</>}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── ReviewCard ────────────────────────────────────────────────────────────────
function ReviewCard({
    review, currentUserId, productId, onEdited, onDeleted
}: {
    review: ReviewData;
    currentUserId: number | null;
    productId: number;
    onEdited: () => void;
    onDeleted: (id: number) => void;
}) {
    const initials = review.username?.slice(0, 2).toUpperCase() || 'U';
    const date = new Date(review.createdAt).toLocaleDateString('vi-VN');
    const isOwner = currentUserId !== null && review.userId === currentUserId;
    const [showEdit, setShowEdit]   = useState(false);
    const [deleting, setDeleting]   = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('Xóa đánh giá này?')) return;
        setDeleting(true);
        try {
            await axiosInstance.delete(`/products/${productId}/reviews/${review.id}`);
            onDeleted(review.id);
        } catch {
            alert('Không thể xóa đánh giá');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 relative group">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0 overflow-hidden">
                    {review.userAvatar
                        ? <img src={review.userAvatar} alt="" className="w-full h-full object-cover" />
                        : initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{review.username}</span>
                        {isOwner && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">Của bạn</span>}
                        <span className="text-xs text-gray-400">{date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <StarRow rating={review.rating} size={13} />
                        <span className="text-xs text-gray-400">
                            {review.variantColor} · {review.variantStorage}GB
                        </span>
                    </div>
                </div>
                {/* Owner actions */}
                {isOwner && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setShowEdit(true)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors" title="Sửa đánh giá">
                            <Pencil size={14} />
                        </button>
                        <button onClick={handleDelete} disabled={deleting}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Xóa đánh giá">
                            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                    </div>
                )}
            </div>
            {review.comment && (
                <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.comment}</p>
            )}
            {review.imageUrls?.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                    {review.imageUrls.map((url, i) => (
                        <img key={i} src={url} alt=""
                             className="w-16 h-16 rounded-xl object-cover border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity" />
                    ))}
                </div>
            )}
            {review.adminReply && (
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
                        <MessageCircle size={12} /> Phản hồi từ cửa hàng
                    </p>
                    <p className="text-sm text-indigo-800">{review.adminReply}</p>
                </div>
            )}
        </div>
        <AnimatePresence>
            {showEdit && (
                <EditReviewModal
                    productId={productId}
                    review={review}
                    onClose={() => setShowEdit(false)}
                    onSaved={() => { setShowEdit(false); onEdited(); }}
                />
            )}
        </AnimatePresence>
        </>
    );
}

function RelatedProducts({ productId }: { productId: number }) {
    const [related, setRelated] = useState<RelatedProduct[]>([]);

    useEffect(() => {
        axiosInstance.get(`/products/${productId}/related`, { params: { limit: 6 } })
            .then(r => setRelated(r.data || []))
            .catch(() => {});
    }, [productId]);

    if (!related.length) return null;

    return (
        <section className="mt-16">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {related.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`}
                          className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="h-32 overflow-hidden bg-gray-50">
                            <img
                                src={p.imageUrl || p.variants?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop'}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop'; }}
                            />
                        </div>
                        <div className="p-3">
                            <p className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                            <p className="text-indigo-600 font-bold text-sm mt-1">{fmtPrice(p.minPrice || 0)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCompare, isInCompareList } = useCompare();

    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Variant selection
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [zoomedImg, setZoomedImg] = useState<string | null>(null);

    // Actions
    const [quantity, setQuantity] = useState(1);
    const [addingCart, setAddingCart] = useState(false);
    const [addedCart, setAddedCart] = useState(false);

    // Reviews
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
    const [reviewPage, setReviewPage] = useState(0);
    const [reviewTotalPages, setReviewTotalPages] = useState(0);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // Lấy userId hiện tại từ token/localStorage
    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user?.id) setCurrentUserId(Number(user.id));
            else {
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload?.userId) setCurrentUserId(Number(payload.userId));
                }
            }
        } catch { /* không đăng nhập */ }
    }, []);

    const fetchReviews = useCallback(() => {
        if (!id) return;
        setReviewLoading(true);
        const params: any = { page: reviewPage, size: 5 };
        if (filterRating) params.rating = filterRating;
        axiosInstance.get(`/products/${id}/reviews`, { params })
            .then(r => {
                setReviews(r.data.content || []);
                setReviewTotalPages(r.data.totalPages || 0);
            })
            .catch(() => {})
            .finally(() => setReviewLoading(false));
    }, [id, reviewPage, filterRating]);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        axiosInstance.get(`/products/${id}`)
            .then(r => {
                const p: ProductResponse = r.data;
                setProduct(p);
                const firstActive = p.variants?.find(v => v.status === 'ACTIVE' && v.stockQuantity > 0);
                setSelectedColor(firstActive?.color || p.availableColors?.[0] || null);
                setSelectedStorage(firstActive?.storage || p.availableStorages?.[0] || null);
            })
            .catch(e => setError(e.response?.data?.message || 'Không tìm thấy sản phẩm'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    useEffect(() => {
        if (!id) return;
        axiosInstance.get(`/products/${id}/reviews/summary`)
            .then(r => setReviewSummary(r.data))
            .catch(() => {});
    }, [id]);

    const currentVariant: VariantResponse | undefined = product?.variants?.find(
        v => v.color === selectedColor && v.storage === selectedStorage
    );
    const colorVariant: VariantResponse | undefined = currentVariant || product?.variants?.find(
        v => v.color === selectedColor
    );

    // Images
    const allImages: string[] = colorVariant?.images?.length
        ? colorVariant.images
        : product?.imageUrl ? [product.imageUrl] : [];
    const displayImg = activeImage || allImages[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop';

    // Reset image when color changes
    useEffect(() => { setActiveImage(null); }, [selectedColor]);

// Nếu màu mới không có dung lượng đang chọn -> chuyển sang dung lượng đầu tiên có sẵn của màu đó
    useEffect(() => {
        if (!product || !selectedColor) return;
        const storagesForColor = product.variants
            ?.filter(v => v.color === selectedColor)
            .map(v => v.storage) || [];
        if (selectedStorage !== null && !storagesForColor.includes(selectedStorage)) {
            setSelectedStorage(storagesForColor[0] ?? null);
        }
    }, [selectedColor, product]);

    const displayPrice = currentVariant?.discountPrice ?? currentVariant?.price ?? product?.minPrice ?? 0;
    const originalPrice = currentVariant?.price ?? product?.maxPrice ?? 0;
    const discountPercent = currentVariant?.discountPercent ?? 0;
    const stockLeft = currentVariant?.stockQuantity ?? (product?.inStock ? 99 : 0);

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return false; }
        if (!currentVariant) { alert('Vui lòng chọn phiên bản sản phẩm'); return false; }
        if (quantity > stockLeft) { alert(`Chỉ còn ${stockLeft} sản phẩm`); return false; }
        setAddingCart(true);
        try {
            await axiosInstance.post('/cart/add', { variantId: currentVariant.id, quantity });
            window.dispatchEvent(new Event('cartUpdated'));
            setAddedCart(true);
            setTimeout(() => setAddedCart(false), 2000);
            return true;
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể thêm vào giỏ');
            return false;
        } finally {
            setAddingCart(false);
        }
    };

    const handleBuyNow = async () => {
        const success = await handleAddToCart();
        if (success) {
            navigate('/cart');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 size={36} className="animate-spin text-indigo-500" />
        </div>
    );

    if (error || !product) return (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <p className="text-2xl font-bold text-gray-700 mb-4">Không tìm thấy sản phẩm</p>
            <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline flex items-center gap-2 mx-auto">
                <ArrowLeft size={18} /> Quay lại
            </button>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <AnimatePresence>
                {zoomedImg && <ImageZoom src={zoomedImg} onClose={() => setZoomedImg(null)} />}
            </AnimatePresence>

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <nav className="flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
                    <ChevronRight size={14} />
                    <Link to="/products" className="hover:text-indigo-600">Sản phẩm</Link>
                    {product.brand && <>
                        <ChevronRight size={14} />
                        <Link to={`/products?brand=${product.brand}`} className="hover:text-indigo-600">{product.brand}</Link>
                    </>}
                    <ChevronRight size={14} />
                    <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
                </nav>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        <div className="p-6 lg:p-10 border-r border-gray-100">

                            <div
                                className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square cursor-zoom-in group"
                                onClick={() => setZoomedImg(displayImg)}
                            >
                                <motion.img
                                    key={displayImg}
                                    src={displayImg}
                                    alt={product.name}
                                    initial={{ opacity: 0.6 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full h-full object-contain p-6"
                                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop'; }}
                                />
                                <div className="absolute bottom-3 right-3 bg-black/40 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ZoomIn size={12} /> Phóng to
                                </div>
                                {discountPercent > 0 && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                                        -{discountPercent}%
                                    </div>
                                )}
                            </div>


                            {allImages.length > 1 && (
                                <div className="flex gap-3 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(img)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-gray-50 ${
                                                (activeImage === img || (!activeImage && i === 0))
                                                    ? 'border-indigo-500 shadow-md shadow-indigo-100'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-contain p-1" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 lg:p-10">
                            {/* Brand + name */}
                            <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{product.brand}</span>
                            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mt-1 mb-3 leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating + sold */}
                            <div className="flex items-center gap-3 mb-5">
                                <StarRow rating={product.rating || 0} size={16} />
                                <span className="text-sm text-gray-500">
                                    ({product.reviewCount || 0} đánh giá)
                                </span>
                                <span className="text-gray-300">|</span>
                                <span className="text-sm text-gray-500">
                                    Đã bán <span className="font-bold text-gray-700">{(product.soldCount || 0).toLocaleString()}</span>
                                </span>
                            </div>

                            {/* Price */}
                            <div className="bg-indigo-50 rounded-2xl p-4 mb-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-black text-indigo-700">{fmtPrice(displayPrice)}</span>
                                    {discountPercent > 0 && (
                                        <span className="text-lg text-gray-400 line-through">{fmtPrice(originalPrice)}</span>
                                    )}
                                </div>
                                {discountPercent > 0 && (
                                    <p className="text-green-600 text-sm font-semibold mt-1">
                                        Tiết kiệm {fmtPrice(originalPrice - displayPrice)} ({discountPercent}% OFF)
                                    </p>
                                )}
                            </div>

                            {/* Storage selection */}
                            {product.availableStorages && product.availableStorages.length > 0 && (
                                <div className="mb-5">
                                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                        Dung lượng
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants
                                            ?.filter(v => v.color === selectedColor)
                                            ?.filter((v, idx, arr) => arr.findIndex(x => x.storage === v.storage) === idx)
                                            .map(v => (
                                                <button
                                                    key={v.storage}
                                                    onClick={() => setSelectedStorage(v.storage)}
                                                    disabled={v.status === 'OUT_OF_STOCK' && v.stockQuantity === 0}
                                                    className={`relative px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
                                                        selectedStorage === v.storage
                                                            ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                                                            : v.stockQuantity === 0
                                                                ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
                                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    {v.storage}GB
                                                    {v.stockQuantity === 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-gray-400 text-white text-[9px] px-1 rounded-full">Hết</span>
                                                    )}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Color selection */}
                            {product.availableColors && product.availableColors.length > 0 && (
                                <div className="mb-5">
                                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                        Màu sắc
                                        {selectedColor && <span className="text-indigo-600 ml-2 font-normal normal-case">{selectedColor}</span>}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants
                                            ?.filter((v, idx, arr) => arr.findIndex(x => x.color === v.color) === idx)
                                            .map(v => (
                                                <button
                                                    key={v.color}
                                                    onClick={() => setSelectedColor(v.color)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
                                                        selectedColor === v.color
                                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    {v.colorHex && (
                                                        <span
                                                            className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                                            style={{ backgroundColor: v.colorHex }}
                                                        />
                                                    )}
                                                    {v.color}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Số lượng</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-bold text-lg"
                                        >-</button>
                                        <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(stockLeft, q + 1))}
                                            disabled={quantity >= stockLeft}
                                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-bold text-lg disabled:opacity-30"
                                        >+</button>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {stockLeft > 0
                                            ? <span className="text-green-600">Còn <strong>{stockLeft}</strong> sản phẩm</span>
                                            : <span className="text-red-500 font-semibold">Hết hàng</span>
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 mb-6">
                                <button
                                    id="add-cart-btn"
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock || addingCart || addedCart}
                                    className={`flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                                        product.inStock && !addingCart && !addedCart
                                            ? 'bg-indigo-700 text-white hover:bg-indigo-800 shadow-lg shadow-indigo-100'
                                            : addedCart 
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {addingCart ? <Loader2 size={18} className="animate-spin" /> : addedCart ? null : <ShoppingCart size={18} />}
                                    {addedCart ? '✓ Đã thêm vào giỏ!' : product.inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                                </button>
                                <WishlistButton productId={product.id} variant="full" />
                                <button
                                    onClick={() => {
                                        const res = addToCompare({
                                            id: product.id,
                                            name: product.name,
                                            imageUrl: product.imageUrl,
                                            price: product.minPrice
                                        });
                                        if (!res.success) alert(res.message);
                                    }}
                                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-center ${isInCompareList(product.id) ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                    title={isInCompareList(product.id) ? "Đã thêm vào so sánh" : "Thêm vào so sánh"}
                                >
                                    <GitCompare size={20} />
                                </button>
                                <button
                                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                                    className="p-3.5 rounded-2xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                                    title="Chia sẻ"
                                >
                                    <Share2 size={20} className="text-gray-400" />
                                </button>
                            </div>

                            {product.inStock && (
                                <button
                                    onClick={handleBuyNow}
                                    className="w-full py-3.5 rounded-2xl font-bold text-indigo-700 border-2 border-indigo-200 hover:bg-indigo-50 transition-all mb-6"
                                >
                                    Mua ngay →
                                </button>
                            )}

                            {/* Benefits */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                {[
                                    { icon: Truck, text: 'Miễn phí vận chuyển toàn quốc' },
                                    { icon: ShieldCheck, text: 'Bảo hành chính hãng 12 tháng' },
                                    { icon: RefreshCw, text: 'Đổi trả trong 7 ngày' },
                                    { icon: Package, text: 'Hàng chính hãng 100%' },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                                        <Icon size={18} className="text-indigo-500 flex-shrink-0" />
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                {(product.description || product.ram || product.screenSize || product.batteryCapacity || product.os) && (
                    <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-6 lg:p-10">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Thông số & Mô tả</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Specs table */}
                            <div>
                                <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Thông số kỹ thuật</h3>
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-gray-100">
                                    {[
                                        { label: 'Thương hiệu', value: product.brand },
                                        { label: 'Danh mục', value: product.category },
                                        { label: 'Hệ điều hành', value: product.os },
                                        { label: 'RAM', value: product.ram ? `${product.ram} GB` : null },
                                        { label: 'Màn hình', value: product.screenSize ? `${product.screenSize}"` : null },
                                        { label: 'Pin', value: product.batteryCapacity ? `${product.batteryCapacity} mAh` : null },
                                        {
                                            label: 'Bộ nhớ',
                                            value: product.availableStorages?.length
                                                ? product.availableStorages.map(s => `${s}GB`).join(' / ')
                                                : null
                                        },
                                        {
                                            label: 'Màu sắc',
                                            value: product.availableColors?.length
                                                ? product.availableColors.join(' / ')
                                                : null
                                        },
                                    ].filter(r => r.value).map(row => (
                                        <tr key={row.label}>
                                            <td className="py-2.5 pr-4 text-gray-500 w-40">{row.label}</td>
                                            <td className="py-2.5 text-gray-900 font-medium">{row.value}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div>
                                    <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Mô tả sản phẩm</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-6 lg:p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageCircle size={24} className="text-indigo-500" />
                        <h2 className="text-xl font-black text-gray-900">
                            Đánh giá sản phẩm
                        </h2>
                    </div>

                    {reviewSummary && reviewSummary.totalReviews > 0 ? (
                        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-100">
                            {/* Overall score */}
                            <div className="text-center flex-shrink-0">
                                <div className="text-6xl font-black text-indigo-700 mb-2">
                                    {reviewSummary.avgRating.toFixed(1)}
                                </div>
                                <StarRow rating={reviewSummary.avgRating} size={20} />
                                <p className="text-gray-500 text-sm mt-2">{reviewSummary.totalReviews} đánh giá</p>
                            </div>

                            {/* Breakdown bars */}
                            <div className="flex-1 space-y-2">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = reviewSummary.breakdown[star] || 0;
                                    const pct = reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0;
                                    return (
                                        <button
                                            key={star}
                                            onClick={() => setFilterRating(filterRating === star ? null : star)}
                                            className={`w-full flex items-center gap-3 text-sm hover:opacity-80 transition-opacity ${filterRating === star ? 'opacity-100' : 'opacity-80'}`}
                                        >
                                            <span className="flex-shrink-0 w-10 text-right text-gray-600 font-medium">{star} ★</span>
                                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${star >= 4 ? 'bg-green-400' : star === 3 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="flex-shrink-0 w-8 text-gray-500 text-xs">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>


                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <ThumbsUp size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Chưa có đánh giá nào</p>
                            <p className="text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                        </div>
                    )}

                    {reviewLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-indigo-500" size={24} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(r => (
                                <ReviewCard
                                    key={r.id}
                                    review={r}
                                    currentUserId={currentUserId}
                                    productId={Number(id)}
                                    onEdited={() => { fetchReviews(); }}
                                    onDeleted={(deletedId) => setReviews(prev => prev.filter(x => x.id !== deletedId))}
                                />
                            ))}
                        </div>
                    )}

                    {reviewTotalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                                disabled={reviewPage === 0}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >← Trước</button>
                            <span className="px-4 py-2 text-sm text-gray-500">
                                Trang {reviewPage + 1} / {reviewTotalPages}
                            </span>
                            <button
                                onClick={() => setReviewPage(p => Math.min(reviewTotalPages - 1, p + 1))}
                                disabled={reviewPage >= reviewTotalPages - 1}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >Sau →</button>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-6 lg:p-10">
                    <RelatedProducts productId={Number(id)} />
                </div>
            </div>
        </div>
    );
}