import axiosInstance from './axios';

export interface ReviewRequest {
    productId: number;
    orderId: number;
    rating: number;       // 1–5
    comment: string;
    imageUrls?: string[]; // optional ảnh đính kèm
}

export interface ReviewResponse {
    id: number;
    productId: number;
    orderId: number;
    username: string;
    avatarUrl?: string;
    rating: number;
    comment: string;
    imageUrls?: string[];
    createdAt: string;
    verified: boolean;    // đã mua hàng
}

export interface ReviewCheckResponse {
    canReview: boolean;   // true nếu đã mua + chưa review sản phẩm này trong đơn này
    alreadyReviewed: boolean;
    existingReview?: ReviewResponse;
}

export const reviewApi = {
    /** Kiểm tra user có thể review sản phẩm trong đơn hàng không */
    checkCanReview: async (productId: number, orderId: number): Promise<ReviewCheckResponse> => {
        const res = await axiosInstance.get(`/reviews/check`, { params: { productId, orderId } });
        return res.data;
    },

    /** Gửi đánh giá mới */
    submitReview: async (payload: ReviewRequest): Promise<ReviewResponse> => {
        const res = await axiosInstance.post('/reviews', payload);
        return res.data;
    },

    /** Cập nhật đánh giá đã có */
    updateReview: async (reviewId: number, payload: Partial<ReviewRequest>): Promise<ReviewResponse> => {
        const res = await axiosInstance.put(`/reviews/${reviewId}`, payload);
        return res.data;
    },

    /** Lấy toàn bộ review của sản phẩm (public) */
    getByProduct: async (productId: number, page = 0, size = 10) => {
        const res = await axiosInstance.get(`/reviews/product/${productId}`, { params: { page, size } });
        return res.data;
    },

    /** Lấy review của chính user trong đơn hàng */
    getMyReview: async (productId: number, orderId: number): Promise<ReviewResponse | null> => {
        try {
            const res = await axiosInstance.get(`/reviews/my`, { params: { productId, orderId } });
            return res.data;
        } catch {
            return null;
        }
    },
};