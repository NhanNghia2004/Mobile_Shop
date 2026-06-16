import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Star, ShoppingCart, ArrowRight, Search,
    TrendingUp, Sparkles, Tag, X, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import type { ProductResponse } from '../../types/product';
import WishlistButton from '../../components/WishlistButton'; // Thêm dòng import này

const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const StarRow = ({ rating, count }: { rating: number; count: number }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                size={13}
                fill={i <= Math.round(rating) ? '#FBBF24' : 'none'}
                className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}
            />
        ))}
        <span className="text-gray-400 text-xs ml-1">({count})</span>
    </div>
);

function ProductCard({ product, badge }: { product: ProductResponse; badge?: string }) {
    const navigate = useNavigate();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const defaultVariant = product.variants?.find(v => v.status === 'ACTIVE' && v.stockQuantity > 0);
        if (!defaultVariant) return;
        try {
            await axiosInstance.post('/cart/add', { variantId: defaultVariant.id, quantity: 1 });
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể thêm vào giỏ');
        }
    };

    const img = product.imageUrl ||
        product.variants?.[0]?.images?.[0] ||
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop';

    const maxDiscount = product.variants?.length
        ? Math.max(...product.variants.filter(v => v.discountPercent).map(v => v.discountPercent || 0))
        : 0;

    return (
        <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col group"
        >
            <Link to={`/product/${product.id}`} className="flex-1 flex flex-col">
                <div className="relative h-52 overflow-hidden bg-gray-50">
                    <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop'; }}
                    />
                    {badge && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            {badge}
                        </span>
                    )}
                    {maxDiscount > 0 && (
                        <span className="absolute top-3 right-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            -{maxDiscount}%
                        </span>
                    )}

                    {/* Nút Wishlist mới thay thế cho button cũ ở đây */}
                    <div className="absolute bottom-3 right-3">
                        <WishlistButton productId={product.id} variant="icon" />
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <span className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mb-1">{product.brand}</span>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </h3>
                    <StarRow rating={product.rating || 0} count={product.reviewCount || 0} />
                    <div className="mt-auto pt-3">
                        {product.minPrice !== product.maxPrice ? (
                            <p className="text-indigo-700 font-bold text-base">
                                {fmtPrice(product.minPrice)}
                                <span className="text-gray-400 font-normal text-sm"> – {fmtPrice(product.maxPrice)}</span>
                            </p>
                        ) : (
                            <p className="text-indigo-700 font-bold text-base">{fmtPrice(product.minPrice || 0)}</p>
                        )}
                        {!product.inStock && (
                            <span className="text-xs text-red-500 font-semibold">Hết hàng</span>
                        )}
                    </div>
                </div>
            </Link>
            <div className="px-4 pb-4">
                <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                        product.inStock
                            ? 'bg-gray-900 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <ShoppingCart size={16} />
                    {product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                </button>
            </div>
        </motion.div>
    );
}

function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (query.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
        setLoading(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const { data } = await axiosInstance.get('/products/search/suggestions', { params: { q: query } });
                setSuggestions(data.suggestions || []);
                setOpen(true);
            } catch { }
            finally { setLoading(false); }
        }, 300);
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/products?keyword=${encodeURIComponent(query.trim())}`);
            setOpen(false);
        }
    };

    const handleSuggestionClick = (s: any) => {
        setOpen(false);
        setQuery('');
        if (s.type === 'brand') navigate(`/products?brand=${encodeURIComponent(s.value)}`);
        else navigate(`/products?keyword=${encodeURIComponent(s.value)}`);
    };

    const typeIcon: Record<string, string> = {
        product: '📱', brand: '🏷️', storage: '💾', ram: '🧠', color: '🎨',
    };

    return (
        <div className="relative w-full max-w-xl">
            <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 200)}
                    placeholder="Tìm iPhone, Samsung, 128GB, màu đen..."
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 text-sm focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all"
                />
                {query && (
                    <button type="button" onClick={() => { setQuery(''); setOpen(false); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                        <X size={18} />
                    </button>
                )}
            </form>

            <AnimatePresence>
                {open && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute top-full mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden"
                    >
                        {loading && <div className="flex items-center justify-center py-3"><Loader2 size={16} className="animate-spin text-indigo-500" /></div>}
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => handleSuggestionClick(s)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
                                <span>{typeIcon[s.type] || '🔍'}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-gray-800 truncate">{s.label}</span>
                                </div>
                                {s.count != null && <span className="text-xs text-gray-400">{s.count} SP</span>}
                                {s.imageUrl && <img src={s.imageUrl} alt="" className="w-8 h-8 object-cover rounded-lg flex-shrink-0" />}
                            </button>
                        ))}
                        <div className="border-t border-gray-100 px-4 py-2">
                            <button onClick={() => { navigate(`/products?keyword=${encodeURIComponent(query.trim())}`); setOpen(false); }}
                                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                                <Search size={12} /> Tìm tất cả kết quả cho "{query}"
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BrandBar() {
    const [brands, setBrands] = useState<string[]>([]);

    useEffect(() => {
        axiosInstance.get('/products/brands').then(r => setBrands(r.data || [])).catch(() => {});
    }, []);

    return (
        <section className="bg-white border-y border-gray-100 py-5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Thương hiệu</span>
                    {brands.map(brand => (
                        <Link key={brand} to={`/products?brand=${brand}`}
                              className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
                            <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all overflow-hidden">
                                <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-700">{brand.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium group-hover:text-indigo-600 transition-colors">{brand}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PriceRangeBanner() {
    const [priceRange, setPriceRange] = useState<{ minPrice: number; maxPrice: number } | null>(null);

    useEffect(() => {
        axiosInstance.get('/products/price-range').then(r => setPriceRange(r.data)).catch(() => {});
    }, []);

    const ranges = [
        { label: 'Dưới 5 triệu', max: 5_000_000, icon: '💸', color: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' },
        { label: '5 – 10 triệu', min: 5_000_000, max: 10_000_000, icon: '📱', color: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100' },
        { label: '10 – 20 triệu', min: 10_000_000, max: 20_000_000, icon: '🔥', color: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100' },
        { label: 'Trên 20 triệu', min: 20_000_000, icon: '💎', color: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100' },
    ];

    return (
        <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-gray-500" />
                <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wider">Lọc theo giá</h3>
                {priceRange && (
                    <span className="text-xs text-gray-400 ml-2">
                        ({fmtPrice(priceRange.minPrice)} – {fmtPrice(priceRange.maxPrice)})
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ranges.map(r => (
                    <Link key={r.label}
                          to={`/products?${r.min ? `minPrice=${r.min}` : ''}${r.min && r.max ? '&' : ''}${r.max ? `maxPrice=${r.max}` : ''}`}
                          className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-semibold transition-all hover:scale-[1.02] ${r.color}`}>
                        <span className="text-2xl">{r.icon}</span>
                        <span>{r.label}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function DealsSection() {
    const [deals, setDeals] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/products/deals', { params: { page: 0, size: 4 } })
            .then(r => setDeals(r.data.content || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (!loading && !deals.length) return null;

    return (
        <section className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Tag size={20} className="text-orange-500" />
                        <span className="text-orange-500 font-bold text-sm uppercase tracking-wider">Flash Sale</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">Đang giảm giá</h2>
                    <div className="h-1.5 w-16 bg-orange-500 mt-2 rounded-full" />
                </div>
                <Link to="/products" className="text-orange-500 font-semibold flex items-center gap-1 hover:underline text-sm">
                    Xem tất cả <ArrowRight size={16} />
                </Link>
            </div>
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-400" size={28} /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deals.map(p => <ProductCard key={p.id} product={p} badge="Sale" />)}
                </div>
            )}
        </section>
    );
}

export default function Home() {
    const [bestsellers, setBestsellers] = useState<ProductResponse[]>([]);
    const [newArrivals, setNewArrivals] = useState<ProductResponse[]>([]);
    const [loadingBS, setLoadingBS] = useState(true);
    const [loadingNA, setLoadingNA] = useState(true);

    useEffect(() => {
        axiosInstance.get('/products/bestsellers')
            .then(r => setBestsellers(r.data || []))
            .catch(() => {})
            .finally(() => setLoadingBS(false));

        axiosInstance.get('/products/new-arrivals')
            .then(r => setNewArrivals(r.data || []))
            .catch(() => {})
            .finally(() => setLoadingNA(false));
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img src="https://images.unsplash.com/photo-1556656793-062ff987c260?q=80&w=1470&auto=format&fit=crop"
                         alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/20 rounded-full" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                                className="max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
                            <Sparkles size={12} /> Bộ sưu tập 2024
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-5">
                            Nâng cấp<br />
                            <span className="text-indigo-300">trải nghiệm số.</span>
                        </h1>
                        <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-md">
                            Siêu phẩm công nghệ với giá tốt nhất. Bảo hành chính hãng, giao hàng toàn quốc.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mb-10">
                            <Link to="/products"
                                  className="flex items-center justify-center gap-2 bg-white text-indigo-900 px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
                                Khám phá ngay <ChevronRight size={18} />
                            </Link>
                            <Link to="/products"
                                  className="flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-white/10 backdrop-blur-sm transition-all">
                                <Tag size={18} /> Xem khuyến mãi
                            </Link>
                        </div>
                        <SearchBar />
                    </motion.div>
                </div>
            </section>

            {/* Brand Bar */}
            <BrandBar />

            {/* Price Range */}
            <PriceRangeBanner />

            {/* Bestsellers */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={20} className="text-indigo-500" />
                            <span className="text-indigo-500 font-bold text-sm uppercase tracking-wider">Bán chạy nhất</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">Top bán chạy</h2>
                        <div className="h-1.5 w-16 bg-indigo-600 mt-2 rounded-full" />
                    </div>
                    <Link to="/products?sortBy=bestseller" className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline text-sm">
                        Xem tất cả <ArrowRight size={16} />
                    </Link>
                </div>
                {loadingBS ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" size={28} /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {bestsellers.slice(0, 10).map((p, i) => (
                            <ProductCard key={p.id} product={p} badge={i === 0 ? 'Hot #1' : i < 3 ? 'Top' : undefined} />
                        ))}
                    </div>
                )}
            </section>

            {/* Deals */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-y border-orange-100">
                <DealsSection />
            </div>

            {/* New Arrivals */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={20} className="text-pink-500" />
                            <span className="text-pink-500 font-bold text-sm uppercase tracking-wider">Hàng mới</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">Mới về</h2>
                        <div className="h-1.5 w-16 bg-pink-500 mt-2 rounded-full" />
                    </div>
                    <Link to="/products?sortBy=newest" className="text-pink-500 font-semibold flex items-center gap-1 hover:underline text-sm">
                        Xem tất cả <ArrowRight size={16} />
                    </Link>
                </div>
                {loadingNA ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-pink-400" size={28} /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newArrivals.slice(0, 8).map(p => (
                            <ProductCard key={p.id} product={p} badge="Mới" />
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                <div className="bg-gradient-to-r from-indigo-700 to-blue-700 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Cần tư vấn chọn máy?</h2>
                        <p className="text-white/70 text-lg">Đội ngũ chuyên gia sẵn sàng hỗ trợ 24/7</p>
                    </div>
                    <div className="relative z-10">
                        <Link to="/products"
                              className="flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
                            <ShoppingCart size={20} /> Mua ngay
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}