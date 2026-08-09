import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Award, Users, MapPin, Phone, Mail, Clock, Sparkles, Smartphone, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-20 px-6 sm:px-12">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                            <Sparkles size={12} /> Về MobiShop
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6"
                    >
                        Nâng Tầm Trải Nghiệm Công Nghệ
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        MobiShop tự hào là hệ thống bán lẻ thiết bị di động, máy tính bảng và phụ kiện công nghệ chính hãng hàng đầu tại Việt Nam, mang những sản phẩm công nghệ tiên tiến nhất tới tay người tiêu dùng.
                    </motion.p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { count: '10+', label: 'Năm hoạt động' },
                        { count: '50+', label: 'Cửa hàng toàn quốc' },
                        { count: '1M+', label: 'Khách hàng tin dùng' },
                        { count: '99.9%', label: 'Độ hài lòng' }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-700">{stat.count}</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mt-1 tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Our Story & Vision */}
            <div className="max-w-7xl mx-auto px-6 mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-6">Câu Chuyện Của Chúng Tôi</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed text-base">
                            <p>
                                Thành lập từ năm 2016, MobiShop khởi đầu với một cửa hàng nhỏ tại TP. Hồ Chí Minh chuyên cung cấp các dòng điện thoại thông minh chính hãng. Bằng nỗ lực không ngừng nghỉ và cam kết mang lại sản phẩm tốt nhất, chúng tôi đã nhanh chóng phát triển vượt bậc.
                            </p>
                            <p>
                                Hiện nay, MobiShop tự hào sở hữu mạng lưới cửa hàng phủ sóng rộng rãi trên cả nước, là đại lý phân phối chiến lược của các tập đoàn công nghệ lớn như Apple, Samsung, Xiaomi, Oppo và Tecno.
                            </p>
                            <p className="font-semibold text-indigo-700">
                                Triết lý hoạt động của chúng tôi là "Khách hàng là trọng tâm". Mỗi nhân viên MobiShop đều nỗ lực mang lại trải nghiệm mua sắm hoàn hảo và sự an tâm tuyệt đối cho khách hàng.
                            </p>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-indigo-50/60 rounded-3xl p-8 border border-indigo-100"
                    >
                        <h3 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                            <Sparkles className="text-indigo-600" /> Tầm Nhìn & Sứ Mệnh
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                                    <Award size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg mb-1">Tầm nhìn</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Trở thành hệ thống bán lẻ công nghệ hàng đầu được yêu thích nhất tại Việt Nam nhờ sự uy tín, phục vụ tận tâm và liên tục sáng tạo trải nghiệm số mới mẻ.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg mb-1">Sứ mệnh</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Đồng hành cùng khách hàng trong kỷ nguyên số bằng các giải pháp công nghệ chính hãng giá tốt, dịch vụ chăm sóc tận tình và chính sách bảo hành đáng tin cậy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Core Values */}
            <div className="bg-white py-20 mt-20 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Giá Trị Cốt Lõi</h2>
                        <p className="text-gray-500 text-sm sm:text-base">
                            Những kim chỉ nam định hình văn hóa làm việc và dịch vụ tại MobiShop qua từng giai đoạn phát triển.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldCheck size={26} className="text-indigo-600" />,
                                title: 'Chính Hãng 100%',
                                desc: 'Chúng tôi cam kết tuyệt đối nói không với hàng dựng, hàng nhái. Mọi thiết bị cung cấp đều có xuất xứ rõ ràng và đầy đủ giấy chứng nhận xuất khẩu.'
                            },
                            {
                                icon: <Users size={26} className="text-indigo-600" />,
                                title: 'Khách Hàng Là Bạn',
                                desc: 'Tư vấn trung thực, tôn trọng nhu cầu thực tế của khách hàng, đem lại phương án tối ưu và tiết kiệm chi phí nhất.'
                            },
                            {
                                icon: <Award size={26} className="text-indigo-600" />,
                                title: 'Hậu Mãi Toàn Diện',
                                desc: 'Chế độ bảo hành 1 đổi 1 nhanh chóng, hỗ trợ cài đặt trọn đời máy và chính sách thu cũ đổi mới cực ưu đãi.'
                            }
                        ].map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                                    {value.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA section */}
            <div className="max-w-7xl mx-auto px-6 mt-20">
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-3xl text-white p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">Trải nghiệm những sản phẩm mới nhất</h2>
                        <p className="text-indigo-100 text-sm sm:text-base font-light">
                            Khám phá ngay bộ sưu tập smartphone, máy tính bảng và phụ kiện chính hãng kèm ngập tràn chương trình ưu đãi hấp dẫn.
                        </p>
                    </div>
                    <div className="relative z-10 shrink-0">
                        <Link to="/products" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3.5 rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg">
                            Mua sắm ngay <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
