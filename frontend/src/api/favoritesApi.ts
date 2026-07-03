import axiosInstance from './axios';

export interface FavoriteProduct {
    id: number;
    productId: number;
    productName: string;
    brand: string;
    imageUrl: string;
    price: number;
    rating: number;
    reviewCount: number;
}

export interface FavoritesPageResponse {
    content: FavoriteProduct[];
    totalElements: number;
    totalPages: number;
    page: number;
    last: boolean;
}

export const favoritesApi = {
    getFavorites: async (page = 0, size = 12): Promise<FavoritesPageResponse> => {
        const res = await axiosInstance.get('/favorites', { params: { page, size } });
        return res.data;
    },

    addFavorite: async (productId: number): Promise<void> => {
        await axiosInstance.post(`/favorites/${productId}`);
        favoriteManager.addFavoriteId(productId);
    },

    removeFavorite: async (productId: number): Promise<void> => {
        await axiosInstance.delete(`/favorites/${productId}`);
        favoriteManager.removeFavoriteId(productId);
    },

    // Toggle + trả về trạng thái mới
    toggle: async (productId: number, currentWished: boolean): Promise<boolean> => {
        if (currentWished) {
            await axiosInstance.delete(`/favorites/${productId}`);
            favoriteManager.removeFavoriteId(productId);
            return false;
        } else {
            await axiosInstance.post(`/favorites/${productId}`);
            favoriteManager.addFavoriteId(productId);
            return true;
        }
    },
};

let cachedFavoriteIds: Set<number> | null = null;
let fetchPromise: Promise<Set<number>> | null = null;

export const favoriteManager = {
    getFavoriteIds: async (): Promise<Set<number>> => {
        if (cachedFavoriteIds) return cachedFavoriteIds;
        if (fetchPromise) return fetchPromise;
        const token = localStorage.getItem('token');
        if (!token) return new Set();

        fetchPromise = axiosInstance.get('/favorites/ids').then(res => {
            cachedFavoriteIds = new Set(res.data);
            return cachedFavoriteIds;
        }).catch(() => {
            return new Set<number>();
        });
        return fetchPromise;
    },
    addFavoriteId: (id: number) => {
        if (cachedFavoriteIds) cachedFavoriteIds.add(id);
    },
    removeFavoriteId: (id: number) => {
        if (cachedFavoriteIds) cachedFavoriteIds.delete(id);
    },
    clearCache: () => {
        cachedFavoriteIds = null;
        fetchPromise = null;
    }
};

// Global event để đồng bộ trạng thái tim giữa các component
export const dispatchFavoriteChange = (productId: number, wished: boolean) => {
    window.dispatchEvent(new CustomEvent('favoriteChanged', { detail: { productId, wished } }));
};

export const onFavoriteChange = (
    handler: (productId: number, wished: boolean) => void
) => {
    const listener = (e: Event) => {
        const { productId, wished } = (e as CustomEvent).detail;
        handler(productId, wished);
    };
    window.addEventListener('favoriteChanged', listener);
    return () => window.removeEventListener('favoriteChanged', listener);
};