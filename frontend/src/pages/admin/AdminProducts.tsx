import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Plus, Edit2, Package, Trash2,
    EyeOff, Eye, Loader2, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axios';
import ProductFormModal from './ProductFormModal';
import ProductVariantsModal from './ProductVariantsModal';

interface Stats {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStockProducts: number;
    totalVariants: number;
    totalSold: number;
}

export interface AdminProduct {
    id: number;
    name: string;
    brand: string;
    category: string;
    status: 'ACTIVE' | 'INACTIVE';
    minPrice: number;
    totalStock: number;
    soldCount: number;
    outOfStockVariants: number;
    imageUrl: string;
}

export default function AdminProducts() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);

    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [searchVal, setSearchVal] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [isVariantsOpen, setIsVariantsOpen] = useState(false);
    const [managingVariantProductId, setManagingVariantProductId] = useState<number | null>(null);

    // Action loading (per-row, so the table doesn't flash)
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const fmtPrice = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const { data } = await axiosInstance.get('/admin/products/stats');
            setStats(data);
        } catch (error) {
            console.error("Lỗi lấy thống kê", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/admin/products', {
                params: {
                    page,
                    size: 10,
                    keyword: keyword || undefined,
                    status: statusFilter,
                    sortBy
                }
            });
            setProducts(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm", error);
        } finally {
            setLoading(false);
        }
    }, [page, keyword, statusFilter, sortBy]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Silent refresh — doesn't show the big loading spinner
    const fetchProductsSilent = async () => {
        try {
            const { data } = await axiosInstance.get('/admin/products', {
                params: { page, size: 10, keyword: keyword || undefined, status: statusFilter, sortBy }
            });
            setProducts(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Lỗi làm mới dữ liệu", error);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setKeyword(searchVal);
        setPage(0);
    };

    const toggleStatus = async (product: AdminProduct) => {
        const action = product.status === 'ACTIVE' ? 'deactivate' : 'activate';
        setActionLoadingId(product.id);
        try {
            await axiosInstance.patch(`/admin/products/${product.id}/${action}`);
            await fetchProductsSilent();
            fetchStats();
        } catch (error) {
            alert('Lỗi cập nhật trạng thái');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này? Tất cả dữ liệu liên quan sẽ bị mất.')) return;
        setActionLoadingId(id);
        try {
            await axiosInstance.delete(`/admin/products/${id}/hard`);
            await fetchProductsSilent();
            fetchStats();
        } catch (error) {
            alert('Lỗi xóa sản phẩm');
        } finally {
            setActionLoadingId(null);
        }
    };

    const openFormModal = (id?: number) => {
        setEditingProductId(id || null);
        setIsFormOpen(true);
    };

    const openVariantsModal = (id: number) => {
        setManagingVariantProductId(id);
        setIsVariantsOpen(true);
    };

    const handleFormClose = (needsRefresh: boolean) => {
        setIsFormOpen(false);
        setEditingProductId(null);
        if (needsRefresh) {
            fetchProductsSilent();
            fetchStats();
        }
    };

    const handleVariantsClose = () => {
        setIsVariantsOpen(false);
        setManagingVariantProductId(null);
        fetchProductsSilent();
        fetchStats();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Quản lý Sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý kho hàng, thông tin và các biến thể</p>
                </div>
                <button
                    onClick={() => openFormModal()}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Thêm sản phẩm
                </button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tổng sản phẩm"
                    value={stats?.totalProducts}
                    icon={Package}
                    color="blue"
                    loading={loadingStats}
                />
                <StatCard
                    title="Đang bán (Active)"
                    value={stats?.activeProducts}
                    icon={CheckCircle2}
                    color="green"
                    loading={loadingStats}
                />
                <StatCard
                    title="Ngừng bán (Inactive)"
                    value={stats?.inactiveProducts}
                    icon={EyeOff}
                    color="gray"
                    loading={loadingStats}
                />
                <StatCard
                    title="Hết hàng"
                    value={stats?.outOfStockProducts}
                    icon={AlertCircle}
                    color="red"
                    loading={loadingStats}
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc hãng..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </form>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang bán</option>
                        <option value="INACTIVE">Ngừng bán</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                        className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="bestseller">Bán chạy nhất</option>
                        <option value="rating">Đánh giá cao</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Sản phẩm</th>
                                <th className="p-4 font-semibold">Thương hiệu / Phân loại</th>
                                <th className="p-4 font-semibold">Tồn kho / Đã bán</th>
                                <th className="p-4 font-semibold">Trạng thái</th>
                                <th className="p-4 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={32} />
                                        <p className="text-gray-400">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-gray-400">
                                        Không tìm thấy sản phẩm nào
                                    </td>
                                </tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p.id} className={`hover:bg-gray-50 transition-colors group ${actionLoadingId === p.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                    <img
                                                        src={p.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 line-clamp-1">{p.name}</p>
                                                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">Từ {fmtPrice(p.minPrice)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-block bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md w-fit">
                                                    {p.brand}
                                                </span>
                                                <span className="text-xs text-gray-500">{p.category}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Kho: </span>
                                                    <span className={`font-bold ${p.totalStock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                                        {p.totalStock}
                                                    </span>
                                                    {p.outOfStockVariants > 0 && (
                                                        <span className="text-[10px] text-orange-500 ml-1 bg-orange-50 px-1 rounded">({p.outOfStockVariants} biến thể hết)</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Bán: <span className="font-semibold text-gray-700">{p.soldCount}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {p.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <EyeOff size={12} />}
                                                {p.status === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {actionLoadingId === p.id ? (
                                                    <Loader2 size={18} className="animate-spin text-gray-400" />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => openVariantsModal(p.id)}
                                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Quản lý Biến thể (Màu sắc, Dung lượng, Hình ảnh)"
                                                        >
                                                            <Layers size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => openFormModal(p.id)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Chỉnh sửa thông tin"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleStatus(p)}
                                                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title={p.status === 'ACTIVE' ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
                                                        >
                                                            {p.status === 'ACTIVE' ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa vĩnh viễn"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            Hiển thị trang <span className="font-semibold text-gray-900">{page + 1}</span> / {totalPages}
                        </span>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setPage(idx)}
                                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === idx ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isFormOpen && (
                    <ProductFormModal
                        productId={editingProductId}
                        onClose={handleFormClose}
                    />
                )}
                {isVariantsOpen && managingVariantProductId && (
                    <ProductVariantsModal
                        productId={managingVariantProductId}
                        onClose={handleVariantsClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, loading }: { title: string, value?: number, icon: any, color: 'blue' | 'green' | 'red' | 'gray', loading: boolean }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        gray: 'bg-gray-100 text-gray-600',
    };

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">{title}</p>
                {loading ? (
                    <div className="h-7 w-16 bg-gray-100 animate-pulse rounded"></div>
                ) : (
                    <p className="text-2xl font-black text-gray-900 leading-none">{value?.toLocaleString('vi-VN') || 0}</p>
                )}
            </div>
        </div>
    );
}
