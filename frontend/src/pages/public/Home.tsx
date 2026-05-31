import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import type { ProductResponse } from '../../types/product';

export default function Home() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Lấy tất cả sản phẩm nổi bật
                const data = await productApi.getProducts({ size: 100 });
                setProducts(data.content);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen font-sans">

            {/* 1. Hero Section */}
            <section className="relative bg-indigo-900 h-[500px] flex items-center overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1556656793-062ff987c260?q=80&w=1470&auto=format&fit=crop"
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-xl text-white"
                    >
                        <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Sự kiện năm 2024</span>
                        <h1 className="text-5xl md:text-6xl font-black mt-4 leading-tight">Nâng cấp trải nghiệm số.</h1>
                        <p className="text-lg text-white/80 mt-4">Sở hữu ngay những siêu phẩm công nghệ hàng đầu thế giới với mức giá cực kỳ ưu đãi.</p>
                        <div className="mt-8 flex gap-4">
                            <button className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2">
                                Mua ngay <ChevronRight size={18} />
                            </button>
                            <button className="border border-white/30 backdrop-blur-md text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
                                Xem video
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Featured Categories (Brands) */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Apple', 'Samsung', 'Oppo', 'Xiaomi'].map((brand) => (
                        <Link to={`/products?brand=${brand}`} key={brand} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-all cursor-pointer group">
                            <div className="w-16 h-16 bg-gray-50 rounded-full mb-3 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <img src={`https://ui-avatars.com/api/?name=${brand}&background=random`} alt={brand} className="w-10 h-10 rounded-full opacity-70" />
                            </div>
                            <span className="font-bold text-gray-800">{brand}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 3. Product List Section */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Sản phẩm nổi bật</h2>
                        <div className="h-1.5 w-20 bg-indigo-600 mt-2 rounded-full"></div>
                    </div>
                    <Link to="/products" className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                        Xem tất cả <ArrowRight size={18} />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col"
                            >
                                <Link to={`/product/${product.id}`} className="flex-1">
                                    <div className="relative h-64 overflow-hidden bg-gray-100">
                                        <img 
                                            src={product.imageUrl || 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=500&auto=format&fit=crop'} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                        />
                                        {/* Hiển thị tag New nếu là sản phẩm mới, ở đây mockup dùng text "Hot" */}
                                        <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                            Hot
                                        </span>
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
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}