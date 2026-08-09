import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, User, Clock, ArrowRight, BookOpen, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Article {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishDate: string;
    readTime: string;
    imageUrl: string;
    category: 'tech' | 'review' | 'tips';
    categoryLabel: string;
    featured?: boolean;
}

const ARTICLES_DATA: Article[] = [
    {
        id: '1',
        title: 'Đánh Giá Chi Tiết iPhone 15 Pro Max: Bản Nâng Cấp Đáng Giá Với Khung Titan Siêu Bền',
        excerpt: 'iPhone 15 Pro Max năm nay mang đến bước đột phá lớn về chất liệu titan hàng không vũ trụ, nút Action Button thông minh cùng camera zoom quang học 5x cực đỉnh.',
        content: '',
        author: 'Nguyễn Văn Minh',
        publishDate: '2026-08-05',
        readTime: '6 phút đọc',
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
        category: 'review',
        categoryLabel: 'Đánh Giá Sản Phẩm',
        featured: true
    },
    {
        id: '2',
        title: 'Rò Rỉ Thiết Kế Samsung Galaxy S25: Viền Màn Hình Siêu Mỏng, Camera Cải Tiến Lớn',
        excerpt: 'Các nguồn tin công nghệ uy tín vừa hé lộ những hình ảnh render đầu tiên của Galaxy S25 Series, hứa hẹn mang đến cuộc cách mạng lớn về mặt thiết kế.',
        content: '',
        author: 'Trần Thị Thảo',
        publishDate: '2026-08-08',
        readTime: '4 phút đọc',
        imageUrl: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?q=80&w=600&auto=format&fit=crop',
        category: 'tech',
        categoryLabel: 'Tin Công Nghệ'
    },
    {
        id: '3',
        title: '5 Mẹo Giúp Kéo Dài Tuổi Thọ Pin Trên Hệ Điều Hành iOS 18 Bạn Cần Biết Ngay',
        excerpt: 'Bản cập nhật iOS 18 mang lại nhiều tính năng mới nhưng cũng khiến pin điện thoại hao nhanh hơn. Áp dụng ngay 5 mẹo nhỏ này để cải thiện tình trạng trên.',
        content: '',
        author: 'Lê Hoàng Nam',
        publishDate: '2026-08-07',
        readTime: '3 phút đọc',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
        category: 'tips',
        categoryLabel: 'Thủ Thuật & Mẹo Vặt'
    },
    {
        id: '4',
        title: 'So Sánh Camera Xiaomi 14 Ultra Và iPhone 15 Pro Max: Đâu Là Vua Nhiếp Ảnh Di Động?',
        excerpt: 'Một cuộc đọ sức nảy lửa giữa hai flagship hàng đầu thế giới hiện nay về khả năng chụp ảnh thiếu sáng, zoom xa và độ chân thực của màu sắc.',
        content: '',
        author: 'Phạm Thanh Sơn',
        publishDate: '2026-08-04',
        readTime: '8 phút đọc',
        imageUrl: 'https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?q=80&w=600&auto=format&fit=crop',
        category: 'review',
        categoryLabel: 'Đánh Giá Sản Phẩm'
    },
    {
        id: '5',
        title: 'Trí Tuệ Nhân Tạo AI Trên Điện Thoại Sẽ Thay Đổi Cuộc Sống Của Chúng Ta Như Thế Nào?',
        excerpt: 'Từ Apple Intelligence đến Galaxy AI, trí tuệ nhân tạo đang trở thành tính năng cốt lõi giúp tối ưu hóa công việc và cá nhân hóa trải nghiệm người dùng.',
        content: '',
        author: 'Hoàng Quốc Bảo',
        publishDate: '2026-08-02',
        readTime: '5 phút đọc',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
        category: 'tech',
        categoryLabel: 'Tin Công Nghệ'
    },
    {
        id: '6',
        title: 'Cách Chuyển Toàn Bộ Dữ Liệu Từ Điện Thoại Android Sang iPhone Cực Kỳ Đơn Giản',
        excerpt: 'Chuyển nhà từ Android sang iOS không còn là nỗi ác mộng nữa nhờ ứng dụng Move to iOS. Xem ngay hướng dẫn từng bước chi tiết trong bài viết này.',
        content: '',
        author: 'Nguyễn Thị Hương',
        publishDate: '2026-07-30',
        readTime: '4 phút đọc',
        imageUrl: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=600&auto=format&fit=crop',
        category: 'tips',
        categoryLabel: 'Thủ Thuật & Mẹo Vặt'
    }
];

export default function NewsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'tech' | 'review' | 'tips'>('all');

    // Filter and search logic
    const filteredArticles = ARTICLES_DATA.filter(article => {
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredArticle = ARTICLES_DATA.find(a => a.featured);

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 text-white py-16 px-6 sm:px-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10"
                    >
                        <Sparkles size={12} /> Tin Công Nghệ & Đánh Giá
                    </motion.div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                        MobiShop Blog - Góc Nhìn Công Nghệ
                    </h1>
                    <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base font-light">
                        Cập nhật nhanh nhất tin tức thị trường di động, bài viết phân tích sản phẩm chuyên sâu và mẹo sử dụng điện thoại cực hay ho hàng ngày.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto mt-8 relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white text-gray-800 placeholder-gray-400 pl-11 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md transition-all border-none"
                        />
                    </div>
                </div>
            </div>

            {/* Featured Post (Only show when no active filters/searches) */}
            {selectedCategory === 'all' && searchQuery === '' && featuredArticle && (
                <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100/50 grid grid-cols-1 lg:grid-cols-2 gap-0"
                    >
                        <div className="h-64 lg:h-full min-h-[300px] overflow-hidden bg-gray-100">
                            <img
                                src={featuredArticle.imageUrl}
                                alt={featuredArticle.title}
                                className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-8 sm:p-12 flex flex-col justify-center">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider w-fit mb-4">
                                {featuredArticle.categoryLabel}
                            </span>
                            <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight mb-4 hover:text-indigo-600 transition-colors leading-tight">
                                {featuredArticle.title}
                            </h2>
                            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6">
                                {featuredArticle.excerpt}
                            </p>
                            
                            {/* Author info */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-semibold mb-6 border-b border-gray-100 pb-6">
                                <div className="flex items-center gap-1">
                                    <User size={14} className="text-gray-300" />
                                    <span>{featuredArticle.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} className="text-gray-300" />
                                    <span>{new Date(featuredArticle.publishDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-gray-300" />
                                    <span>{featuredArticle.readTime}</span>
                                </div>
                            </div>

                            <button className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:gap-2.5 transition-all">
                                Đọc bài viết <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="max-w-7xl mx-auto px-6 mt-16">
                <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-200 pb-4">
                    {[
                        { id: 'all', label: 'Tất cả bài viết' },
                        { id: 'tech', label: 'Tin công nghệ' },
                        { id: 'review', label: 'Đánh giá sản phẩm' },
                        { id: 'tips', label: 'Thủ thuật & Mẹo vặt' }
                    ].map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id as any)}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                selectedCategory === category.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article, index) => (
                            <motion.article
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all"
                            >
                                <div className="relative h-48 overflow-hidden bg-gray-150">
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-gray-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm">
                                        {article.categoryLabel}
                                    </span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 h-12 leading-snug">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-500 text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed flex-1">
                                        {article.excerpt}
                                    </p>
                                    
                                    {/* Author & Read time */}
                                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold border-t border-gray-100 pt-4 mt-auto">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px]">
                                                {article.author.charAt(0)}
                                            </div>
                                            <span>{article.author}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-0.5"><Clock size={11} /> {article.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
                        <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy bài viết nào</h3>
                        <p className="text-sm text-gray-500">Hãy thử nhập từ khóa khác hoặc chuyển sang danh mục khác xem sao nhé!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
