import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../features/auth/authSlice';
import { 
  ShoppingCart, Video, Search, ChevronDown, 
  Menu, X, Laptop, ShoppingBag, 
  Watch, Home as HomeIcon, LogOut, User, Sparkles, Shield,
  Footprints, Tag 
} from 'lucide-react';
import { toggleCart } from '../../features/cart/CartSlice';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { slugify } from '../../utils/slug';
import CategoryMegaMenu from './CategoryMegaMenu';

// Cosmetic icon/color palette cycled through for whatever categories exist in
// the database. Categories are no longer hardcoded, so we can't hand-pick an
// icon per category name anymore -- we just cycle through a nice palette.
const CATEGORY_STYLES = [
  { icon: <Laptop size={16}/>, color: 'text-orange-500' },
  { icon: <ShoppingBag size={16}/>, color: 'text-pink-500' },
  { icon: <Watch size={16}/>, color: 'text-blue-500' },
  { icon: <HomeIcon size={16}/>, color: 'text-green-500' },
  { icon: <Sparkles size={16}/>, color: 'text-purple-500' },
  { icon: <Footprints size={16}/>, color: 'text-gray-500' },
  { icon: <Tag size={16}/>, color: 'text-red-500' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navCategories, setNavCategories] = useState([]);
  
  // NOTE: this ref is now actually attached (see the profile dropdown wrapper
  // below). Previously it was declared but never bound to an element, so
  // dropdownRef.current stayed null and the click-outside handler never fired.
  const profileRef = useRef(null);

  const { isAuthenticated, isAdmin } = useSelector((state) => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Pull categories straight from the database instead of hardcoding them, so
  // any category an admin adds shows up here immediately.
  useEffect(() => {
    let isMounted = true;
    api.get('/categories/')
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        const mapped = list.map((cat, i) => ({
          id: cat.id,
          name: cat.name,
          slug: slugify(cat.name),
          ...CATEGORY_STYLES[i % CATEGORY_STYLES.length],
        }));
        setNavCategories(mapped);
      })
      .catch((err) => console.error('Failed to load categories:', err));
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    dispatch(logout()); 
    toast.success("Signed out successfully");
    
    // A 0ms timeout acts as a "next tick" delay
    setTimeout(() => {
      navigate('/');
    }, 0);
    
    closeMenu();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${searchQuery}`);
      setIsMenuOpen(false);
      setSearchQuery('');
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsProfileDropdownOpen(false);
    setIsMobileProfileOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white h-20 px-4 md:px-6 font-sans border-b border-gray-100">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            type="button"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="lg:hidden p-2 -ml-2 text-blue-900"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <Link to="/" onClick={closeMenu} className="text-xl md:text-2xl font-black text-blue-900 flex items-center shrink-0">
            <span className="bg-blue-600 text-white p-1 rounded-md mr-2">
              <Video size={20}/>
            </span> 
            ShopWave
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative group">
          <input 
            type="text"
            placeholder="Search for premium products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
        </form>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-6 text-sm font-bold text-gray-600 mr-4">
            
            <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <HomeIcon size={16} /> Home
            </Link>

            <CategoryMegaMenu categories={navCategories} />

            <Link to="/deals" className="hover:text-blue-600 transition-colors">Deals</Link>
            <Link to="/live" className="text-red-600 hover:text-red-700 transition-colors flex items-center">
              <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span> Live
            </Link>
          </div>

          {!isAdmin && (
            <button 
              onClick={() => dispatch(toggleCart())}
              className="bg-blue-900 text-white px-4 py-2.5 rounded-2xl flex items-center text-sm font-bold shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all"
            >
              <ShoppingCart size={18} className="md:mr-2"/> 
              <span className="hidden md:inline">Cart</span>
              <span className="ml-2 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">{items.length}</span>
            </button>
          )}

          <div className="hidden lg:flex items-center border-l pl-4 border-gray-100 gap-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin-dashboard" title="Admin Dashboard" className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all">
                    <Shield size={20} />
                  </Link>
                )}
                
                {/* Desktop Profile Dropdown */}
                <div 
                  ref={profileRef}
                  className="relative py-2" 
                  onMouseEnter={() => setIsProfileDropdownOpen(true)}
                  onMouseLeave={() => setIsProfileDropdownOpen(false)}
                >
                  <button 
                    type="button"
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                    aria-label="Account menu"
                    onClick={() => setIsProfileDropdownOpen((v) => !v)}
                    className="p-2 bg-gray-50 text-blue-900 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-1.5"
                  >
                    <User size={20} />
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-blue-900/5 py-2 overflow-hidden z-50"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 w-full"
                        >
                          <User size={16} /> My Profile
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3 w-full text-left"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-sm font-black text-blue-900 uppercase tracking-widest">Sign In</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Join</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-0 w-full bg-white shadow-2xl border-t border-gray-100 p-4 lg:hidden flex flex-col gap-4 max-h-[calc(100dvh-80px)] overflow-y-auto z-50 overscroll-contain"
          >
            <form onSubmit={handleSearch} className="relative w-full mb-2 shrink-0">
              <input 
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:border-blue-500"
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            </form>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <Link to="/" onClick={closeMenu} className="p-3 text-blue-900 font-bold bg-blue-50 rounded-xl flex items-center justify-center col-span-2">
                <HomeIcon size={18} className="mr-2" /> Home
              </Link>
              <Link to="/deals" onClick={closeMenu} className="p-3 text-blue-900 font-bold bg-blue-50 rounded-xl flex items-center justify-center">
                🔥 Flash Deals
              </Link>
              <Link to="/live" onClick={closeMenu} className="p-3 text-red-600 font-bold bg-red-50 rounded-xl flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span> Watch Live
              </Link>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden mt-2 bg-gray-50 flex flex-col shrink-0">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <Link 
                  to="/category/all" 
                  onClick={closeMenu} 
                  className="p-4 flex-1 hover:text-blue-600 transition-colors"
                >
                  Browse Categories 
                </Link>
                <button 
                  type="button"
                  aria-expanded={isDropdownOpen}
                  aria-label={isDropdownOpen ? "Hide categories" : "Show categories"}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="p-4 border-l border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-white overflow-hidden"
                  >
                    {navCategories.length === 0 ? (
                      <p className="p-4 border-t border-gray-50 text-sm font-semibold text-gray-400">
                        No categories yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border-t border-gray-50">
                        {navCategories.map((cat) => (
                          <Link 
                            key={cat.id ?? cat.slug}
                            to={`/category/${cat.slug}`}
                            onClick={closeMenu}
                            className="min-h-[52px] px-3 py-2.5 rounded-xl flex items-center gap-3 min-w-0 text-sm font-semibold text-gray-700 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                          >
                            <span className={`${cat.color} bg-gray-50 p-2 rounded-lg shrink-0`}>{cat.icon}</span>
                            <span className="capitalize whitespace-nowrap overflow-hidden text-ellipsis">{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3 pb-6 shrink-0">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin-dashboard" onClick={closeMenu} className="p-4 bg-purple-50 rounded-2xl font-bold flex justify-center items-center gap-2 text-purple-700">
                      <Shield size={18} /> Admin Dashboard
                    </Link>
                  )}
                  
                  {/* Mobile Profile Accordion */}
                  <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white flex flex-col shrink-0">
                    <button 
                      onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)} 
                      className="p-4 flex items-center justify-between font-bold text-blue-900 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="flex items-center gap-2"><User size={18} /> My Account</span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isMobileProfileOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isMobileProfileOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-white"
                        >
                          <div className="flex flex-col">
                            <Link to="/profile" onClick={closeMenu} className="p-4 border-t border-gray-50 flex items-center gap-3 text-sm font-semibold text-gray-600 hover:bg-blue-50 transition-colors">
                              <User size={16} /> My Profile
                            </Link>
                            <button onClick={handleLogout} className="p-4 border-t border-gray-50 flex items-center gap-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left w-full">
                              <LogOut size={16} /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={closeMenu} className="p-4 border-2 border-blue-900 text-blue-900 rounded-2xl font-black text-center uppercase tracking-widest text-xs">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={closeMenu} className="p-4 bg-blue-600 text-white rounded-2xl font-black text-center uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20">
                    Join ShopWave
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;