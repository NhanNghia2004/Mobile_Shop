import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { productApi } from '../../api/productApi';
import type { ProductResponse } from '../../types/product';
import WishlistButton from '../../components/WishlistButton';

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const brand = searchParams.get('brand') || '';
    const keyword = searchParams.get('keyword') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 12; // 12 products per page

    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Pass page, size, and optionally brand to the API
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
            const newParams: Record<string, string> = { page: newPage.toString() };
            if (brand) newParams.brand = brand;
            if (keyword) newParams.keyword = keyword;
            if (minPrice) newParams.minPrice = minPrice;
            if (maxPrice) newParams.maxPrice = maxPrice;
            setSearchParams(newParams);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-8">
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
                    <div className="text-center py-20 text-gray-500">
                        Không tìm thấy sản phẩm nào.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col hover:-translate-y-2 transition-transform duration-300"
                                >
                                    <Link to={`/product/${product.id}`} className="flex-1">
                                        <div className="relative h-64 overflow-hidden bg-gray-100">
                                            <img 
                                                src={product.imageUrl || 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=500&auto=format&fit=crop'} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                            />
                                            {product.minPrice !== product.maxPrice && (
                                                <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                                    Nhiều phiên bản
                                                </span>
                                            )}
                                            <div className="absolute bottom-3 right-3">
                                                <WishlistButton productId={product.id} variant="icon" />
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="flex text-yellow-400 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < (product.rating || 5) ? "currentColor" : "none"} className={i >= (product.rating || 5) ? "text-gray-300" : ""} />
                                                ))}
                                                <span className="text-gray-400 text-xs ml-1">({product.reviewCount || 0})</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{product.name}</h3>
                                            <p className="text-indigo-600 font-black text-lg mt-auto">
                                                {product.minPrice && product.minPrice > 0 
                                                    ? `${product.minPrice.toLocaleString('vi-VN')}đ` 
                                                    : 'Đang cập nhật'}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="p-5 pt-0 mt-auto">
                                        <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                                            <ShoppingCart size={18} /> Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12 gap-2">
                                <button 
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 0}
                                    className={`px-4 py-2 rounded-lg font-bold ${page === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}
                                >
                                    Trước
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center ${page === i ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages - 1}
                                    className={`px-4 py-2 rounded-lg font-bold ${page === totalPages - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
