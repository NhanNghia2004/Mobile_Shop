import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// SỬA: Thay "../../" bằng "../"
import { favoritesApi, dispatchFavoriteChange, onFavoriteChange, favoriteManager } from "../api/favoritesApi";

interface WishlistButtonProps {
    productId: number;
    /** Style: 'icon' = nút tròn icon (dùng trong card), 'full' = nút đầy đủ trong ProductDetail */
    variant?: 'icon' | 'full';
    initialWished?: boolean;
    className?: string;
}

export default function WishlistButton({
                                           productId,
                                           variant = 'icon',
                                           initialWished,
                                           className = '',
                                       }: WishlistButtonProps) {
    const [wished, setWished] = useState(initialWished || false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (initialWished === undefined) {
            favoriteManager.getFavoriteIds().then(ids => {
                if (ids.has(productId)) {
                    setWished(true);
                }
            });
        } else {
            setWished(initialWished);
        }
    }, [productId, initialWished]);

    // Đồng bộ khi component khác thay đổi cùng productId
    useEffect(() => {
        return onFavoriteChange((id, w) => {
            if (id === productId) setWished(w);
        });
    }, [productId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        setLoading(true);
        try {
            const next = await favoritesApi.toggle(productId, wished);
            setWished(next);
            dispatchFavoriteChange(productId, next);
        } catch {
            // Giữ nguyên state nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'full') {
        return (
            <button
                onClick={handleToggle}
                disabled={loading}
                title={wished ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                className={`p-3.5 rounded-2xl border-2 transition-all disabled:opacity-60 ${
                    wished
                        ? 'border-red-300 bg-red-50 hover:bg-red-100'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                } ${className}`}
            >
                {loading ? (
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                ) : (
                    <Heart
                        size={20}
                        fill={wished ? '#EF4444' : 'none'}
                        className={wished ? 'text-red-500' : 'text-gray-400'}
                    />
                )}
            </button>
        );
    }

    // variant === 'icon' (dùng trong card)
    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={wished ? 'Bỏ yêu thích' : 'Yêu thích'}
            className={`p-2 bg-white/90 rounded-full shadow transition-all hover:scale-110 border border-gray-100 ${
                wished ? 'border-red-200 bg-red-50' : ''
            } ${className}`}
        >
            {loading ? (
                <Loader2 size={14} className="animate-spin text-gray-400" />
            ) : (
                <Heart
                    size={16}
                    fill={wished ? '#EF4444' : 'none'}
                    className={wished ? 'text-red-500' : 'text-gray-400'}
                />
            )}
        </button>
    );
}