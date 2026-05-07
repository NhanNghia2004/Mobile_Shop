import axios, { type AxiosInstance,type InternalAxiosRequestConfig } from 'axios';

const instance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Danh sách các API không cần đính kèm Token (Whitelisting)
const whiteList = ['/auth/login', '/auth/register', '/auth/google', '/auth/reset-password'];

instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        // KIỂM TRA: Chỉ gắn token nếu có token TRONG máy
        // VÀ URL hiện tại không nằm trong danh sách whitelist
        const isWhiteListed = whiteList.some(url => config.url?.includes(url));

        if (token && !isWhiteListed) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Chỉ xử lý 401 nếu đó KHÔNG phải là request đăng nhập
        // Vì nếu đăng nhập sai, server trả về 401 là đúng, không nên xóa sạch storage lúc đó
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Chỉ redirect nếu người dùng đang không ở trang login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;