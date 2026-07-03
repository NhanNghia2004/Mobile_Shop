import { Search, ShoppingCart, User, Phone, Menu, X, LogOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { productApi } from '../api/productApi';

// 1. Định nghĩa kiểu dữ liệu cho User để hết lỗi đỏ
interface UserType {
    username: string;
    email: string;
    avatarUrl?: string;
}

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // 2. Khởi tạo state với kiểu UserType hoặc null
    const [user, setUser] = useState<UserType | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [searchVal, setSearchVal] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!searchVal.trim()) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const data = await productApi.getSuggestions(searchVal);
                setSuggestions(data.suggestions || []);
            } catch (error) {
                console.error(error);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchVal]);

    // Hàm lấy dữ liệu user từ local
    const fetchUser = () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined') {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    const fetchCartCount = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setCartCount(0);
            return;
        }
        try {
            const { data } = await axiosInstance.get('/cart');
            setCartCount(data.totalQuantity || 0);
        } catch (error) {
            setCartCount(0);
        }
    };

    useEffect(() => {
        fetchUser(); // Lấy user khi mount component
        fetchCartCount(); // Lấy số lượng giỏ hàng khi mount component

        // Lắng nghe sự kiện thay đổi storage để cập nhật UI ngay lập tức
        window.addEventListener('storage', fetchUser);
        window.addEventListener('cartUpdated', fetchCartCount);

        return () => {
            window.removeEventListener('storage', fetchUser);
            window.removeEventListener('cartUpdated', fetchCartCount);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCartCount(0);
        alert("Bạn đã đăng xuất!");
        navigate('/login'); // Dùng navigate mượt mà
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 font-sans">
            {/* Top Bar */}
            <div className="bg-indigo-700 text-white py-2 px-6 text-center text-xs font-medium">
                Săn iPhone 15 Pro Max giảm đến 5 triệu đồng.
                <Link to="/" className="underline ml-1">Xem ngay</Link>
            </div>

            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center mr-8 lg:mr-12">
                        <Link to="/" className="text-2xl font-black text-indigo-700 tracking-tighter flex items-center gap-1 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center">
                                <Phone size={18} className="text-white" />
                            </div>
                            <span>MOBI<span className="text-gray-900">SHOP</span></span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex space-x-8 text-sm font-bold text-gray-700 uppercase tracking-wide">
                        <Link to="/" className="hover:text-indigo-600 transition-colors">Trang chủ</Link>
                        <Link to="/products" className="hover:text-indigo-600 transition-colors">Tất cả điện thoại</Link>
                        <Link to="/products?brand=Apple" className="hover:text-indigo-600 transition-colors">iPhone</Link>
                        <Link to="/products?brand=Samsung" className="hover:text-indigo-600 transition-colors">Samsung</Link>
                        <Link to="/products?brand=Xiaomi" className="hover:text-indigo-600 transition-colors">Xiaomi</Link>
                    </nav>

                    {/* Search Bar */}
                    <div className="hidden lg:flex flex-1 max-w-md mx-8">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchVal.trim()) {
                                    setShowSuggestions(false);
                                    navigate(`/products?keyword=${encodeURIComponent(searchVal.trim())}`);
                                }
                            }}
                            className="relative w-full"
                        >
                            <input
                                name="search"
                                type="text"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Tìm kiếm sản phẩm thông minh..."
                                className="w-full bg-gray-100 border-none rounded-xl py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                                <Search size={18} />
                            </button>

                            {/* Dropdown Suggestions */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                                    >
                                        <div className="max-h-96 overflow-y-auto">
                                            {suggestions.map((item, idx) => (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => {
                                                        if (item.type === 'PRODUCT') {
                                                            navigate(`/product/${item.value}`);
                                                        } else {
                                                            navigate(`/products?${item.type.toLowerCase()}=${item.value}`);
                                                        }
                                                        setShowSuggestions(false);
                                                        setSearchVal('');
                                                    }}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
                                                >
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.label} className="w-10 h-10 object-cover rounded-lg" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Search size={16} />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
                                                        {item.category && <p className="text-xs text-gray-500">{item.category}</p>}
                                                    </div>
                                                    {item.count != null && (
                                                        <span className="text-xs font-medium text-gray-400">({item.count})</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>

                    {/* Icons Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/cart" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all relative">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>
                            )}
                        </Link>

                        {/* Logic hiển thị User / Login */}
                        {user ? (
                            <div className="flex items-center gap-3 ml-2 border-l pl-4 border-gray-100">
                                <Link to="/profile" className="flex items-center gap-2 group">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.username}
                                            className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    <span className="hidden lg:block text-sm font-bold text-gray-700">{user.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Đăng xuất"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden sm:flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                                <User size={22} />
                                <span className="text-sm font-bold">Đăng nhập</span>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {user && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.username}
                                            className="w-10 h-10 rounded-full object-cover border border-indigo-200"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">@{user.username}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-gray-700">Trang chủ</Link>
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-gray-700">Tất cả điện thoại</Link>
                            <Link to="/products?brand=Apple" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-gray-700">iPhone</Link>
                            <Link to="/products?brand=Samsung" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-gray-700">Samsung</Link>
                            <Link to="/products?brand=Xiaomi" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-gray-700">Xiaomi</Link>

                            <hr className="my-2 border-gray-100" />

                            {user ? (
                                <>
                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-base font-bold text-gray-700">
                                        <Settings size={18} /> Hồ sơ cá nhân
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-3 py-2 text-base font-bold text-red-600 w-full text-left"
                                    >
                                        <LogOut size={18} /> Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-indigo-600">Đăng nhập / Đăng ký</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}