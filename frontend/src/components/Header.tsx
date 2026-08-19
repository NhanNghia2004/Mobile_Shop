import { Search, ShoppingCart, User, Phone, Menu, X, LogOut, Settings, Headphones, MapPin, Binoculars, ChevronDown, LogIn, UserPlus, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { productApi } from '../api/productApi';

interface UserType {
    username: string;
    email: string;
    avatarUrl?: string;
}

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        fetchUser();
        fetchCartCount();

        window.addEventListener('storage', fetchUser);
        window.addEventListener('cartUpdated', fetchCartCount);

        return () => {
            window.removeEventListener('storage', fetchUser);
            window.removeEventListener('cartUpdated', fetchCartCount);
        };
    }, []);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCartCount(0);
        setShowLogoutConfirm(false);
        navigate('/login');
    };

    return (
        <header className="bg-white sticky top-0 z-50 font-sans shadow-md">
            {/* Top Promo Bar */}
            <div className="bg-indigo-700 text-white py-1.5 px-6 text-center text-[11px] font-medium tracking-wide">
                Săn iPhone 15 Pro Max giảm đến 5 triệu đồng.
                <Link to="/" className="underline ml-1 font-bold">Xem ngay</Link>
            </div>

            {/* Main Header (Logo, Hotline, Store, Search, Icons) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
                <div className="flex items-center justify-between h-20 md:h-24 gap-4 md:gap-6">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl lg:text-3xl font-black text-indigo-700 tracking-tighter flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
                                <Phone size={20} className="text-white" />
                            </div>
                            <span>MOBI<span className="text-gray-900">SHOP</span></span>
                        </Link>
                    </div>

                    {/* Hotline (Like Reference Image) */}
                    <div className="hidden xl:flex items-center gap-2 text-xs font-bold text-gray-700 whitespace-nowrap">
                        <Headphones size={20} className="text-indigo-700" />
                        <span>HOTLINE: <span className="text-indigo-600">0977508430</span></span>
                    </div>

                    {/* Hệ thống cửa hàng (Like Reference Image) */}
                    <Link to="/products" className="hidden lg:flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-indigo-700 transition-colors uppercase whitespace-nowrap">
                        <MapPin size={20} className="text-indigo-700" />
                        <span>Hệ thống cửa hàng</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md xl:max-w-lg relative">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchVal.trim()) {
                                    setShowSuggestions(false);
                                    navigate(`/products?keyword=${encodeURIComponent(searchVal.trim())}`);
                                }
                            }}
                            className="w-full relative"
                        >
                            <div className="relative flex items-center w-full">
                                <input
                                    name="search"
                                    type="text"
                                    value={searchVal}
                                    onChange={(e) => setSearchVal(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="Tìm sản phẩm..."
                                    className="w-full bg-[#f5f6f7] border border-gray-150 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-gray-700"
                                />
                                <button type="submit" className="absolute right-3 text-indigo-700 hover:opacity-80 transition-opacity">
                                    <Search size={18} />
                                </button>
                            </div>
                            
                            {/* Dropdown Suggestions */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50"
                                    >
                                        <div className="max-h-[400px] overflow-y-auto">
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
                                                        <img src={item.imageUrl} alt={item.label} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Search size={16} />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
                                                        {item.category && <p className="text-[11px] text-gray-500 uppercase font-medium mt-0.5">{item.category}</p>}
                                                    </div>
                                                    {item.count != null && (
                                                        <span className="text-xs font-medium text-gray-400">({item.count})</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {suggestions.length > 0 && (
                                            <div 
                                                onClick={() => {
                                                    setShowSuggestions(false);
                                                    navigate(`/products?keyword=${encodeURIComponent(searchVal.trim())}`);
                                                }}
                                                className="block text-center py-3 text-sm text-indigo-600 font-bold hover:bg-gray-50 border-t border-gray-100 cursor-pointer transition-colors"
                                            >
                                                Xem tất cả kết quả cho "{searchVal}"
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        <Link to="/profile?tab=orders" className="hidden lg:flex flex-col items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors group cursor-pointer">
                            <div className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center bg-white group-hover:bg-indigo-50 transition-colors shadow-sm">
                                <Binoculars size={18} strokeWidth={1.5} className="group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                            <span className="text-[10px] uppercase font-bold mt-1 text-gray-700 tracking-wider">Tra cứu</span>
                        </Link>

                        <div className="relative group flex flex-col items-center justify-center cursor-pointer">
                            <Link to={user ? "/profile" : "/login"} className="flex flex-col items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.username} className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
                                ) : (
                                    <div className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center bg-white hover:bg-indigo-50 transition-colors shadow-sm">
                                        <User size={18} strokeWidth={1.5} className="group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                )}
                                <span className="text-[10px] uppercase font-bold mt-1 text-gray-700 tracking-wider text-center whitespace-nowrap hidden sm:block">{user ? user.username : 'Tài khoản'}</span>
                            </Link>
                            
                            {/* Hover Menu for User & Guest */}
                            <div className="absolute right-1/2 translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-2 w-48 flex flex-col gap-1">
                                    {user ? (
                                        <>
                                            <Link to="/profile" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors">
                                                <Settings size={16} className="text-gray-500" /> Hồ sơ
                                            </Link>
                                            <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg text-left flex items-center gap-2 transition-colors">
                                                <LogOut size={16} className="text-red-500" /> Đăng xuất
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2 transition-colors">
                                                <LogIn size={16} className="text-indigo-600" /> Đăng nhập
                                            </Link>
                                            <Link to="/register" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors">
                                                <UserPlus size={16} className="text-gray-500" /> Đăng ký
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link to="/cart" className="flex flex-col items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors relative group">
                            <div className="relative">
                                <div className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center bg-white group-hover:bg-indigo-50 transition-colors shadow-sm">
                                    <ShoppingCart size={18} strokeWidth={1.5} className="group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-[#ff5b2e] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{cartCount}</span>
                                )}
                            </div>
                            <span className="text-[10px] uppercase font-bold mt-1 text-gray-700 tracking-wider hidden sm:block">Giỏ hàng</span>
                        </Link>

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

            {/* Bottom Navigation Row (Dark Theme with Balanced Spacing & Dropdown) */}
            <div className="bg-[#2a3038] hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex justify-center gap-8 lg:gap-12 items-center h-12 text-[13px] font-bold text-white uppercase tracking-wider w-full">
                        <Link to="/" className="hover:text-indigo-400 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-indigo-400 py-3.5">Trang chủ</Link>
                        
                        {/* Dropdown for Tất cả sản phẩm */}
                        <div className="relative group py-3.5">
                            <Link to="/products" className="hover:text-indigo-400 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-indigo-400 flex items-center gap-1.5">
                                Tất cả sản phẩm
                                <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                            </Link>
                            
                            {/* Dropdown List */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[180px]">
                                <div className="bg-[#2a3038] border border-gray-700 shadow-2xl rounded-lg py-2 flex flex-col overflow-hidden">
                                    <Link to="/products?brand=Apple" className="px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-colors border-b border-gray-700/50">
                                        iPhone
                                    </Link>
                                    <Link to="/products?brand=Samsung" className="px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-colors border-b border-gray-700/50">
                                        Samsung
                                    </Link>
                                    <Link to="/products?brand=Oppo" className="px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-colors border-b border-gray-700/50">
                                        Oppo
                                    </Link>
                                    <Link to="/products?brand=Tecno" className="px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-colors border-b border-gray-700/50">
                                        Tecno
                                    </Link>
                                    <Link to="/products?brand=Xiaomi" className="px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-colors">
                                        Xiaomi
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link to="/promotions" className="hover:text-indigo-400 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-indigo-400 py-3.5">Khuyến mãi</Link>
                        <Link to="/news" className="hover:text-indigo-400 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-indigo-400 py-3.5">Tin tức</Link>
                        <Link to="/about" className="hover:text-indigo-400 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-indigo-400 py-3.5">Giới thiệu</Link>
                        <Link to="/contact" className="hover:text-indigo-400 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-indigo-400 py-3.5">Liên hệ</Link>
                        <Link to="/policies" className="hover:text-indigo-400 transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-indigo-400 py-3.5">Chính sách</Link>
                    </nav>
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
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
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

                            {/* Mobile Search */}
                            <form 
                                className="mb-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchVal.trim()) {
                                        setIsMenuOpen(false);
                                        navigate(`/products?keyword=${encodeURIComponent(searchVal.trim())}`);
                                    }
                                }}
                            >
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchVal}
                                        onChange={(e) => setSearchVal(e.target.value)}
                                        placeholder="Tìm kiếm..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </form>

                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-gray-700 uppercase">Trang chủ</Link>
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-gray-700 uppercase">Tất cả sản phẩm</Link>
                            <div className="pl-4 border-l border-gray-200 ml-2 space-y-1">
                                <Link to="/products?brand=Apple" onClick={() => setIsMenuOpen(false)} className="block px-3 py-1 text-xs font-semibold text-gray-500 uppercase">iPhone</Link>
                                <Link to="/products?brand=Samsung" onClick={() => setIsMenuOpen(false)} className="block px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Samsung</Link>
                                <Link to="/products?brand=Oppo" onClick={() => setIsMenuOpen(false)} className="block px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Oppo</Link>
                                <Link to="/products?brand=Tecno" onClick={() => setIsMenuOpen(false)} className="block px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Tecno</Link>
                                <Link to="/products?brand=Xiaomi" onClick={() => setIsMenuOpen(false)} className="block px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Xiaomi</Link>
                            </div>
                            <Link to="/promotions" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-gray-700 uppercase">Khuyến mãi</Link>
                            <Link to="/news" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-gray-700 uppercase">Tin tức</Link>
                            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-gray-700 uppercase">Giới thiệu</Link>
                            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-gray-700 uppercase">Liên hệ</Link>
                            <Link to="/policies" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-gray-700 uppercase">Chính sách</Link>

                            <hr className="my-2 border-gray-100" />

                            {user ? (
                                <>
                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 uppercase">
                                        <Settings size={18} /> Hồ sơ cá nhân
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 uppercase w-full text-left"
                                    >
                                        <LogOut size={18} /> Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-1">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-indigo-600 uppercase">
                                        <LogIn size={18} /> Đăng nhập
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 uppercase">
                                        <UserPlus size={18} /> Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận đăng xuất</h3>
                        <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4.5 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={confirmLogout}
                                className="px-4.5 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm shadow-sm"
                            >
                                OK
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </header>
    );
}