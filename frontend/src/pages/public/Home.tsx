import { motion } from 'framer-motion';
import { ChevronRight, Star, ShoppingCart, ArrowRight } from 'lucide-react';

const PRODUCTS = [
    { id: 1, name: 'iPhone 15 Pro Max', price: '29.990.000đ', image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=500&auto=format&fit=crop', tag: 'Hot' },
    { id: 2, name: 'Samsung Galaxy S24 Ultra', price: '26.490.000đ', image: 'https://images.unsplash.com/photo-1707231456903-88cc63493774?q=80&w=500&auto=format&fit=crop', tag: 'Sale' },
    { id: 3, name: 'Google Pixel 8 Pro', price: '18.500.000đ', image: 'https://images.unsplash.com/photo-1697520023027-3199859f518e?q=80&w=500&auto=format&fit=crop', tag: 'Mới' },
    { id: 4, name: 'Xiaomi 14 Ultra', price: '21.990.000đ', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=500&auto=format&fit=crop', tag: 'Hot' },
];

export default function Home() {
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

            {/* 2. Featured Categories */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['iPhone', 'Samsung', 'Oppo', 'Phụ kiện'].map((item) => (
                        <div key={item} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-all cursor-pointer group">
                            <div className="w-16 h-16 bg-gray-50 rounded-full mb-3 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <img src={`https://ui-avatars.com/api/?name=${item}&background=random`} alt={item} className="w-10 h-10 rounded-full opacity-70" />
                            </div>
                            <span className="font-bold text-gray-800">{item}</span>
                        </div>
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
                    <a href="#" className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                        Xem tất cả <ArrowRight size={18} />
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRODUCTS.map((product) => (
                        <motion.div
                            key={product.id}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
                        >
                            <div className="relative h-64 overflow-hidden bg-gray-100">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                    {product.tag}
                                </span>
                            </div>
                            <div className="p-5">
                                <div className="flex text-yellow-400 mb-2">
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                <p className="text-indigo-600 font-black text-lg">{product.price}</p>

                                <button className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                                    <ShoppingCart size={18} /> Thêm vào giỏ
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

        </div>
    );
}