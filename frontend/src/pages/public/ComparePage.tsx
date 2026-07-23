import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, X, ShoppingCart, Star, GitCompare } from 'lucide-react';
import { useCompare } from '../../hooks/useCompare';
import axiosInstance from '../../api/axios';
import type { ProductResponse } from '../../types/product';

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const navigate = useNavigate();
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (compareList.length === 0) {
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const responses = await Promise.all(
                    compareList.map(item => axiosInstance.get(`/products/${item.id}`))
                );
                setProducts(responses.map(r => r.data));
            } catch (err: any) {
                setError('Có lỗi xảy ra khi tải dữ liệu sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [compareList]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex justify-center items-center">
                <Loader2 size={40} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (compareList.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <GitCompare size={40} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Chưa có sản phẩm nào để so sánh</h2>
                <p className="text-gray-500 mb-8">Hãy thêm ít nhất 2 sản phẩm vào danh sách để so sánh.</p>
                <Link to="/products" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    Khám phá sản phẩm
                </Link>
            </div>
        );
    }

    const fmtPrice = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-0.5 justify-center">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14}
                      fill={i <= Math.round(rating) ? '#FBBF24' : 'none'}
                      className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'} />
            ))}
        </div>
    );

    const renderBoolean = (val: boolean) => (
        val ? <Check size={20} className="text-green-500 mx-auto" /> : <X size={20} className="text-red-400 mx-auto" />
    );

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <h1 className="text-3xl font-black text-gray-900">So sánh sản phẩm</h1>
                    </div>
                    <button 
                        onClick={() => {
                            clearCompare();
                            navigate('/products');
                        }}
                        className="text-red-500 font-bold text-sm hover:underline"
                    >
                        Xóa tất cả
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-center min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="p-6 text-left w-48 border-r border-b border-gray-100 bg-gray-50 align-bottom">
                                    <span className="font-bold text-gray-500 uppercase tracking-wider text-sm">Tính năng</span>
                                </th>
                                {products.map(p => (
                                    <th key={p.id} className="p-6 border-b border-gray-100 align-top min-w-[250px] relative">
                                        <button 
                                            onClick={() => removeFromCompare(p.id)}
                                            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="flex flex-col items-center">
                                            <div className="w-40 h-40 bg-gray-50 rounded-2xl mb-4 overflow-hidden p-2">
                                                <img src={p.imageUrl || p.variants?.[0]?.images?.[0]} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{p.brand}</span>
                                            <Link to={`/product/${p.id}`} className="text-lg font-black text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                                                {p.name}
                                            </Link>
                                            <div className="text-xl font-bold text-indigo-600 mb-3">
                                                {fmtPrice(p.minPrice || 0)}
                                            </div>
                                            <Link 
                                                to={`/product/${p.id}`}
                                                className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                                            >
                                                <ShoppingCart size={16} /> Xem chi tiết
                                            </Link>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="p-4 text-left font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50">Đánh giá</td>
                                {products.map(p => (
                                    <td key={p.id} className="p-4 text-gray-600">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="font-bold">{p.rating?.toFixed(1) || '0.0'}</span>
                                            {renderStars(p.rating || 0)}
                                            <span className="text-xs text-gray-400">({p.reviewCount})</span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 text-left font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50">Hệ điều hành</td>
                                {products.map(p => <td key={p.id} className="p-4 text-gray-800 font-medium">{p.os || '-'}</td>)}
                            </tr>
                            <tr>
                                <td className="p-4 text-left font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50">RAM</td>
                                {products.map(p => <td key={p.id} className="p-4 text-gray-800 font-medium">{p.ram ? `${p.ram} GB` : '-'}</td>)}
                            </tr>
                            <tr>
                                <td className="p-4 text-left font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50">Dung lượng bộ nhớ</td>
                                {products.map(p => <td key={p.id} className="p-4 text-gray-800 font-medium">{p.availableStorages?.join(', ') || '-'} GB</td>)}
                            </tr>
                            <tr>
                                <td className="p-4 text-left font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50">Màn hình</td>
                                {products.map(p => <td key={p.id} className="p-4 text-gray-800 font-medium">{p.screenSize ? `${p.screenSize} inch` : '-'}</td>)}
                            </tr>
                            <tr>
                                <td className="p-4 text-left font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50">Dung lượng pin</td>
                                {products.map(p => <td key={p.id} className="p-4 text-gray-800 font-medium">{p.batteryCapacity ? `${p.batteryCapacity} mAh` : '-'}</td>)}
                            </tr>
                            <tr>
                                <td className="p-4 text-left font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50">Màu sắc</td>
                                {products.map(p => <td key={p.id} className="p-4 text-gray-800 font-medium">{p.availableColors?.join(', ') || '-'}</td>)}
                            </tr>
                            <tr>
                                <td className="p-4 text-left font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50">Tình trạng kho</td>
                                {products.map(p => <td key={p.id} className="p-4">{renderBoolean(p.inStock)}</td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
