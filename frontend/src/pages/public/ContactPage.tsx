import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Headphones, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Email, Lời nhắn)');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            toast.success('Gửi tin nhắn liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Header section with clean design */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-16 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl font-black tracking-tight mb-4"
                    >
                        Liên Hệ Với Chúng Tôi
                    </motion.h1>
                    <p className="text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        Bạn cần hỗ trợ về sản phẩm, chính sách bảo hành, hoặc có bất kỳ câu hỏi nào khác? Điền vào biểu mẫu bên dưới hoặc kết nối trực tiếp với chúng tôi.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Contact info cards */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                                <Phone size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Hotline Hỗ Trợ</h3>
                                <p className="text-lg font-black text-indigo-700">1900 6750</p>
                                <p className="text-xs text-gray-500 mt-1">Phục vụ 24/7 (miễn phí cuộc gọi)</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                                <Mail size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Email Liên Hệ</h3>
                                <p className="text-sm font-semibold text-gray-700">support@mobishop.vn</p>
                                <p className="text-sm font-semibold text-gray-700">cooperation@mobishop.vn</p>
                                <p className="text-xs text-gray-500 mt-1">Phản hồi trong vòng 24 giờ</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Văn Phòng Điều Hành</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    70 Lữ Gia, Phường 15, Quận 11, TP. Hồ Chí Minh
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                                <Clock size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Giờ Làm Việc</h3>
                                <p className="text-sm text-gray-700 font-semibold">Cửa hàng: 08:00 - 22:00</p>
                                <p className="text-sm text-gray-700 font-semibold">Online Chat: 24/7</p>
                                <p className="text-xs text-gray-500 mt-1">Áp dụng tất cả các ngày trong tuần</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact form */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 lg:col-span-2">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                            <MessageSquare className="text-indigo-600" /> Gửi Tin Nhắn Cho Chúng Tôi
                        </h2>
                        <p className="text-gray-500 text-sm mb-8">
                            Hãy chia sẻ câu hỏi hoặc ý kiến đóng góp của bạn. Đội ngũ CSKH sẽ phản hồi lại bạn sớm nhất có thể.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl py-3 px-4 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Địa chỉ Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="email@example.com"
                                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl py-3 px-4 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0977xxxxxx"
                                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl py-3 px-4 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Chủ đề liên hệ
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Hỏi về bảo hành, mua sắm..."
                                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl py-3 px-4 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Lời nhắn của bạn <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Điền nội dung chi tiết tin nhắn..."
                                    className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl py-3 px-4 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                                    isSubmitting
                                        ? 'bg-indigo-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} /> Gửi tin nhắn liên hệ
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Map iframe placeholder using standard beautiful embedded styled container */}
                <div className="mt-16 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm overflow-hidden">
                    <div className="rounded-2xl overflow-hidden h-[400px] w-full border border-gray-150">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1y41865239097723908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752edd082627cb%3A0x673ed158f4a64d1f!2zNzAgTOG7ryBHaWEsIFBoxbDhu51uZyAxNSwgUXUgMTEsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen={true} 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="MobiShop Map Location"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
