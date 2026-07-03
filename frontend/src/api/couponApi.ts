import api from './axios';

export interface CouponResponse {
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
}

export const couponApi = {
    validate: async (code: string, total: number): Promise<CouponResponse> => {
        const res = await api.get('/coupons/validate', {
            params: { code, total }
        });
        return res.data;
    }
};
