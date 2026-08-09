import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, Truck, CreditCard, Lock, FileText, ChevronRight, HelpCircle, PhoneCall } from 'lucide-react';

interface PolicyTab {
    id: string;
    label: string;
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
}

export default function PoliciesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>('warranty');

    const policies: PolicyTab[] = [
        {
            id: 'warranty',
            label: 'Chính sách bảo hành',
            icon: <ShieldCheck size={18} />,
            title: 'Chính Sách Bảo Hành Chính Hãng',
            content: (
                <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                    <p className="font-semibold text-gray-800">MobiShop cam kết mang lại chính sách bảo hành tốt nhất và an tâm tuyệt đối cho tất cả khách hàng mua thiết bị tại hệ thống của chúng tôi.</p>
                    
                    <div className="border-l-4 border-indigo-600 pl-4 py-1 bg-indigo-50/40 rounded-r-xl">
                        <span className="font-bold text-indigo-900 block mb-1">Thời hạn bảo hành tiêu chuẩn:</span>
                        <span>12 tháng kể từ ngày kích hoạt máy đối với máy mới 100% chính hãng (Apple, Samsung, Xiaomi, Oppo...). Bảo hành 6 tháng đối với máy cũ.</span>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-2">1. Điều kiện bảo hành hợp lệ:</h4>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                            <li>Thiết bị vẫn còn trong thời hạn bảo hành.</li>
                            <li>Có hóa đơn mua hàng kiêm phiếu bảo hành hoặc thông tin bảo hành điện tử trên hệ thống trùng khớp IMEI/Serial.</li>
                            <li>Tem bảo hành của MobiShop hoặc nhà sản xuất trên máy còn nguyên vẹn, không bị rách, vỡ hay tẩy xóa.</li>
                            <li>Hư hỏng được xác định do lỗi kỹ thuật của nhà sản xuất (lỗi mainboard, lỗi màn hình tự nhiên, lỗi camera...).</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-2">2. Trường hợp từ chối bảo hành:</h4>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                            <li>Máy bị rơi rớt, cấn móp, nứt vỡ kính do tác động vật lý ngoại lực của người dùng.</li>
                            <li>Máy có dấu hiệu bị vào nước, ẩm ướt hoặc hóa chất ăn mòn bên trong.</li>
                            <li>Tài khoản cá nhân iCloud (Apple) hoặc Google Account/Mi Cloud bị khóa hoặc quên mật khẩu dẫn đến không kiểm tra được lỗi.</li>
                            <li>Khách hàng tự ý can thiệp phần cứng, tháo máy, sửa chữa tại các cửa hàng không thuộc ủy quyền chính thức.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'return',
            label: 'Chính sách đổi trả',
            icon: <RefreshCw size={18} />,
            title: 'Chính Sách Đổi Trả "1 Đổi 1"',
            content: (
                <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                    <p className="font-semibold text-gray-800">Chính sách đổi trả linh hoạt tại MobiShop đảm bảo quyền lợi tối đa cho khách hàng khi sản phẩm không may gặp sự cố phần cứng ngay khi vừa mua.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-150">
                            <span className="font-bold text-green-800 block mb-1">MÁY MỚI (Lỗi NSX):</span>
                            <span className="text-xs">1 đổi 1 trong vòng 30 ngày đầu tiên nếu phát sinh lỗi phần cứng từ nhà sản xuất. Sau 30 ngày áp dụng chính sách gửi bảo hành chính hãng hãng.</span>
                        </div>
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-150">
                            <span className="font-bold text-blue-800 block mb-1">MÁY CŨ (Lỗi NSX):</span>
                            <span className="text-xs">1 đổi 1 trong vòng 33 ngày đầu tiên. Đổi máy cùng dòng, cùng màu sắc và dung lượng tương đương không thu thêm phí phụ thu.</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-2">Yêu cầu về tình trạng máy khi đổi trả:</h4>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                            <li>Máy giữ nguyên hiện trạng vật lý ban đầu: không trầy xước, không cấn móp, không dính tài khoản cá nhân.</li>
                            <li>Hộp máy (nếu có) trùng IMEI/Serial, không rách nát, móp méo.</li>
                            <li>Đầy đủ phụ kiện tặng kèm nguyên vẹn đi kèm hộp máy mua ban đầu (cáp sạc, củ sạc, tai nghe...).</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'delivery',
            label: 'Chính sách giao hàng',
            icon: <Truck size={18} />,
            title: 'Chính Sách Vận Chuyển & Giao Nhận',
            content: (
                <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                    <p className="font-semibold text-gray-800">MobiShop hợp tác cùng các đối tác giao hàng nhanh uy tín số 1 Việt Nam như Giao Hàng Tiết Kiệm, Viettel Post, GrabExpress để đảm bảo sản phẩm tới tay bạn an toàn và nhanh nhất.</p>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold">1</div>
                            <div>
                                <span className="font-bold text-gray-800 block">Miễn phí giao hàng toàn quốc:</span>
                                <span className="text-xs">Áp dụng cho mọi đơn hàng điện thoại thông minh, máy tính bảng từ 2.000.000đ trở lên khi mua qua website.</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold">2</div>
                            <div>
                                <span className="font-bold text-gray-800 block">Thời gian giao hàng dự kiến:</span>
                                <span className="text-xs">
                                    Nội thành TP.HCM & Hà Nội: Giao hỏa tốc 1 - 2 giờ ( Grab/Ahamove) hoặc giao tiêu chuẩn trong ngày.<br />
                                    Các tỉnh thành khác: Giao từ 2 - 4 ngày làm việc.
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold">3</div>
                            <div>
                                <span className="font-bold text-gray-800 block">Quy trình kiểm tra đồng kiểm hàng (Co-checking):</span>
                                <span className="text-xs">Khách hàng được quyền mở gói hàng kiểm tra hộp sản phẩm nguyên vẹn, tem niêm phong trước khi tiến hành thanh toán hoặc nhận hàng từ shipper.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'installment',
            label: 'Chính sách trả góp 0%',
            icon: <CreditCard size={18} />,
            title: 'Chính Sách Mua Trả Góp 0% Lãi Suất',
            content: (
                <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                    <p className="font-semibold text-gray-800">Sở hữu ngay siêu phẩm công nghệ mơ ước cực kỳ dễ dàng với chính sách trả góp linh hoạt tại MobiShop.</p>

                    <div className="border border-gray-150 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-100 font-bold text-gray-700">
                                    <th className="p-3 border-b border-gray-250">Phương thức trả góp</th>
                                    <th className="p-3 border-b border-gray-250">Kỳ hạn áp dụng</th>
                                    <th className="p-3 border-b border-gray-250">Yêu cầu tối thiểu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-150">
                                    <td className="p-3 font-semibold text-gray-800">Trả góp qua Thẻ tín dụng (0% lãi suất)</td>
                                    <td className="p-3">3, 6, 9, 12 tháng</td>
                                    <td className="p-3">Hạn mức thẻ đủ thanh toán đơn hàng. Hỗ trợ hơn 25 ngân hàng liên kết.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-semibold text-gray-800">Trả góp qua Công ty tài chính (Home Credit, HD Saison)</td>
                                    <td className="p-3">6, 9, 12 tháng</td>
                                    <td className="p-3">Chỉ cần CCCD có gắn chip, độ tuổi từ 18 tuổi trở lên, xét duyệt nhanh 15 phút.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        },
        {
            id: 'privacy',
            label: 'Chính sách bảo mật',
            icon: <Lock size={18} />,
            title: 'Chính Sách Bảo Mật Thông Tin Cá Nhân',
            content: (
                <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                    <p className="font-semibold text-gray-800">MobiShop cam kết tôn trọng và bảo vệ thông tin riêng tư cá nhân tuyệt đối của mọi khách hàng khi đăng ký tài khoản và giao dịch trên website.</p>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-1 text-sm">Thu thập thông tin:</h4>
                        <span className="text-xs">Chúng tôi thu thập các thông tin bao gồm: Họ tên, Số điện thoại, Địa chỉ giao hàng và Email phục vụ mục đích xử lý đơn hàng và chăm sóc khách hàng sau mua.</span>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-1 text-sm">Bảo mật giao dịch:</h4>
                        <span className="text-xs">Mọi thông tin thanh toán trực tuyến (Thẻ ngân hàng, Ví điện tử) đều được xử lý thông qua cổng thanh toán bảo mật tiêu chuẩn mã hóa SSL/TLS, hệ thống hoàn toàn không lưu trữ thông tin thẻ của bạn.</span>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-1 text-sm">Cam kết không chia sẻ dữ liệu:</h4>
                        <span className="text-xs">Tuyệt đối không chia sẻ, chuyển giao dữ liệu cá nhân khách hàng cho bên thứ ba vì bất cứ mục đích kinh doanh quảng cáo thương mại nào.</span>
                    </div>
                </div>
            )
        },
        {
            id: 'terms',
            label: 'Điều khoản sử dụng',
            icon: <FileText size={18} />,
            title: 'Điều Khoản Sử Dụng Dịch Vụ Website',
            content: (
                <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                    <p className="font-semibold text-gray-800">Khi bạn truy cập và thực hiện mua hàng trên trang web của MobiShop, đồng nghĩa với việc bạn chấp thuận các điều khoản hoạt động bên dưới của chúng tôi.</p>
                    
                    <ul className="list-decimal list-inside pl-2 space-y-3 text-xs">
                        <li>
                            <strong className="text-gray-800">Quyền sở hữu trí tuệ:</strong> Toàn bộ hình ảnh sản phẩm, thiết kế giao diện, logo, nội dung bài viết đánh giá đều thuộc bản quyền sở hữu trí tuệ của MobiShop, nghiêm cấm sao chép trái phép.
                        </li>
                        <li>
                            <strong className="text-gray-800">Thông tin sản phẩm & giá cả:</strong> Chúng tôi cam kết cung cấp thông tin giá cả và cấu hình chính xác nhất. Nếu xảy ra sai lệch kỹ thuật hiếm hoi ngoài ý muốn, nhân viên sẽ liên hệ trực tiếp xin lỗi và xác nhận đơn hàng lại với bạn.
                        </li>
                        <li>
                            <strong className="text-gray-800">Trách nhiệm người dùng:</strong> Không sử dụng bất kỳ công cụ phần mềm nào nhằm can thiệp phá hoại cấu trúc hệ thống website hoặc thu thập thông tin người dùng bất hợp pháp.
                        </li>
                    </ul>
                </div>
            )
        }
    ];

    // Read initial tab from URL query params (e.g. ?tab=1 or ?tab=return)
    useEffect(() => {
        const tabQuery = searchParams.get('tab');
        if (tabQuery) {
            // Check if tab is index or id
            const idx = parseInt(tabQuery, 10);
            if (!isNaN(idx) && idx >= 0 && idx < policies.length) {
                setActiveTab(policies[idx].id);
            } else {
                const foundTab = policies.find(p => p.id === tabQuery);
                if (foundTab) {
                    setActiveTab(foundTab.id);
                }
            }
        }
    }, [searchParams]);

    const activePolicy = policies.find(p => p.id === activeTab) || policies[0];

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white py-16 px-6 sm:px-12 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-black mb-3">Trung Tâm Hỗ Trợ & Chính Sách</h1>
                    <p className="text-indigo-200 text-sm sm:text-base font-light">
                        Mọi thông tin minh bạch, rõ ràng giúp bạn mua sắm tiện lợi và an tâm tuyệt đối khi đồng hành cùng MobiShop.
                    </p>
                </div>
            </div>

            {/* Layout Container */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left side: Vertical Tabs (Desktop) */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-3 mb-3 block">Danh mục chính sách</span>
                        {policies.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchParams({ tab: tab.id });
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left group ${
                                    activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500 transition-colors'}>
                                        {tab.icon}
                                    </span>
                                    <span>{tab.label}</span>
                                </div>
                                <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-all ${activeTab === tab.id ? 'opacity-100 text-indigo-600 translate-x-0.5' : 'text-gray-400'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Right side: Detail Policy Content */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[400px]">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 flex items-center gap-2.5 pb-4 border-b border-gray-100">
                                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    {activePolicy.icon}
                                </span>
                                {activePolicy.title}
                            </h2>
                            {activePolicy.content}
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* Need Help Section */}
            <div className="max-w-7xl mx-auto px-6 mt-16 text-center">
                <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 max-w-2xl mx-auto flex flex-col items-center justify-center">
                    <HelpCircle size={32} className="text-indigo-600 mb-3" />
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Bạn chưa tìm thấy thông tin mình cần?</h3>
                    <p className="text-sm text-gray-500 mb-4">Đừng lo lắng! Đội ngũ tư vấn viên nhiệt tình của MobiShop luôn sẵn sàng giải đáp thắc mắc của bạn 24/7.</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a href="tel:19001234" className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs sm:text-sm font-bold shadow-md transition-all">
                            <PhoneCall size={14} /> Tổng đài: 1900.1234 (Miễn phí)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
