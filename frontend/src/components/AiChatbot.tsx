import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendAiMessage, type ChatMessage } from '../api/ai';
import { productApi } from '../api/productApi';
import type { ProductResponse } from '../types/product';

interface AiChatbotProps {
    onClose: () => void;
}

const renderMessageContent = (text: string, isBot: boolean) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        const linkText = match[1];
        const linkUrl = match[2];

        if (linkUrl.startsWith('/product/')) {
            parts.push(
                <Link 
                    key={match.index} 
                    to={linkUrl} 
                    className={`font-semibold underline transition-colors ${
                        isBot 
                            ? 'text-indigo-600 hover:text-indigo-800' 
                            : 'text-yellow-300 hover:text-yellow-200'
                    }`}
                >
                    {linkText}
                </Link>
            );
        } else {
            parts.push(
                <a 
                    key={match.index} 
                    href={linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`font-semibold underline transition-colors ${
                        isBot 
                            ? 'text-indigo-500 hover:text-indigo-700' 
                            : 'text-indigo-200 hover:text-indigo-100'
                    }`}
                >
                    {linkText}
                </a>
            );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
};

const extractProductIds = (text: string): number[] => {
    const regex = /\/product\/(\d+)/g;
    const ids: number[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        const id = parseInt(match[1], 10);
        if (!ids.includes(id)) {
            ids.push(id);
        }
    }
    return ids;
};

function ProductCard({ id }: { id: number }) {
    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        productApi.getProductById(id)
            .then(res => {
                if (isMounted) {
                    setProduct(res);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error(err);
                if (isMounted) setLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="w-[200px] h-[72px] bg-white border border-gray-100 rounded-xl p-2 flex items-center gap-2 animate-pulse">
                <div className="w-12 h-12 bg-gray-150 rounded-lg" />
                <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        );
    }

    if (!product) return null;

    const priceText = product.minPrice 
        ? `${product.minPrice.toLocaleString('vi-VN')}đ` 
        : 'Liên hệ';

    return (
        <Link 
            to={`/product/${product.id}`}
            className="w-[220px] bg-white border border-gray-100 rounded-xl p-2.5 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 group text-left"
        >
            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                <img 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'} 
                    alt={product.name} 
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100';
                    }}
                />
            </div>
            <div className="flex-grow min-w-0">
                <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">{product.brand}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">{priceText}</p>
            </div>
        </Link>
    );
}

export default function AiChatbot({ onClose }: AiChatbotProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { 
            id: 'welcome', 
            text: 'Chào bạn! Mình là trợ lý ảo AI của MobiShop. Mình được xây dựng trên mô hình RAG để giúp bạn tìm kiếm và tư vấn thông tin điện thoại di động chính xác nhất tại cửa hàng. Bạn cần mình hỗ trợ thông tin gì?', 
            isBot: true 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        const userMsgId = Date.now().toString();

        setMessages(prev => [...prev, { id: userMsgId, text: userMsg, isBot: false }]);
        setIsLoading(true);

        try {
            const reply = await sendAiMessage(userMsg);
            setMessages(prev => [...prev, { id: Date.now().toString() + '-bot', text: reply, isBot: true }]);
        } catch (error: any) {
            console.error(error);
            let errMsg = 'Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau!';
            
            // Check for rate limit (429 status code)
            if (error.response && error.response.status === 429) {
                errMsg = error.response.data?.reply || 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi 1 phút trước khi hỏi tiếp nhé!';
            }
            
            setMessages(prev => [...prev, { id: Date.now().toString() + '-err', text: errMsg, isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">AI Trợ Lý Cửa Hàng</h3>
                        <p className="text-[10px] text-indigo-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            Đang hoạt động (RAG)
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-indigo-100 hover:text-white"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 flex flex-col gap-4">
                {messages.map(msg => {
                    const productIds = msg.isBot ? extractProductIds(msg.text) : [];
                    return (
                        <div key={msg.id} className="flex flex-col gap-2">
                            <div className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                    msg.isBot 
                                        ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
                                        : 'bg-indigo-600 text-white rounded-tr-sm'
                                }`}>
                                    <p className="whitespace-pre-wrap">{renderMessageContent(msg.text, msg.isBot)}</p>
                                </div>
                            </div>
                            {productIds.length > 0 && (
                                <div className="flex flex-col gap-1.5 pl-2">
                                    <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Sản phẩm liên quan</span>
                                    <div className="flex flex-wrap gap-2">
                                        {productIds.map(id => (
                                            <ProductCard key={id} id={id} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi về iPhone, Samsung, cấu hình, giá bán..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                    disabled={isLoading}
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                >
                    <Send size={16} className="ml-0.5" />
                </button>
            </form>
        </div>
    );
}
