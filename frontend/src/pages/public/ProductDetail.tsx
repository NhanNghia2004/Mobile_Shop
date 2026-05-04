import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';

export default function ProductDetail() {
    const { id } = useParams(); // Lấy ID từ URL

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 font-sans">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Ảnh sản phẩm */}
                <div className="w-full md:w-1/2">
                    <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-square">
                        <img
                            src="https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800"
                            alt="Sản phẩm"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">Apple iPhone</span>
                    <h1 className="text-4xl font-black text-gray-900 mb-4">iPhone 15 Pro Max - {id}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                        </div>
                        <span className="text-gray-400 text-sm">(120 đánh giá)</span>
                    </div>

                    <p className="text-3xl font-black text-indigo-700 mb-6">29.990.000đ</p>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Siêu phẩm mạnh mẽ nhất với chip A17 Pro, khung viền Titan siêu bền và hệ thống camera zoom quang học 5x đẳng cấp.
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <Truck className="text-indigo-600" size={20} /> Miễn phí vận chuyển toàn quốc
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <ShieldCheck className="text-indigo-600" size={20} /> Bảo hành chính hãng 12 tháng
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 bg-indigo-700 text-white py-4 rounded-2xl font-bold hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                            <ShoppingCart size={20} /> Mua ngay
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