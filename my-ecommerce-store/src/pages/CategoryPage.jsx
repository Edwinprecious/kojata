import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Icons imported to prevent "ReferenceError"
import { Filter, ChevronDown, Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { products } from '../data/products';

const CategoryPage = () => {
  const { slug } = useParams();
  
  // 1. Logic to handle "all" categories or undefined slugs
  const isAll = !slug || slug === 'all';
  const categoryTitle = isAll 
    ? "All Collections" 
    : slug.charAt(0).toUpperCase() + slug.slice(1);
  
  // 2. Filter products based on the slug
  const filteredProducts = isAll 
    ? products 
    : products.filter(p => p.category.toLowerCase() === slug.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-10 font-sans">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
            ShopWave Exclusive
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-950 tracking-tighter">
            {categoryTitle}
          </h1>
          <p className="text-gray-400 mt-4 max-w-md text-sm font-semibold">
            Discover our curated selection of premium {isAll ? 'goods' : slug} designed for the modern lifestyle.
          </p>
        </motion.div>
        
        {/* Filter/Sort Controls */}
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
      {filteredProducts.length === 0 ? (
        <div className="py-32 text-center">
          <p className="text-gray-400 font-bold text-lg">No products found in this category.</p>
          <Link to="/category/all" className="text-blue-600 font-black underline mt-4 block">View All Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {filteredProducts.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              {/* Material 3 Card Style */}
              <Link to={`/product/${product.id}`} className="block">
                <div className="m3-card !p-0 overflow-hidden relative mb-5">
                  {/* High-end 4:5 Aspect Ratio */}
                  <div className="aspect-[4/5] overflow-hidden bg-gray-50">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Quick Add Overlay (Desktop) */}
                  <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="m3-button-filled !py-3 !text-xs w-full shadow-2xl">
                      Quick View <ArrowRight size={14} />
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-extrabold text-blue-950 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {product.category}
                      </p>
                    </div>
                    <p className="text-sm font-black text-blue-900">${product.price}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center pt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={10} 
                          fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                          className="mr-0.5"
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-gray-300 ml-2 uppercase">
                      {product.reviews} reviews
                    </span>
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