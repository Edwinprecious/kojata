import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Star, SearchX, ShoppingCart, X, RotateCcw, Tag } from 'lucide-react';
import { addToCart } from '../features/cart/CartSlice';
import toast from 'react-hot-toast';
import api from '../services/api';

const CategoryPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { isAdmin } = useSelector(state => state.auth);
  
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({ minPrice: '', maxPrice: '', minRating: 0, inStock: false });
  const [appliedFilters, setAppliedFilters] = useState({ minPrice: '', maxPrice: '', minRating: 0, inStock: false });

  // Map URL slugs to exact database category names
  const categoryMap = {
    'home': 'Home & Decor',
    'electronics': 'Electronics',
    'fashion': 'Fashion'
  };

  const isAll = !slug || slug === 'all';
  const dbCategoryName = categoryMap[slug] || slug;

  let categoryTitle = isAll ? "All Collections" : (categoryMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1));
  if (searchQuery) categoryTitle = `Search: "${searchQuery}"`;

  // Fetch from the Backend utilizing URL Params
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        
        // Pass the mapped exact name to the backend instead of the slug
        if (dbCategoryName && dbCategoryName !== 'all') {
          params.append('category', dbCategoryName);
        }

        if (appliedFilters.minPrice) params.append('min_price', appliedFilters.minPrice);
        if (appliedFilters.maxPrice) params.append('max_price', appliedFilters.maxPrice);
        if (appliedFilters.minRating > 0) params.append('rating', appliedFilters.minRating);
        if (appliedFilters.inStock) params.append('in_stock', 'true');

        const [prodRes, catRes] = await Promise.all([
          api.get(`/products/?${params.toString()}`),
          api.get('/categories/')
        ]);
        
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.results || []));
        setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data?.results || []));
      } catch (error) {
        console.error("Error fetching store data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [slug, dbCategoryName, searchQuery, appliedFilters]);

  const getCategoryName = (productCat) => {
    if (typeof productCat === 'object') return productCat.name;
    const cat = categories.find(c => c.id === productCat);
    return cat ? cat.name : 'Product';
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
    setIsFilterMenuOpen(false); 
  };

  const handleResetFilters = () => {
    const reset = { minPrice: '', maxPrice: '', minRating: 0, inStock: false };
    setLocalFilters(reset);
    setAppliedFilters(reset);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-10 font-sans">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 border-b border-gray-100 pb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">ShopWave Exclusive</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-950 tracking-tighter">
            {categoryTitle}
          </h1>
          <p className="text-gray-400 mt-4 max-w-md text-sm font-semibold">
            {searchQuery 
              ? `Showing results matching your search.`
              : `Discover our curated selection of premium ${isAll ? 'goods' : categoryTitle} designed for the modern lifestyle.`}
          </p>
        </motion.div>
        
        <div className="flex items-center gap-3 lg:hidden">
          <button 
            onClick={() => setIsFilterMenuOpen(true)}
            className="flex items-center bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full hover:bg-blue-800 transition-all shadow-md"
          >
            <Filter size={14} className="mr-2" /> Filters
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* FILTERS SIDEBAR */}
        <aside className={`
          ${isFilterMenuOpen ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm p-4 flex items-center justify-center' : 'hidden lg:block'} 
          w-full lg:w-72 shrink-0 lg:sticky lg:top-28
        `}>
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm w-full max-w-sm mx-auto lg:max-w-none relative">
            
            {isFilterMenuOpen && (
              <button onClick={() => setIsFilterMenuOpen(false)} className="absolute top-6 right-6 lg:hidden text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            )}

            <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
              <h3 className="font-black text-lg text-blue-950 flex items-center"><Filter size={18} className="mr-2"/> Filters</h3>
              <button onClick={handleResetFilters} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 flex items-center">
                <RotateCcw size={12} className="mr-1"/> Reset
              </button>
            </div>
            
            {/* Price Range */}
            <div className="mb-8">
               <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-3">Price Range</h4>
               <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    placeholder="Min $" 
                    value={localFilters.minPrice}
                    onChange={(e) => setLocalFilters({...localFilters, minPrice: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 transition-colors" 
                  />
                  <span className="text-gray-300 font-black">-</span>
                  <input 
                    type="number" 
                    placeholder="Max $" 
                    value={localFilters.maxPrice}
                    onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 transition-colors" 
                  />
               </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-8">
               <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-3">Minimum Rating</h4>
               <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                     <button 
                        key={star}
                        onClick={() => setLocalFilters({...localFilters, minRating: star})}
                        className={`p-2 rounded-lg transition-all ${localFilters.minRating >= star ? 'bg-yellow-50 scale-110' : 'hover:bg-gray-50'}`}
                      >
                       <Star 
                        size={20} 
                        fill={localFilters.minRating >= star ? "currentColor" : "none"} 
                        className={localFilters.minRating >= star ? "text-yellow-400" : "text-gray-300"} 
                       />
                     </button>
                  ))}
               </div>
            </div>

            {/* In Stock Toggle */}
            <div className="mb-8 bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
               <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-black text-blue-900 text-sm">In Stock Only</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={localFilters.inStock} 
                      onChange={(e) => setLocalFilters({...localFilters, inStock: e.target.checked})}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${localFilters.inStock ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localFilters.inStock ? 'translate-x-4' : ''}`}></div>
                  </div>
               </label>
            </div>

            <button 
              onClick={handleApplyFilters} 
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
            >
               Apply Filters
            </button>
          </div>
        </aside>

        {/* Product Grid Main Area */}
        <main className="flex-1 w-full">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-900 font-bold uppercase tracking-widest text-xs">Loading Products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-gray-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-gray-300 mb-6 shadow-sm">
                <SearchX size={40} />
              </div>
              <p className="text-blue-950 font-black text-xl mb-2">No products found</p>
              <p className="text-gray-400 font-semibold text-sm">Try adjusting your filters or search terms.</p>
              <button onClick={handleResetFilters} className="text-blue-600 font-black text-xs uppercase tracking-widest mt-6 block mx-auto hover:text-blue-700 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product, index) => {
                const rawPrice = product.price ?? 0;
                const rawOriginalPrice = product.original_price ?? product.originalPrice ?? 0;
                
                const currentPrice = parseFloat(rawPrice) || 0;
                const originalPrice = parseFloat(rawOriginalPrice) || 0;
                
                const hasDiscount = originalPrice > currentPrice && originalPrice > 0;
                const discountPercentage = product.discount_percentage || (hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

                return (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/product/${product.id}`} className=" group relative bg-white rounded-[2rem] p-3 border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 h-full flex flex-col">
                      
                      {/* Image Container */}
                      <div className="aspect-square overflow-hidden rounded-3xl bg-gray-50 relative shrink-0">
                        {/* Dynamic Flash Deal Badge */}
                        {hasDiscount && (
                          <div className="absolute top-3 left-3 z-10 bg-orange-200/80 backdrop-blur-md text-orange-800 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center shadow-sm">
                            <Tag size={12} className="mr-1"/> Flash Deal
                          </div>
                        )}

                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs uppercase tracking-widest">
                            No Image
                          </div>
                        )}
                        
                        {/* Floating Action Button on Hover - HIDDEN FOR ADMINS */}
                        {!isAdmin && product.stock > 0 && (
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10">
                            <button 
                              onClick={(e) => { 
                                e.preventDefault(); 
                                dispatch(addToCart({ ...product, quantity: 1 }));
                                toast.success(`${product.name} added to cart!`, {
                                  icon: '🛒',
                                  style: { borderRadius: '16px', fontWeight: '800' }
                                });
                              }}
                              className="w-12 h-12 bg-white text-blue-900 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-colors"
                            >
                              <ShoppingCart size={18} />
                            </button>
                          </div>
                        )}

                        {!isAdmin && product.stock <= 0 && (
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10">
                            <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center shadow-lg cursor-not-allowed">
                              <SearchX size={18} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Details Container */}
                      <div className="pt-5 px-3 pb-2 flex flex-col gap-1 flex-1 justify-between">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            {getCategoryName(product.category)}
                          </p>
                          <h3 className="text-sm font-extrabold text-blue-950 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </div>
                        
                        <div className="flex justify-between items-end mt-4">
                          {/* Updated Price Block */}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-black text-blue-900">${currentPrice.toFixed(2)}</p>
                              {hasDiscount && (
                                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm">
                                  -{discountPercentage}%
                               </span>
                              )}
                            </div>
                            {hasDiscount ? (
                              <p className="text-[10px] text-gray-400 line-through mt-0.5">${originalPrice.toFixed(2)}</p>
                            ) : (
                              <p className="text-[10px] text-transparent select-none mt-0.5">$0.00</p>
                            )}
                          </div>
                          
                          <div className="flex items-center text-yellow-400 bg-yellow-50 px-2 py-1 rounded-full mb-1">
                            <Star size={10} fill="currentColor" className="mr-1" />
                            <span className="text-[10px] font-black text-yellow-700">{product.rating || "0.0"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Exclusive Perks Section */}
      <footer className="mt-32 pt-16 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center md:text-left">
          <h4 className="text-xs font-black uppercase tracking-widest text-blue-900 mb-3">Authenticity</h4>
          <p className="text-xs text-gray-400 leading-relaxed font-semibold">Every item in our collection is 100% verified for quality and origin.</p>
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-xs font-black uppercase tracking-widest text-blue-900 mb-3">Global Logistics</h4>
          <p className="text-xs text-gray-400 leading-relaxed font-semibold">Seamless express shipping to over 120 countries worldwide.</p>
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-xs font-black uppercase tracking-widest text-blue-900 mb-3">Private Concierge</h4>
          <p className="text-xs text-gray-400 leading-relaxed font-semibold">24/7 dedicated support for our exclusive ShopWave members.</p>
        </div>
      </footer>
    </div>
  );
};

export default CategoryPage;