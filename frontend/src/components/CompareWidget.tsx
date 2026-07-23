import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitCompare, X, Plus, Search, Loader2 } from 'lucide-react';
import { useCompare } from '../hooks/useCompare';
import { motion, AnimatePresence } from 'framer-motion';
import { productApi } from '../api/productApi';
import type { ProductResponse } from '../types/product';

const fmtPrice = (n?: number) => (n || 0).toLocaleString('vi-VN') + 'đ';

export default function CompareWidget() {
    const { compareList, removeFromCompare, clearCompare, addToCompare, MAX_COMPARE_ITEMS } = useCompare();
    const navigate = useNavigate();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<ProductResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        setPage(0);
    }, [keyword]);

    useEffect(() => {
        if (!isSearchOpen) return;
        
        const fetchSearch = async () => {
            setIsSearching(true);
            try {
                const data = await productApi.getProducts({ keyword, size: 5, page });
                if (page === 0) {
                    setSearchResults(data.content);
                } else {
                    setSearchResults(prev => [...prev, ...data.content]);
                }
                setHasMore(!data.last);
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            fetchSearch();
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword, isSearchOpen, page]);

    if (compareList.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none flex justify-center"
            >
                <div className="relative">
                    {/* Search Popup */}
                    <AnimatePresence>
                        {isSearchOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full left-0 mb-4 w-full max-w-3xl bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden flex flex-col pointer-events-auto"
                            >
                                <div className="p-3 border-b border-gray-100 relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        autoFocus
                                        placeholder="Tìm sản phẩm muốn so sánh" 
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="w-full pl-10 pr-14 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                    />
                                    {isSearching && page === 0 && (
                                        <div className="absolute right-14 top-1/2 -translate-y-1/2">
                                            <Loader2 className="animate-spin text-indigo-500" size={16} />
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setIsSearchOpen(false)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {searchResults.length === 0 && !isSearching ? (
                                        <div className="py-10 text-center text-gray-500 text-sm">Không tìm thấy sản phẩm</div>
                                    ) : searchResults.length === 0 && isSearching ? (
                                        <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>
                                    ) : (
                                        <div className={`divide-y divide-gray-50 transition-opacity duration-200 ${isSearching && page === 0 ? 'opacity-50' : 'opacity-100'}`}>
                                            {searchResults.map(p => {
                                                const inCompare = compareList.some(c => c.id === p.id);
                                                return (
                                                    <div key={p.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                                        <img src={p.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop'} className="w-14 h-14 object-contain bg-white rounded-lg border border-gray-100 p-1" />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-gray-900 truncate" title={p.name}>{p.name}</h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-red-500 font-bold text-sm">{fmtPrice(p.minPrice)}</span>
                                                                {p.maxPrice && p.maxPrice > p.minPrice && (
                                                                    <span className="text-gray-400 text-xs line-through">{fmtPrice(p.maxPrice)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            disabled={inCompare || compareList.length >= MAX_COMPARE_ITEMS}
                                                            onClick={() => {
                                                                addToCompare({ id: p.id, name: p.name, imageUrl: p.imageUrl, price: p.minPrice });
                                                                setIsSearchOpen(false);
                                                            }}
                                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${inCompare ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : compareList.length >= MAX_COMPARE_ITEMS ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                        >
                                                            {inCompare ? 'Đã thêm' : 'Chọn'}
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    {hasMore && searchResults.length > 0 && (
                                        <div className="p-3 border-t border-gray-50 flex justify-center">
                                            <button 
                                                onClick={() => setPage(p => p + 1)}
                                                disabled={isSearching}
                                                className="px-6 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center min-w-[120px]"
                                            >
                                                {isSearching ? <Loader2 className="animate-spin" size={16} /> : 'Xem thêm'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Widget */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 p-4 pointer-events-auto w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="hidden sm:flex flex-col">
                                <span className="font-bold text-gray-900 text-sm whitespace-nowrap">So sánh sản phẩm</span>
                                <span className="text-xs text-gray-500 whitespace-nowrap">{compareList.length} / {MAX_COMPARE_ITEMS} sản phẩm</span>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
                                {Array.from({ length: MAX_COMPARE_ITEMS }).map((_, index) => {
                                    const item = compareList[index];
                                    return (
                                        <div key={index} className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center relative bg-gray-50/50 flex-shrink-0 overflow-visible">
                                            {item ? (
                                                <>
                                                    <img 
                                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop'} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-contain p-1"
                                                    />
                                                    <button 
                                                        onClick={() => removeFromCompare(item.id)}
                                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={() => setIsSearchOpen(true)}
                                                    className="w-full h-full text-gray-300 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center rounded-xl"
                                                    title="Thêm sản phẩm"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            <button 
                                onClick={clearCompare}
                                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors flex-1 sm:flex-none text-center"
                            >
                                Xóa hết
                            </button>
                            <button 
                                onClick={() => navigate('/compare')}
                                disabled={compareList.length < 2}
                                className={`px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 flex-1 sm:flex-none transition-all ${compareList.length >= 2 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                <GitCompare size={16} />
                                So sánh ngay
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
