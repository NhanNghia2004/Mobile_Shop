import axiosInstance from './axios';

export interface ReviewResponse {
    id: number;
    productId: number;
    variantId?: number;
    orderId?: number;
    username: string;
    avatarUrl?: string;
    rating: number;
    comment: string;
    imageUrls?: string[];
    createdAt: string;
    verified: boolean;
}

export interface ReviewSummaryResponse {
    avgRating: number;
    totalReviews: number;
    breakdown: Record<number, number>;
}

export const reviewApi = {
    /** Lấy danh sách review của sản phẩm (public) */
    getByProduct: async (
        productId: number,
        page = 0,
        size = 10,
        rating?: number
    ): Promise<any> => {
        const params: any = { page, size };
        if (rating) params.rating = rating;
        const res = await axiosInstance.get(`/products/${productId}/reviews`, { params });
        return res.data;
    },

    /** Lấy tổng hợp đánh giá của sản phẩm */
    getSummary: async (productId: number): Promise<ReviewSummaryResponse> => {
        const res = await axiosInstance.get(`/products/${productId}/reviews/summary`);
        return res.data;
    },

    /**
     * Kiểm tra user đã review sản phẩm trong đơn hàng chưa.
     * Dùng findByUserIdAndVariantId để kiểm tra.
     * Frontend gọi API lấy review của user cho variantId.
     */
    checkExistingReview: async (
        productId: number,
        variantId: number
    ): Promise<{ alreadyReviewed: boolean; existingReview?: ReviewResponse }> => {
        try {
            const res = await axiosInstance.get(`/products/${productId}/reviews`, {
                params: { page: 0, size: 100 },
            });
            const reviews: ReviewResponse[] = res.data.content || [];
            const username = (() => {
                try { return JSON.parse(localStorage.getItem('user') || '{}').username; } catch { return null; }
            })();
            const mine = reviews.find(r => r.username === username && r.variantId === variantId);
            return mine
                ? { alreadyReviewed: true, existingReview: mine }
                : { alreadyReviewed: false };
        } catch {
            return { alreadyReviewed: false };
        }
    },

    /** Gửi đánh giá mới — multipart/form-data */
    submitReview: async (
        productId: number,
        variantId: number,
        rating: number,
        comment: string,
        images: File[]
    ): Promise<ReviewResponse> => {
        const fd = new FormData();
        fd.append('variantId', String(variantId));
        fd.append('rating', String(rating));
        if (comment) fd.append('comment', comment);
        images.forEach(f => fd.append('images', f));
        const res = await axiosInstance.post(`/products/${productId}/reviews`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    /** Cập nhật đánh giá đã có — multipart/form-data */
    updateReview: async (
        productId: number,
        reviewId: number,
        rating: number,
        comment: string,
        images: File[]
    ): Promise<ReviewResponse> => {
        const fd = new FormData();
        fd.append('rating', String(rating));
        if (comment) fd.append('comment', comment);
        images.forEach(f => fd.append('images', f));
        const res = await axiosInstance.put(`/products/${productId}/reviews/${reviewId}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    /** Xóa đánh giá */
    deleteReview: async (productId: number, reviewId: number): Promise<void> => {
        await axiosInstance.delete(`/products/${productId}/reviews/${reviewId}`);
    },
};