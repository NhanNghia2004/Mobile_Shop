import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Filter, ChevronRight, X, GitCompare } from 'lucide-react';
import { productApi } from '../../api/productApi';
import axiosInstance from '../../api/axios';
import type { ProductResponse } from '../../types/product';
import WishlistButton from '../../components/WishlistButton';
import { useCompare } from '../../hooks/useCompare';

const PRICE_RANGES = [
    { label: 'Tất cả', min: null, max: null },
    { label: 'Dưới 5 triệu', min: null, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: 'Trên 20 triệu', min: 20000000, max: null },
];

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCompare, isInCompareList } = useCompare();
    const brand = searchParams.get('brand') || '';
    const keyword = searchParams.get('keyword') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 12;

    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    
    // States for Filter Sidebar
    const [brands, setBrands] = useState<string[]>([]);
    const [customMinPrice, setCustomMinPrice] = useState(minPrice || '');
    const [customMaxPrice, setCustomMaxPrice] = useState(maxPrice || '');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        axiosInstance.get('/products/brands').then(r => setBrands(r.data || [])).catch(() => {});
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params: any = { page, size };
                if (brand) params.brand = brand;
                if (keyword) params.keyword = keyword;
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;
                const data = await productApi.getProducts(params);
                setProducts(data.content);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, brand, keyword, minPrice, maxPrice]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            updateFilters({ page: newPage.toString() });
            window.scrollTo(0, 0);
        }
    };

    const updateFilters = (newParams: Record<string, string | null>) => {
        const current = Object.fromEntries(searchParams.entries());
        
        // Reset page when filters change
        if (!newParams.page) {
            delete current.page;
        }

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null) {
                delete current[key];
            } else {
                current[key] = value;
            }
        });

        setSearchParams(current);
    };

    const applyCustomPrice = () => {
        updateFilters({ 
            minPrice: customMinPrice || null, 
            maxPrice: customMaxPrice || null 
        });
    };

    const clearFilters = () => {
        setSearchParams({});
        setCustomMinPrice('');
        setCustomMaxPrice('');
    };

    const handleAddToCart = async (e: React.MouseEvent, product: ProductResponse) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const defaultVariant = product.variants?.find(v => v.status === 'ACTIVE' && v.stockQuantity > 0);
        if (!defaultVariant) {
            alert('Sản phẩm hiện đang hết hàng');
            return;
        }
        try {
            await axiosInstance.post('/cart/add', { variantId: defaultVariant.id, quantity: 1 });
            window.dispatchEvent(new Event('cartUpdated'));
            alert(`Đã thêm ${product.name} vào giỏ!`);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể thêm vào giỏ');
        }
    };

    const FilterSidebar = () => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Filter size={20} />
                    Bộ lọc
                </h2>
                {(brand || minPrice || maxPrice || keyword) && (
                    <button 
                        onClick={clearFilters}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                        Xoá lọc
                    </button>
                )}
            </div>

            {/* Keyword Filter Indicator */}
            {keyword && (
                <div className="mb-6">
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">Từ khoá</h3>
                    <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                        {keyword}
                        <button onClick={() => updateFilters({ keyword: null })}><X size={14} /></button>
                    </div>
                </div>
            )}

            {/* Brand Filter */}
            <div className="mb-6 border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-sm text-gray-900 mb-4">Thương hiệu</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => updateFilters({ brand: null })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!brand ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Tất cả thương hiệu
                    </button>
                    {brands.map(b => (
                        <button
                            key={b}
                            onClick={() => updateFilters({ brand: b })}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${brand === b ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {b}
                            {brand === b && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Ranges Filter */}
            <div className="mb-6 border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-sm text-gray-900 mb-4">Mức giá</h3>
                <div className="space-y-2">
                    {PRICE_RANGES.map(range => {
                        const isActive = 
                            (range.min === null ? !minPrice : minPrice === range.min.toString()) &&
                            (range.max === null ? !maxPrice : maxPrice === range.max.toString());
                        
                        return (
                            <button
                                key={range.label}
                                onClick={() => updateFilters({ 
                                    minPrice: range.min ? range.min.toString() : null, 
                                    maxPrice: range.max ? range.max.toString() : null 
                                })}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${isActive && (!customMinPrice || PRICE_RANGES.some(r => r.min?.toString() === customMinPrice)) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {range.label}
                                {isActive && <ChevronRight size={16} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Price Filter */}
            <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-4">Khoảng giá tuỳ chỉnh</h3>
                <div className="flex items-center gap-2 mb-3">
                    <input 
                        type="number" 
                        placeholder="Từ (đ)" 
                        value={customMinPrice}
                        onChange={(e) => setCustomMinPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="number" 
                        placeholder="Đến (đ)" 
                        value={customMaxPrice}
                        onChange={(e) => setCustomMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <button 
                    onClick={applyCustomPrice}
                    className="w-full bg-gray-900 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                    Áp dụng
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8">
                
                {/* Mobile Filter Toggle */}
                <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-xl font-black text-gray-900">
                        {keyword ? 'Kết quả tìm kiếm' : 'Sản phẩm'}
                    </h1>
                    <button 
                        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold"
                    >
                        <Filter size={18} />
                        Lọc
                    </button>
                </div>

                {/* Sidebar (Desktop & Mobile Conditional) */}
                <div className={`w-full md:w-72 flex-shrink-0 ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`}>
                    <FilterSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="hidden md:block mb-8">
                        <h1 className="text-3xl font-black text-gray-900">
                            {keyword ? `Kết quả tìm kiếm cho "${keyword}"` : brand ? `Điện thoại ${brand}` : minPrice || maxPrice ? 'Kết quả lọc giá' : 'Tất cả Sản phẩm'}
                        </h1>
                        <div className="h-1.5 w-20 bg-indigo-600 mt-2 rounded-full"></div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
                            <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khoá khác.</p>
                            <button 
                                onClick={clearFilters}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Xoá bộ lọc
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col hover:-translate-y-1 transition-transform duration-300"
                                    >
                                        <Link to={`/product/${product.id}`} className="flex-1">
                                            <div className="relative h-48 md:h-56 overflow-hidden bg-gray-50">
                                                <img 
                                                    src={product.imageUrl || 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=500&auto=format&fit=crop'} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                />
                                                {product.minPrice !== product.maxPrice && (
                                                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                                        Nhiều phiên bản
                                                    </span>
                                                )}
                                                <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                                                    <WishlistButton productId={product.id} variant="icon" />
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const res = addToCompare({
                                                                id: product.id,
                                                                name: product.name,
                                                                imageUrl: product.imageUrl,
                                                                price: product.minPrice
                                                            });
                                                            if (!res.success) alert(res.message);
                                                        }}
                                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${isInCompareList(product.id) ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'bg-white/80 backdrop-blur text-gray-500 hover:text-indigo-600 hover:bg-white shadow-sm'}`}
                                                        title={isInCompareList(product.id) ? "Đã thêm vào so sánh" : "Thêm vào so sánh"}
                                                    >
                                                        <GitCompare size={16} className="md:w-5 md:h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex text-yellow-400 mb-1.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < (product.rating || 5) ? "currentColor" : "none"} className={i >= (product.rating || 5) ? "text-gray-300" : ""} />
                                                    ))}
                                                    <span className="text-gray-400 text-[10px] md:text-xs ml-1">({product.reviewCount || 0})</span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{product.name}</h3>
                                                <p className="text-indigo-600 font-black text-base md:text-lg mt-auto pt-2">
                                                    {product.minPrice && product.minPrice > 0 
                                                        ? `${product.minPrice.toLocaleString('vi-VN')}đ` 
                                                        : 'Đang cập nhật'}
                                                </p>
                                            </div>
                                        </Link>
                                        <div className="p-4 pt-0 mt-auto">
                                            <button 
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                                            >
                                                <ShoppingCart size={16} /> Thêm vào giỏ
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Phân trang */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-10 md:mt-12 gap-1.5 md:gap-2">
                                    <button 
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 0}
                                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-sm ${page === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        Trước
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg font-bold text-sm flex items-center justify-center ${page === i ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages - 1}
                                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-sm ${page === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
