import { Phone, Mail, MapPin,  ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 font-sans">

            {/* Top banner */}
            <div className="bg-indigo-700 py-4">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-white font-black text-lg">📱 Tư vấn mua hàng miễn phí 24/7</p>
                        <p className="text-indigo-200 text-sm">Đội ngũ chuyên gia sẵn sàng hỗ trợ bạn chọn sản phẩm phù hợp nhất</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-2 text-center border border-white/20">
                            <p className="text-indigo-200 text-xs">Tư vấn mua hàng</p>
                            <p className="text-white font-black text-base">1900 6750 <span className="text-indigo-300 font-normal text-xs">(Nhánh 1)</span></p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-2 text-center border border-white/20">
                            <p className="text-indigo-200 text-xs">Bảo hành & Sửa chữa</p>
                            <p className="text-white font-black text-base">1900 6750 <span className="text-indigo-300 font-normal text-xs">(Nhánh 2)</span></p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-2 text-center border border-white/20">
                            <p className="text-indigo-200 text-xs">Góp ý, khiếu nại</p>
                            <p className="text-white font-black text-base">1900 6750 <span className="text-indigo-300 font-normal text-xs">(8h - 22h)</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Cột 1: Thương hiệu */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Phone size={18} className="text-white" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                MOBI<span className="text-indigo-400">SHOP</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-5">
                            Chuỗi bán lẻ điện thoại & phụ kiện chính hãng hàng đầu Việt Nam.
                            Cam kết giá tốt, bảo hành chính hãng, giao hàng toàn quốc.
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2.5">
                                <MapPin size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                <span>70 Lữ Gia, Phường 15, Quận 11, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone size={15} className="text-indigo-400 flex-shrink-0" />
                                <span>1900 6750</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail size={15} className="text-indigo-400 flex-shrink-0" />
                                <span>support@mobishop.vn</span>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 2: Về chúng tôi */}
                    <div>
                        <h6 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
                            Về chúng tôi
                        </h6>
                        <ul className="space-y-2.5 text-sm">
                            {[
                                { label: 'Giới thiệu MobiShop', to: '/' },
                                { label: 'Hệ thống cửa hàng', to: '/' },
                                { label: 'Tuyển dụng', to: '/' },
                                { label: 'Tin tức & Khuyến mãi', to: '/' },
                                { label: 'Liên hệ', to: '/' },
                            ].map(item => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-400 transition-colors group"
                                    >
                                        <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 3: Chính sách */}
                    <div>
                        <h6 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
                            Chính sách
                        </h6>
                        <ul className="space-y-2.5 text-sm">
                            {[
                                'Chính sách bảo hành',
                                'Chính sách đổi trả',
                                'Chính sách giao hàng',
                                'Chính sách trả góp 0%',
                                'Chính sách bảo mật',
                                'Điều khoản sử dụng',
                            ].map(label => (
                                <li key={label}>
                                    <a
                                        href="#"
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-400 transition-colors group"
                                    >
                                        <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 4: Danh mục & Kết nối */}
                    <div>
                        <h6 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
                            Danh mục sản phẩm
                        </h6>
                        <ul className="space-y-2.5 text-sm mb-6">
                            {[
                                { label: 'Điện thoại iPhone', brand: 'Apple' },
                                { label: 'Điện thoại Samsung', brand: 'Samsung' },
                                { label: 'Điện thoại Xiaomi', brand: 'Xiaomi' },
                                { label: 'Máy tính bảng', to: '/products?category=TABLET' },
                                { label: 'Phụ kiện', to: '/products?category=ACCESSORY' },
                            ].map(item => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to || `/products?brand=${item.brand}`}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-400 transition-colors group"
                                    >
                                        <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Mạng xã hội */}
                        <h6 className="text-white font-bold text-sm uppercase tracking-widest mb-3">
                            Kết nối
                        </h6>
                        <div className="flex gap-2">
                            {[
                                // { icon: <Facebook size={16} />, label: 'Facebook', color: 'hover:bg-blue-600' },
                                // { icon: <Instagram size={16} />, label: 'Instagram', color: 'hover:bg-pink-600' },
                                // { icon: <Youtube size={16} />, label: 'YouTube', color: 'hover:bg-red-600' },
                                { icon: <span className="text-xs font-black">TK</span>, label: 'TikTok', color: 'hover:bg-gray-600' },
                            ].map(s => (
                                <a
                                    key={s.label}
                                    href="#"
                                    title={s.label}
                                    className={`w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all ${s.color}`}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Thanh toán */}
                <div className="border-t border-gray-700/60 mt-10 pt-8">
                    <h6 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
                        Phương thức thanh toán
                    </h6>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'VNPAY', bg: 'bg-blue-900 text-blue-300 border-blue-700' },
                            { label: 'ZaloPay', bg: 'bg-sky-900 text-sky-300 border-sky-700' },
                            { label: 'MoMo', bg: 'bg-pink-900 text-pink-300 border-pink-700' },
                            { label: 'VISA', bg: 'bg-indigo-900 text-indigo-300 border-indigo-700' },
                            { label: 'MasterCard', bg: 'bg-red-900 text-red-300 border-red-700' },
                            { label: 'Trả góp 0%', bg: 'bg-green-900 text-green-300 border-green-700' },
                            { label: 'COD', bg: 'bg-yellow-900 text-yellow-300 border-yellow-700' },
                        ].map(p => (
                            <span
                                key={p.label}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${p.bg}`}
                            >
                                {p.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer bottom */}
            <div className="border-t border-gray-700/60">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-gray-400">
                            © 2025 <span className="text-white font-bold">MobiShop</span>. Tất cả quyền được bảo lưu.
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Mã số doanh nghiệp: 0314314314 — Sở KH&ĐT TP. Hồ Chí Minh cấp ngày 24/06/2025
                        </p>
                    </div>
                    <img
                        src="https://web.archive.org/web/20211026023249im_/http://online.gov.vn/PublicImages/2015/08/27/11/20150827110756-dathongbao.png"
                        alt="Đã thông báo Bộ Công Thương"
                        className="h-10 opacity-80 hover:opacity-100 transition-opacity"
                    />
                </div>
            </div>
        </footer>
    );
}