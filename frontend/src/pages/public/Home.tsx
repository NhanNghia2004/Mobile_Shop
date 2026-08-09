import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Star, ShoppingCart, ArrowRight,
    TrendingUp, Sparkles, Timer, Zap, Smartphone, Phone, CreditCard, ShieldCheck,
    Wallet, RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import type { ProductResponse } from '../../types/product';
import WishlistButton from '../../components/WishlistButton';

const fmtPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const StarRow = ({ rating, count }: { rating: number; count: number }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                size={12}
                fill={i <= Math.round(rating) ? '#FBBF24' : 'none'}
                className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}
            />
        ))}
        <span className="text-gray-400 text-[10px] ml-1">({count})</span>
    </div>
);

function ProductCard({ product, badge }: { product: ProductResponse; badge?: string }) {
    const navigate = useNavigate();
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const defaultVariant = product.variants?.find(v => v.status === 'ACTIVE' && v.stockQuantity > 0);
        if (!defaultVariant) {
            alert('Sản phẩm tạm thời hết hàng hoặc không có phiên bản khả dụng');
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.post('/cart/add', { variantId: defaultVariant.id, quantity: 1 });
            window.dispatchEvent(new Event('cartUpdated'));
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể thêm vào giỏ');
        } finally {
            setLoading(false);
        }
    };

    const img = product.imageUrl ||
        product.variants?.[0]?.images?.[0] ||
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop';

    const maxDiscount = product.variants?.length
        ? Math.max(...product.variants.filter(v => v.discountPercent).map(v => v.discountPercent || 0))
        : 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <Link to={`/product/${product.id}`} className="flex flex-col relative">
                <div className="relative h-48 md:h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                    <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop'; }}
                    />
                    {badge && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10 shadow-sm">
                            {badge}
                        </span>
                    )}
                    {maxDiscount > 0 && (
                        <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                            -{maxDiscount}%
                        </span>
                    )}

                    <div className="absolute bottom-2 right-2 z-10" onClick={e => e.stopPropagation()}>
                        <WishlistButton productId={product.id} variant="icon" />
                    </div>
                </div>
                <div className="p-4 pb-0 flex flex-col">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1">{product.brand}</span>
                    <h3 className="font-semibold text-gray-800 text-sm md:text-sm mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors h-10">
                        {product.name}
                    </h3>
                    <StarRow rating={product.rating || 0} count={product.reviewCount || 0} />
                </div>
            </Link>

            <div className="p-4 pt-3 mt-auto">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-red-600 font-black text-sm md:text-base truncate">{fmtPrice(product.minPrice || 0)}</p>
                        {!product.inStock && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">Hết hàng</span>
                        )}
                    </div>
                    {product.inStock && (
                        <button
                            onClick={handleAddToCart}
                            disabled={loading}
                            className={`w-9 h-9 rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center flex-shrink-0 group/btn ${
                                added 
                                ? 'bg-green-500 text-white shadow-green-100 hover:bg-green-600' 
                                : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white'
                            }`}
                            title="Thêm vào giỏ hàng"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            ) : added ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            ) : (
                                <ShoppingCart size={16} className="transition-transform group-hover/btn:scale-110" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const BANNERS = [
    { id: 1, img: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1600&auto=format&fit=crop", title: "Lễ Hội Trái Táo - Giảm Tới 30%" },
    { id: 2, img: "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?q=80&w=1600&auto=format&fit=crop", title: "Tuần Lễ Vàng Samsung" },
    { id: 3, img: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1600&auto=format&fit=crop", title: "Phụ Kiện Điện Thoại Siêu Rẻ" },
];

function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % BANNERS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[180px] md:h-[350px] lg:h-[400px] rounded-3xl overflow-hidden group shadow-lg">
            <AnimatePresence initial={false}>
                <motion.img 
                    key={current}
                    src={BANNERS[current].img}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-white z-10 max-w-lg">
                <span className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3">
                    Khuyến mãi Hot
                </span>
                <h2 className="font-black text-2xl md:text-4xl lg:text-5xl drop-shadow-md mb-2 leading-tight">
                    {BANNERS[current].title}
                </h2>
                <Link to="/products" className="inline-flex items-center gap-1 text-sm font-bold mt-2 hover:text-indigo-300 transition-colors">
                    Mua ngay <ArrowRight size={16} />
                </Link>
            </div>
            
            {/* Nav buttons */}
            <button 
                onClick={() => setCurrent(prev => (prev - 1 + BANNERS.length) % BANNERS.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 hover:scale-110"
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={() => setCurrent(prev => (prev + 1) % BANNERS.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 hover:scale-110"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {BANNERS.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 md:h-2 rounded-full transition-all cursor-pointer ${i === current ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                        onClick={() => setCurrent(i)}
                    />
                ))}
            </div>
        </div>
    );
}



function FlashSale() {
    const [deals, setDeals] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/products/deals', { params: { page: 0, size: 6 } })
            .then(r => setDeals(r.data.content || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (!loading && !deals.length) return null;

    return (
        <div className="mt-10 md:mt-14 bg-gradient-to-r from-red-600 via-orange-600 to-red-500 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <Zap size={32} className="text-yellow-300 fill-yellow-300 animate-pulse" />
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-wider drop-shadow-md">GIỜ VÀNG DEAL SỐC</h2>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/90 text-sm font-semibold">Kết thúc trong:</span>
                        <div className="flex gap-1.5 text-red-600 font-black text-sm">
                            <span className="bg-white px-2 py-1 rounded shadow-inner">02</span>
                            <span className="text-white">:</span>
                            <span className="bg-white px-2 py-1 rounded shadow-inner">45</span>
                            <span className="text-white">:</span>
                            <span className="bg-white px-2 py-1 rounded shadow-inner">30</span>
                        </div>
                    </div>
                </div>
                <Link to="/products" className="text-white font-bold flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-full transition-all w-fit">
                    Xem tất cả <ChevronRight size={16} />
                </Link>
            </div>
            
            {/* Horizontal Scroll for Deals */}
            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
            ) : (
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
                    {deals.map(p => (
                        <div key={p.id} className="min-w-[160px] w-[160px] md:min-w-[220px] md:w-[220px] snap-start flex-shrink-0">
                            <ProductCard product={p} badge="F.Sale" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function FeaturesSection() {
    const features = [
        { icon: <ShieldCheck size={32} />, title: 'Bảo hành chính hãng', desc: '1 đổi 1 trong 30 ngày' },
        { icon: <Phone size={32} />, title: 'Hỗ trợ 24/7', desc: 'Hotline 1800.xxx.xxx' },
        { icon: <CreditCard size={32} />, title: 'Thanh toán đa dạng', desc: 'Ví điện tử, Thẻ tín dụng' },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 md:mt-14">
            {features.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        {f.icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">{f.title}</h4>
                        <p className="text-gray-500 text-xs md:text-sm mt-0.5">{f.desc}</p>
                    </div>
                </div>
            ))}
        </div>
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
        <div className="bg-gray-50 min-h-screen pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Hero Banner */}
                <HeroCarousel />



                {/* Flash Sale */}
                <FlashSale />

                {/* Features (Trust Indicators) */}
                <FeaturesSection />

                {/* Bestsellers */}
                <section className="mt-14 md:mt-20">
                    <div className="flex justify-between items-end mb-6 md:mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={22} className="text-indigo-600" />
                                <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">Bán chạy nhất</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Sản Phẩm Yêu Thích</h2>
                        </div>
                        <Link to="/products?sortBy=bestseller" className="hidden md:flex text-indigo-600 font-bold items-center gap-1 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors text-sm">
                            Xem tất cả <ChevronRight size={16} />
                        </Link>
                    </div>
                    {loadingBS ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
                            {bestsellers.slice(0, 10).map((p, i) => (
                                <ProductCard key={p.id} product={p} badge={i < 3 ? 'Top ' + (i+1) : undefined} />
                            ))}
                        </div>
                    )}
                    <Link to="/products?sortBy=bestseller" className="md:hidden mt-4 text-indigo-600 font-bold flex items-center justify-center gap-1 bg-white border border-indigo-100 py-3 rounded-xl shadow-sm text-sm">
                        Xem tất cả <ChevronRight size={16} />
                    </Link>
                </section>

                {/* Banner Middle */}
                <div className="mt-14 md:mt-20 relative rounded-3xl overflow-hidden shadow-lg h-[150px] md:h-[250px] group">
                    <img src="https://images.unsplash.com/photo-1556656793-062ff987c260?q=80&w=1600&auto=format&fit=crop" alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-transparent flex flex-col justify-center px-8 md:px-16">
                        <h3 className="text-white font-black text-xl md:text-3xl mb-2">Thu cũ đổi mới</h3>
                        <p className="text-indigo-200 text-sm md:text-base max-w-sm mb-4">Trợ giá lên đến 2 triệu đồng khi lên đời các dòng flagship.</p>
                        <Link to="/products" className="bg-white text-indigo-900 font-bold px-6 py-2.5 rounded-full w-fit hover:bg-indigo-50 transition-colors text-sm">Tìm hiểu ngay</Link>
                    </div>
                </div>

                {/* New Arrivals */}
                <section className="mt-14 md:mt-20">
                    <div className="flex justify-between items-end mb-6 md:mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={22} className="text-pink-500" />
                                <span className="text-pink-500 font-black text-sm uppercase tracking-widest">Hàng mới về</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Khám Phá Công Nghệ</h2>
                        </div>
                        <Link to="/products?sortBy=newest" className="hidden md:flex text-pink-500 font-bold items-center gap-1 hover:bg-pink-50 px-4 py-2 rounded-xl transition-colors text-sm">
                            Xem tất cả <ChevronRight size={16} />
                        </Link>
                    </div>
                    {loadingNA ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                            {newArrivals.slice(0, 8).map(p => (
                                <ProductCard key={p.id} product={p} badge="Mới" />
                            ))}
                        </div>
                    )}
                    <Link to="/products?sortBy=newest" className="md:hidden mt-4 text-pink-500 font-bold flex items-center justify-center gap-1 bg-white border border-pink-100 py-3 rounded-xl shadow-sm text-sm">
                        Xem tất cả <ChevronRight size={16} />
                    </Link>
                </section>
            </div>
        </div>
    );
}