import axiosInstance from './axios';
import type { PageResponse, ProductResponse } from '../types/product';

export const productApi = {
    getProducts: async (params?: any): Promise<PageResponse<ProductResponse>> => {
        const response = await axiosInstance.get('/products', { params });
        return response.data;
    },

    getProductById: async (id: string | number): Promise<ProductResponse> => {
        const response = await axiosInstance.get(`/products/${id}`);
        return response.data;
    },

    // Optional additional endpoints
    getBestsellers: async (): Promise<ProductResponse[]> => {
        const response = await axiosInstance.get('/products/bestsellers');
        return response.data;
    },

    getNewArrivals: async (): Promise<ProductResponse[]> => {
        const response = await axiosInstance.get('/products/new-arrivals');
        return response.data;
    }
};
