import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { productApi } from '../../api/productApi';
import type { ProductResponse } from '../../types/product';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for variant selection
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedStorage, setSelectedStorage] = useState<number | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await productApi.getProductById(id);
                setProduct(data);
                
                // Select default variant if available
                if (data.availableColors && data.availableColors.length > 0) {
                    setSelectedColor(data.availableColors[0]);
                }
                if (data.availableStorages && data.availableStorages.length > 0) {
                    setSelectedStorage(data.availableStorages[0]);
                }
            } catch (err: any) {
                console.error("Failed to fetch product detail", err);
                setError(err.message || 'Có lỗi xảy ra khi tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy sản phẩm</h2>
                <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline flex items-center justify-center gap-2 mx-auto">
                    <ArrowLeft size={20} /> Quay lại
                </button>
            </div>
        );
    }

    // Ưu tiên lấy variant khớp màu + dung lượng
    const currentVariant = product.variants?.find(
        v => v.color === selectedColor && v.storage === selectedStorage
    );

    // Nếu không có, lấy bất kỳ variant nào có cùng màu để hiển thị ảnh
    const colorVariant = currentVariant || product.variants?.find(
        v => v.color === selectedColor
    );

    const displayPrice = currentVariant?.discountPrice ?? currentVariant?.price ?? product.minPrice;
    // Ảnh ưu tiên theo màu đang chọn (bất kể dung lượng)
    const displayImage = colorVariant?.images?.[0] || product.imageUrl || 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg';
    // Tất cả ảnh của màu đang chọn (gallery)
    const colorImages = colorVariant?.images?.length ? colorVariant.images : (product.imageUrl ? [product.imageUrl] : []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 font-sans">
            <button onClick={() => navigate(-1)} className="mb-6 text-gray-500 hover:text-indigo-600 flex items-center gap-2">
                <ArrowLeft size={18} /> Quay lại
            </button>
            
            <div className="flex flex-col md:flex-row gap-12">
                {/* Ảnh sản phẩm */}
                <div className="w-full md:w-1/2">
                    <div className="bg-white rounded-3xl overflow-hidden aspect-square flex items-center justify-center border border-gray-100 shadow-sm">
                        <img
                            key={displayImage}
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-contain p-6"
                            style={{ animation: 'fadeIn 0.3s ease' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = product.imageUrl || 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg'; }}
                        />
                    </div>
                    {/* Thumbnail gallery nếu có nhiều ảnh */}
                    {colorImages.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto">
                            {colorImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all bg-white"
                                >
                                    <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-contain p-1" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Thông tin sản phẩm */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">{product.brand}</span>
                    <h1 className="text-4xl font-black text-gray-900 mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} fill={i < (product.rating || 5) ? "currentColor" : "none"} className={i >= (product.rating || 5) ? "text-gray-300" : ""} />
                            ))}
                        </div>
                        <span className="text-gray-400 text-sm">({product.reviewCount || 0} đánh giá) | Đã bán {product.soldCount || 0}</span>
                    </div>

                    <p className="text-3xl font-black text-indigo-700 mb-6">
                        {displayPrice?.toLocaleString('vi-VN')}đ
                    </p>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                    </p>

                    {/* Lựa chọn Dung lượng */}
                    {product.availableStorages && product.availableStorages.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">Dung lượng:</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.availableStorages.map(storage => (
                                    <button
                                        key={storage}
                                        onClick={() => setSelectedStorage(storage)}
                                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                                            selectedStorage === storage
                                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        {storage}GB
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lựa chọn Màu sắc */}
                    {product.availableColors && product.availableColors.length > 0 && (
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-900 mb-3">Màu sắc:</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.availableColors.map(color => {
                                    // Tìm hex code nếu có
                                    const variantWithColor = product.variants?.find(v => v.color === color);
                                    const colorHex = variantWithColor?.colorHex || '#ccc';
                                    
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                                                selectedColor === color
                                                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <span 
                                                className="w-4 h-4 rounded-full border border-gray-300" 
                                                style={{ backgroundColor: colorHex }}
                                            ></span>
                                            {color}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <Truck className="text-indigo-600" size={20} /> Miễn phí vận chuyển toàn quốc
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <ShieldCheck className="text-indigo-600" size={20} /> Bảo hành chính hãng 12 tháng
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            disabled={!product.inStock}
                            className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                                product.inStock 
                                    ? 'bg-indigo-700 text-white hover:bg-indigo-800 shadow-indigo-100' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <ShoppingCart size={20} /> {product.inStock ? 'Mua ngay' : 'Hết hàng'}
                        </button>
                        <button className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-red-500">
                            <Star size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}