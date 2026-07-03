import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Package, AlertTriangle, CheckCircle2, Loader2,
    Download, TrendingUp, RefreshCw, ChevronDown, ChevronUp,
    History, ArrowUpCircle, SlidersHorizontal, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axios';

// ─── Types ─────────────────────────────────────────────────────────────────
interface InventoryStats {
    totalProducts: number;
    totalVariants: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalStockUnits: number;
}

interface VariantStock {
    variantId: number;
    color: string;
    colorHex: string;
    storage: number;
    stockQuantity: number;
    status: string;
    price: number;
    discountPrice?: number;
    images: string[];
}

interface ProductStock {
    productId: number;
    productName: string;
    brand: string;
    imageUrl: string;
    category: string;
    status: string;
    totalStock: number;
    lowStock: boolean;
    variants: VariantStock[];
}

interface StockHistory {
    id: number;
    variantId: number;
    variantColor: string;
    variantStorage: number;
    productId: number;
    productName: string;
    changeType: 'IMPORT' | 'ORDER_DEDUCT' | 'ORDER_RESTORE' | 'ADJUSTMENT' | 'SYSTEM';
    quantityChanged: number;
    quantityBefore: number;
    quantityAfter: number;
    changedBy: string;
    note: string;
    createdAt: string;
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminInventory() {
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const [products, setProducts] = useState<ProductStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [keyword, setKeyword] = useState('');
    const [searchVal, setSearchVal] = useState('');
    const [stockStatus, setStockStatus] = useState('all');
    const [sortBy, setSortBy] = useState('stock_asc');

    // Expanded rows
    const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

    // Import Stock Modal
    const [importModal, setImportModal] = useState<{ open: boolean; variant?: VariantStock; productName?: string }>({ open: false });
    const [importQty, setImportQty] = useState('');
    const [importNote, setImportNote] = useState('');
    const [importing, setImporting] = useState(false);

    // Adjust Stock Modal
    const [adjustModal, setAdjustModal] = useState<{ open: boolean; variant?: VariantStock; productName?: string }>({ open: false });
    const [adjustQty, setAdjustQty] = useState('');
    const [adjustNote, setAdjustNote] = useState('');
    const [adjusting, setAdjusting] = useState(false);

    // History Tab
    const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
    const [history, setHistory] = useState<StockHistory[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyTotalPages, setHistoryTotalPages] = useState(0);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyFilter, setHistoryFilter] = useState('');

    const fmtPrice = (n: number) => (n || 0).toLocaleString('vi-VN') + 'đ';
    const fmtDate = (s: string) => new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // ── Fetch Stats ─────────────────────────────────────────────────────────
    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const { data } = await axiosInstance.get('/admin/inventory/stats', {
                params: { threshold: 10 }
            });
            setStats(data);
        } catch { } finally {
            setLoadingStats(false);
        }
    };

    // ── Fetch Products ──────────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/admin/inventory', {
                params: { page, size: 15, keyword: keyword || undefined, stockStatus, sortBy, threshold: 10 }
            });
            setProducts(data.content);
            setTotalPages(data.totalPages);
        } catch { } finally {
            setLoading(false);
        }
    }, [page, keyword, stockStatus, sortBy]);

    // ── Fetch History ───────────────────────────────────────────────────────
    const fetchHistory = useCallback(async () => {
        try {
            setHistoryLoading(true);
            const { data } = await axiosInstance.get('/admin/inventory/history', {
                params: { page: historyPage, size: 20, changeType: historyFilter || undefined }
            });
            setHistory(data.content);
            setHistoryTotalPages(data.totalPages);
        } catch { } finally {
            setHistoryLoading(false);
        }
    }, [historyPage, historyFilter]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchProducts(); }, [fetchProducts]);
    useEffect(() => { if (activeTab === 'history') fetchHistory(); }, [fetchHistory, activeTab]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setKeyword(searchVal);
        setPage(0);
    };

    // ── Import Stock ────────────────────────────────────────────────────────
    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importModal.variant) return;
        setImporting(true);
        try {
            await axiosInstance.post('/admin/inventory/import', {
                variantId: importModal.variant.variantId,
                quantity: Number(importQty),
                note: importNote || undefined
            });
            setImportModal({ open: false });
            setImportQty('');
            setImportNote('');
            fetchProducts();
            fetchStats();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi nhập kho');
        } finally {
            setImporting(false);
        }
    };

    // ── Adjust Stock ────────────────────────────────────────────────────────
    const handleAdjust = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustModal.variant) return;
        setAdjusting(true);
        try {
            await axiosInstance.patch(`/admin/inventory/variants/${adjustModal.variant.variantId}/adjust`, {
                newQuantity: Number(adjustQty),
                note: adjustNote || undefined
            });
            setAdjustModal({ open: false });
            setAdjustQty('');
            setAdjustNote('');
            fetchProducts();
            fetchStats();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi điều chỉnh tồn kho');
        } finally {
            setAdjusting(false);
        }
    };

    // ── Change type labels ───────────────────────────────────────────────────
    const changeTypeLabel: Record<string, { label: string; color: string }> = {
        IMPORT: { label: 'Nhập kho', color: 'bg-green-100 text-green-700' },
        ORDER_DEDUCT: { label: 'Bán hàng', color: 'bg-blue-100 text-blue-700' },
        ORDER_RESTORE: { label: 'Hoàn trả', color: 'bg-orange-100 text-orange-700' },
        ADJUSTMENT: { label: 'Điều chỉnh', color: 'bg-purple-100 text-purple-700' },
        SYSTEM: { label: 'Hệ thống', color: 'bg-gray-100 text-gray-600' },
    };

    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Quản lý Tồn kho</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi, nhập kho và điều chỉnh số lượng tồn</p>
                </div>
                <button
                    onClick={() => { fetchProducts(); fetchStats(); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors font-semibold text-sm"
                >
                    <RefreshCw size={16} /> Làm mới
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Tổng sản phẩm', value: stats?.totalProducts, icon: Package, color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'Tổng biến thể', value: stats?.totalVariants, icon: SlidersHorizontal, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Tổng tồn kho', value: stats?.totalStockUnits, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Sắp hết hàng', value: stats?.lowStockProducts, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Hết hàng', value: stats?.outOfStockProducts, icon: X, color: 'text-red-600 bg-red-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold leading-tight">{label}</p>
                            {loadingStats
                                ? <div className="h-6 w-12 bg-gray-100 animate-pulse rounded mt-1" />
                                : <p className="text-xl font-black text-gray-900 leading-none mt-0.5">{value?.toLocaleString('vi-VN') ?? 0}</p>
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('stock')}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'stock' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><Package size={15} /> Tồn kho</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><History size={15} /> Lịch sử</span>
                </button>
            </div>

            {/* ═══════════════ STOCK TAB ═══════════════ */}
            {activeTab === 'stock' && (
                <>
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
                        <form onSubmit={handleSearch} className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Tìm theo tên sản phẩm, thương hiệu..."
                                value={searchVal}
                                onChange={e => setSearchVal(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none border-none"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                        </form>
                        <div className="flex gap-2">
                            <select
                                value={stockStatus}
                                onChange={e => { setStockStatus(e.target.value); setPage(0); }}
                                className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm font-medium text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">Tất cả</option>
                                <option value="out">Hết hàng</option>
                                <option value="low">Sắp hết (≤10)</option>
                                <option value="available">Còn hàng</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={e => { setSortBy(e.target.value); setPage(0); }}
                                className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm font-medium text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="stock_asc">Tồn kho ↑</option>
                                <option value="stock_desc">Tồn kho ↓</option>
                                <option value="name_asc">Tên A→Z</option>
                                <option value="newest">Mới nhất</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Sản phẩm</th>
                                    <th className="p-4 font-semibold">Thương hiệu</th>
                                    <th className="p-4 font-semibold text-center">Tổng tồn kho</th>
                                    <th className="p-4 font-semibold text-center">Trạng thái kho</th>
                                    <th className="p-4 font-semibold text-center">Biến thể</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={32} />
                                            <p className="text-gray-400 text-sm">Đang tải...</p>
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
                                        <React.Fragment key={p.productId}>
                                            <tr
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => setExpandedProductId(expandedProductId === p.productId ? null : p.productId)}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                            <img
                                                                src={p.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80'}
                                                                alt={p.productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="font-semibold text-gray-900 line-clamp-1">{p.productName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded">{p.brand}</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-lg font-black ${p.totalStock === 0 ? 'text-red-600' : p.lowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                                                        {p.totalStock}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {p.totalStock === 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                                                            <X size={11} /> Hết hàng
                                                        </span>
                                                    ) : p.lowStock ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                                                            <AlertTriangle size={11} /> Sắp hết
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                                                            <CheckCircle2 size={11} /> Còn hàng
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 text-xs font-semibold mx-auto transition-colors">
                                                        {expandedProductId === p.productId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        {p.variants.length} biến thể
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded Variant Rows */}
                                            <AnimatePresence>
                                                {expandedProductId === p.productId && (
                                                    <tr key={`expanded-${p.productId}`}>
                                                        <td colSpan={5} className="p-0 bg-indigo-50/40">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-4 space-y-2">
                                                                    {p.variants.map(v => (
                                                                        <div
                                                                            key={v.variantId}
                                                                            className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-4"
                                                                        >
                                                                            {/* Color */}
                                                                            <div
                                                                                className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-gray-300 flex-shrink-0"
                                                                                style={{ backgroundColor: v.colorHex || '#ccc' }}
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-semibold text-gray-800 text-sm">{v.color} — {v.storage}GB</p>
                                                                                <p className="text-xs text-gray-500">{fmtPrice(v.discountPrice || v.price)}</p>
                                                                            </div>
                                                                            <div className="text-center w-20">
                                                                                <p className={`text-xl font-black leading-none ${v.stockQuantity === 0 ? 'text-red-600' : v.stockQuantity <= 10 ? 'text-amber-600' : 'text-gray-900'}`}>
                                                                                    {v.stockQuantity}
                                                                                </p>
                                                                                <p className="text-[10px] text-gray-400 mt-0.5">đơn vị</p>
                                                                            </div>
                                                                            {/* Actions */}
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setImportQty('');
                                                                                        setImportNote('');
                                                                                        setImportModal({ open: true, variant: v, productName: p.productName });
                                                                                    }}
                                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                                                                >
                                                                                    <Download size={13} /> Nhập kho
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setAdjustQty(String(v.stockQuantity));
                                                                                        setAdjustNote('');
                                                                                        setAdjustModal({ open: true, variant: v, productName: p.productName });
                                                                                    }}
                                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors"
                                                                                >
                                                                                    <ArrowUpCircle size={13} /> Điều chỉnh
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-gray-100">
                                <span className="text-sm text-gray-500">Trang <b>{page + 1}</b> / {totalPages}</span>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i)}
                                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === i ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ═══════════════ HISTORY TAB ═══════════════ */}
            {activeTab === 'history' && (
                <>
                    {/* Filter */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-3">
                        <select
                            value={historyFilter}
                            onChange={e => { setHistoryFilter(e.target.value); setHistoryPage(0); }}
                            className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Tất cả loại thay đổi</option>
                            <option value="IMPORT">Nhập kho</option>
                            <option value="ORDER_DEDUCT">Bán hàng</option>
                            <option value="ORDER_RESTORE">Hoàn trả</option>
                            <option value="ADJUSTMENT">Điều chỉnh</option>
                        </select>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Sản phẩm / Biến thể</th>
                                    <th className="p-4 font-semibold text-center">Loại</th>
                                    <th className="p-4 font-semibold text-center">Thay đổi</th>
                                    <th className="p-4 font-semibold text-center">Trước → Sau</th>
                                    <th className="p-4 font-semibold">Ghi chú / Người thực hiện</th>
                                    <th className="p-4 font-semibold">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={32} />
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-gray-400">Chưa có lịch sử thay đổi</td>
                                    </tr>
                                ) : history.map(h => {
                                    const ct = changeTypeLabel[h.changeType] ?? { label: h.changeType, color: 'bg-gray-100 text-gray-600' };
                                    const isIncrease = h.quantityChanged > 0;
                                    return (
                                        <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-900 line-clamp-1">{h.productName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{h.variantColor} — {h.variantStorage}GB</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${ct.color}`}>{ct.label}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-base font-black ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isIncrease ? '+' : ''}{h.quantityChanged}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-gray-500">{h.quantityBefore}</span>
                                                <span className="text-gray-400 mx-1.5">→</span>
                                                <span className="font-bold text-gray-900">{h.quantityAfter}</span>
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                <p className="text-xs text-gray-700 truncate">{h.note || '—'}</p>
                                                {h.changedBy && <p className="text-[10px] text-gray-400 mt-0.5">bởi {h.changedBy}</p>}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-xs text-gray-500">{fmtDate(h.createdAt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {historyTotalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-gray-100">
                                <span className="text-sm text-gray-500">Trang <b>{historyPage + 1}</b> / {historyTotalPages}</span>
                                <div className="flex gap-1">
                                    {Array.from({ length: historyTotalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setHistoryPage(i)}
                                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${historyPage === i ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ═════════ IMPORT STOCK MODAL ═════════ */}
            <AnimatePresence>
                {importModal.open && importModal.variant && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setImportModal({ open: false })}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Nhập kho</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{importModal.productName} — {importModal.variant.color} {importModal.variant.storage}GB</p>
                                </div>
                                <button onClick={() => setImportModal({ open: false })} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleImport} className="p-5 space-y-4">
                                <div className="bg-indigo-50 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: importModal.variant.colorHex || '#ccc' }} />
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-700">Tồn kho hiện tại</p>
                                        <p className="text-indigo-700 font-black text-lg leading-none">{importModal.variant.stockQuantity} đơn vị</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số lượng nhập *</label>
                                    <input
                                        type="number" required min="1"
                                        value={importQty}
                                        onChange={e => setImportQty(e.target.value)}
                                        placeholder="Nhập số lượng..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
                                    <input
                                        type="text"
                                        value={importNote}
                                        onChange={e => setImportNote(e.target.value)}
                                        placeholder="VD: Nhập từ nhà cung cấp A"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                {importQty && Number(importQty) > 0 && (
                                    <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 font-semibold">
                                        Sau nhập: {importModal.variant.stockQuantity + Number(importQty)} đơn vị
                                    </div>
                                )}
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setImportModal({ open: false })} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">Hủy</button>
                                    <button type="submit" disabled={importing} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                                        {importing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        Xác nhận nhập kho
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═════════ ADJUST STOCK MODAL ═════════ */}
            <AnimatePresence>
                {adjustModal.open && adjustModal.variant && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setAdjustModal({ open: false })}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Điều chỉnh tồn kho</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{adjustModal.productName} — {adjustModal.variant.color} {adjustModal.variant.storage}GB</p>
                                </div>
                                <button onClick={() => setAdjustModal({ open: false })} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAdjust} className="p-5 space-y-4">
                                <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: adjustModal.variant.colorHex || '#ccc' }} />
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-700">Tồn kho hiện tại</p>
                                        <p className="text-amber-700 font-black text-lg leading-none">{adjustModal.variant.stockQuantity} đơn vị</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số lượng mới (thực tế) *</label>
                                    <input
                                        type="number" required min="0"
                                        value={adjustQty}
                                        onChange={e => setAdjustQty(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Lý do điều chỉnh</label>
                                    <input
                                        type="text"
                                        value={adjustNote}
                                        onChange={e => setAdjustNote(e.target.value)}
                                        placeholder="VD: Kiểm kê thực tế ngày 01/06"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                {adjustQty !== '' && Number(adjustQty) !== adjustModal.variant.stockQuantity && (
                                    <div className={`rounded-xl p-3 text-sm font-semibold ${Number(adjustQty) > adjustModal.variant.stockQuantity ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {Number(adjustQty) > adjustModal.variant.stockQuantity ? '+' : ''}{Number(adjustQty) - adjustModal.variant.stockQuantity} đơn vị ({adjustModal.variant.stockQuantity} → {adjustQty})
                                    </div>
                                )}
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setAdjustModal({ open: false })} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">Hủy</button>
                                    <button type="submit" disabled={adjusting} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                                        {adjusting ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpCircle size={16} />}
                                        Xác nhận điều chỉnh
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
