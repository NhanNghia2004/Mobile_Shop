import React, { useEffect, useState, useCallback } from 'react';
import {
    Star, MessageSquare, EyeOff, Eye, Loader2,
    RefreshCw, CornerDownRight, CheckCircle2,
    AlertCircle, Search, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axios';

// ─── Types ──────────────────────────────────────────────────────────────────
interface AdminReviewStats {
    totalReviews: number;
    visibleReviews: number;
    hiddenReviews: number;
    reviewsWithImages: number;
    reviewsWithReply: number;
    reviewsNoReply: number;
    ratingBreakdown: Record<number, number>;
    avgRating: number;
}

interface AdminReview {
    id: number;
    userId: number;
    username: string;
    userEmail: string;
    userAvatar: string;
    productId: number;
    productName: string;
    productImageUrl: string;
    variantId: number;
    variantColor: string;
    variantStorage: number;
    rating: number;
    comment: string;
    imageUrls: string[];
    hasImages: boolean;
    status: 'VISIBLE' | 'HIDDEN';
    adminReply: string;
    adminRepliedAt: string;
    hasReply: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminReviews() {
    const [stats, setStats] = useState<AdminReviewStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all'); // all | has_image | has_reply | no_reply
    const [ratingFilter, setRatingFilter] = useState<number | ''>('');
    const [keyword, setKeyword] = useState('');
    const [searchVal, setSearchVal] = useState('');

    // Reply states
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // Toggling state
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // Deleting state
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fmtDate = (s: string) =>
        new Date(s).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    // ── Fetch Data ─────────────────────────────────────────────────────────
    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const { data } = await axiosInstance.get('/admin/reviews/stats');
            setStats(data);
        } catch { } finally {
            setLoadingStats(false);
        }
    };

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/admin/reviews', {
                params: {
                    page,
                    size: 15,
                    keyword: keyword || undefined,
                    status: statusFilter,
                    type: typeFilter,
                    rating: ratingFilter || undefined
                }
            });
            setReviews(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch {
            console.error('Lỗi tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, [page, keyword, statusFilter, typeFilter, ratingFilter]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setKeyword(searchVal);
        setPage(0);
    };

    // ── Actions ─────────────────────────────────────────────────────────────
    const handleToggleVisibility = async (id: number) => {
        setTogglingId(id);
        try {
            await axiosInstance.patch(`/admin/reviews/${id}/toggle`);
            fetchReviews();
            fetchStats();
        } catch {
            alert('Lỗi khi thay đổi trạng thái hiển thị');
        } finally {
            setTogglingId(null);
        }
    };

    const handleSubmitReply = async (id: number) => {
        if (!replyContent.trim()) {
            alert('Vui lòng nhập nội dung phản hồi');
            return;
        }
        setIsSubmittingReply(true);
        try {
            const isEditing = reviews.find(r => r.id === id)?.hasReply;
            if (isEditing) {
                await axiosInstance.put(`/admin/reviews/${id}/reply`, { reply: replyContent });
            } else {
                await axiosInstance.post(`/admin/reviews/${id}/reply`, { reply: replyContent });
            }
            setReplyingToId(null);
            setReplyContent('');
            fetchReviews();
            fetchStats();
        } catch {
            alert('Lỗi gửi phản hồi');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleDeleteReview = async (id: number) => {
        if (!window.confirm('Xóa vĩnh viễn đánh giá này?')) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/admin/reviews/${id}`);
            fetchReviews();
            fetchStats();
        } catch {
            alert('Lỗi xóa đánh giá');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteReply = async (id: number) => {
        if (!window.confirm('Xóa phản hồi này?')) return;
        try {
            await axiosInstance.delete(`/admin/reviews/${id}/reply`);
            fetchReviews();
            fetchStats();
        } catch {
            alert('Lỗi xóa phản hồi');
        }
    };

    // ── Components ──────────────────────────────────────────────────────────
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Quản lý Đánh giá</h1>
                    <p className="text-sm text-gray-500 mt-1">Xem, kiểm duyệt và phản hồi đánh giá khách hàng</p>
                </div>
                <button
                    onClick={() => { fetchReviews(); fetchStats(); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors font-semibold text-sm"
                >
                    <RefreshCw size={15} /> Làm mới
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Tổng số', value: stats?.totalReviews, icon: MessageSquare, color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'Hiển thị', value: stats?.visibleReviews, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
                    { label: 'Bị ẩn', value: stats?.hiddenReviews, icon: EyeOff, color: 'text-gray-600 bg-gray-100' },
                    { label: 'Trung bình sao', value: stats?.avgRating ? Number(stats.avgRating).toFixed(1) : '0.0', icon: Star, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Có phản hồi', value: stats?.reviewsWithReply, icon: CornerDownRight, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Chưa phản hồi', value: stats?.reviewsNoReply, icon: AlertCircle, color: 'text-orange-600 bg-orange-50', isAlert: true },
                ].map(({ label, value, icon: Icon, color, isAlert }) => (
                    <div key={label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            {loadingStats
                                ? <div className="h-6 w-12 bg-gray-100 animate-pulse rounded mx-auto" />
                                : <p className={`text-xl font-black leading-none mt-1 ${isAlert && value && Number(value) > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{value ?? 0}</p>
                            }
                            <p className="text-xs text-gray-500 font-semibold mt-1">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Tìm theo nội dung đánh giá..."
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none border-none"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                </form>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={ratingFilter}
                        onChange={e => { setRatingFilter(e.target.value ? Number(e.target.value) : ''); setPage(0); }}
                        className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm font-medium text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Tất cả số sao</option>
                        <option value="5">5 Sao</option>
                        <option value="4">4 Sao</option>
                        <option value="3">3 Sao</option>
                        <option value="2">2 Sao</option>
                        <option value="1">1 Sao</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                        className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm font-medium text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">Mọi trạng thái</option>
                        <option value="VISIBLE">Đang hiển thị</option>
                        <option value="HIDDEN">Đang ẩn</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
                        className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm font-medium text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="has_image">Có hình ảnh</option>
                        <option value="has_reply">Đã phản hồi</option>
                        <option value="no_reply">Chưa phản hồi</option>
                    </select>
                </div>
            </div>

            {/* ── Reviews List ── */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={32} />
                        <p className="text-gray-400 text-sm">Đang tải đánh giá...</p>
                    </div>
                ) : (!reviews || reviews.length === 0) ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
                        Không tìm thấy đánh giá nào
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${review.status === 'HIDDEN' ? 'border-gray-200 opacity-75' : 'border-gray-100'}`}>
                            <div className="p-5 flex flex-col md:flex-row gap-5 items-start">
                                {/* Left: User & Product Info */}
                                <div className="w-full md:w-64 flex-shrink-0 space-y-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                            {review.userAvatar ? <img src={review.userAvatar} className="w-full h-full rounded-full object-cover" alt="" /> : (review.username?.charAt(0)?.toUpperCase() || 'U')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 line-clamp-1">{review.username}</p>
                                            <p className="text-[11px] text-gray-500">{review.userEmail}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs font-semibold text-gray-500 mb-1">Sản phẩm</p>
                                        <div className="flex items-center gap-2">
                                            <img src={review.productImageUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm line-clamp-1">{review.productName}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{review.variantColor} — {review.variantStorage}GB</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {fmtDate(review.createdAt)}
                                    </div>
                                </div>

                                {/* Right: Review Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        {renderStars(review.rating)}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleVisibility(review.id)}
                                                disabled={togglingId === review.id}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${review.status === 'VISIBLE'
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                    }`}
                                            >
                                                {togglingId === review.id ? <Loader2 size={14} className="animate-spin" /> : review.status === 'VISIBLE' ? <EyeOff size={14} /> : <Eye size={14} />}
                                                {review.status === 'VISIBLE' ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                disabled={deletingId === review.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                title="Xóa vĩnh viễn đánh giá"
                                            >
                                                {deletingId === review.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                Xóa
                                            </button>
                                        </div>
                                    </div>

                                    <p className={`text-sm ${review.status === 'HIDDEN' ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                                        {review.comment || <span className="text-gray-400 italic">(Không có nội dung chữ)</span>}
                                    </p>

                                    {review.hasImages && (
                                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                                            {review.imageUrls?.map((url, idx) => (
                                                <img key={idx} src={url} className="w-16 h-16 rounded-lg object-cover border border-gray-200" alt="Review img" />
                                            ))}
                                        </div>
                                    )}

                                    {/* Admin Reply Area */}
                                    <div className="mt-4">
                                        {review.hasReply ? (
                                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl relative group">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Phản hồi của Shop</div>
                                                    <span className="text-[10px] text-gray-400">{fmtDate(review.adminRepliedAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{review.adminReply}</p>
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <button onClick={() => { setReplyingToId(review.id); setReplyContent(review.adminReply); }} className="text-xs font-semibold text-blue-600 hover:underline">Sửa</button>
                                                    <button onClick={() => handleDeleteReply(review.id)} className="text-xs font-semibold text-red-600 hover:underline">Xóa</button>
                                                </div>
                                            </div>
                                        ) : replyingToId !== review.id ? (
                                            <button
                                                onClick={() => { setReplyingToId(review.id); setReplyContent(''); }}
                                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                <CornerDownRight size={14} /> Phản hồi khách hàng
                                            </button>
                                        ) : null}

                                        {/* Reply Form */}
                                        <AnimatePresence>
                                            {replyingToId === review.id && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                                                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex gap-3">
                                                        <textarea
                                                            value={replyContent}
                                                            onChange={e => setReplyContent(e.target.value)}
                                                            placeholder="Nhập nội dung phản hồi của shop..."
                                                            className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none"
                                                            rows={2}
                                                            autoFocus
                                                        />
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => handleSubmitReply(review.id)}
                                                                disabled={isSubmittingReply}
                                                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
                                                            >
                                                                {isSubmittingReply ? <Loader2 size={14} className="animate-spin" /> : 'Gửi'}
                                                            </button>
                                                            <button
                                                                onClick={() => { setReplyingToId(null); setReplyContent(''); }}
                                                                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30">←</button>
                        {Array.from({ length: totalPages }).map((_, i) => {
                            if (totalPages > 7 && (i < page - 2 || i > page + 2) && i !== 0 && i !== totalPages - 1) {
                                if (i === page - 3 || i === page + 3) return <span key={i} className="px-2 text-gray-400">...</span>;
                                return null;
                            }
                            return (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${page === i ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30">→</button>
                    </div>
                </div>
            )}
        </div>
    );
}
