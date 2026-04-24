import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, Star, SearchX, ShoppingCart } from 'lucide-react';
import api from '../services/api';

const CategoryPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/'),
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
  }, []);

  const isAll = !slug || slug === 'all';
  
  let categoryTitle = isAll 
    ? "All Collections" 
    : slug.charAt(0).toUpperCase() + slug.slice(1);

  if (searchQuery) categoryTitle = `Search: "${searchQuery}"`;
  
  const filteredProducts = products.filter(p => {
    let matchesCategory = isAll;
    if (!isAll) {
      const categoryObj = categories.find(c => {
        const prodCatId = typeof p.category === 'object' ? p.category.id : p.category;
        return c.id === prodCatId;
      });
      const catName = categoryObj ? categoryObj.name.toLowerCase() : '';
      const embeddedCatName = typeof p.category === 'object' && p.category.name 
        ? p.category.name.toLowerCase() 
        : '';

      matchesCategory = catName === slug.toLowerCase() || embeddedCatName === slug.toLowerCase();
    }

    let matchesSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matchesSearch = p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    }

    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (productCat) => {
    if (typeof productCat === 'object') return productCat.name;
    const cat = categories.find(c => c.id === productCat);
    return cat ? cat.name : 'Product';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-10 font-sans">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">ShopWave Exclusive</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-950 tracking-tighter">
            {categoryTitle}
          </h1>
          <p className="text-gray-400 mt-4 max-w-md text-sm font-semibold">
            {searchQuery 
              ? `Showing results matching your search.`
              : `Discover our curated selection of premium ${isAll ? 'goods' : slug} designed for the modern lifestyle.`}
          </p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center text-[10px] font-black uppercase tracking-widest border border-gray-100 px-6 py-3 rounded-full hover:bg-gray-50 transition-all">
            <Filter size={14} className="mr-2" /> Filters
          </button>
          <button className="flex items-center text-[10px] font-black uppercase tracking-widest border border-gray-100 px-6 py-3 rounded-full hover:bg-gray-50 transition-all">
            Sort <ChevronDown size={14} className="ml-2" />
          </button>
        </div>
      </header>

      {/* Product Grid */}
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-900 font-bold uppercase tracking-widest text-xs">Loading Products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-4">
            <SearchX size={40} />
          </div>
          <p className="text-gray-400 font-bold text-lg">No products found for this criteria.</p>
          <Link to="/category/all" className="text-blue-600 font-black underline mt-4 block hover:text-blue-700 transition-colors">
            View All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* RESTYLED PREMIUM CARD */}
              <Link to={`/product/${product.id}`} className="block group relative bg-white rounded-[2rem] p-3 border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
                
                {/* Image Container */}
                <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-gray-50 relative">
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
                  
                  {/* Floating Action Button on Hover */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10">
                    <button 
                      onClick={(e) => { e.preventDefault(); /* Prevent Link navigation */ /* Add to cart logic here */ }}
                      className="w-12 h-12 bg-white text-blue-900 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>

                {/* Details Container */}
                <div className="pt-5 px-3 pb-2 flex flex-col gap-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {getCategoryName(product.category)}
                  </p>
                  
                  <h3 className="text-sm font-extrabold text-blue-950 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-black text-blue-900">${product.price}</p>
                    
                    <div className="flex items-center text-yellow-400 bg-yellow-50 px-2 py-1 rounded-full">
                      <Star size={10} fill="currentColor" className="mr-1" />
                      <span className="text-[10px] font-black text-yellow-700">{product.rating || "New"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

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