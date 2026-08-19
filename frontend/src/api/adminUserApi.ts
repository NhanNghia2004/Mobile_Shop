import axiosInstance from './axios';
import type { PageResponse } from '../types/product';

export interface AdminUserResponse {
    id: number;
    username: string;
    email: string;
    phone?: string;
    role: string;
    locked: boolean;
    createdAt: string;
}

export const adminUserApi = {
    getUsers: async (params?: { keyword?: string; role?: string; locked?: boolean; sortBy?: string; page?: number; size?: number }): Promise<PageResponse<AdminUserResponse>> => {
        const response = await axiosInstance.get('/admin/users', { params });
        return response.data;
    },

    getUserDetail: async (id: number | string): Promise<AdminUserResponse> => {
        const response = await axiosInstance.get(`/admin/users/${id}`);
        return response.data;
    },

    lockUser: async (id: number | string, reason: string): Promise<AdminUserResponse> => {
        const response = await axiosInstance.patch(`/admin/users/${id}/lock`, { reason });
        return response.data;
    },

    unlockUser: async (id: number | string): Promise<AdminUserResponse> => {
        const response = await axiosInstance.patch(`/admin/users/${id}/unlock`);
        return response.data;
    },

    changeRole: async (id: number | string, role: string): Promise<AdminUserResponse> => {
        const response = await axiosInstance.patch(`/admin/users/${id}/role`, { role });
        return response.data;
    },
};
