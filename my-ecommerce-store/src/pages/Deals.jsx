import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, TrendingUp, Star, ShoppingCart } from 'lucide-react';
import { products } from '../data/products';
import { Link } from 'react-router-dom';

const Deals = () => {
  // Only show products that have a discount
  const dealProducts = products.filter(p => p.originalPrice);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      {/* 1. Flash Sale Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-600 rounded-[32px] p-8 md:p-12 mb-16 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between"
      >
        <div className="z-10 relative">
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">Flash Event</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Midnight Sale. <br/> Up to 60% Off.</h2>
          <div className="flex items-center gap-4 text-sm font-bold opacity-80">
            <Clock size={18} /> Ends in 04:22:12
          </div>
        </div>
        <div className="mt-8 md:mt-0 z-10">
          <Link to="/category/electronics" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-transform inline-block">
            Explore Tech Deals
          </Link>
        </div>
        {/* Background Graphic */}
        <Zap className="absolute right-[-50px] top-[-50px] w-96 h-96 opacity-10 rotate-12" />
      </motion.div>

      {/* 2. Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {dealProducts.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <div className="m3-card !p-0 bg-white overflow-hidden relative mb-4 border border-gray-50 shadow-sm transition-all hover:shadow-xl">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square relative overflow-hidden bg-gray-50">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  {/* Deal Badge */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                    {product.dealLabel}
                  </div>
                </div>
              </Link>
              {/* Quick Add Button */}
              <button className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90">
                <ShoppingCart size={20} />
              </button>
            </div>

            <div className="px-1">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{product.category}</p>
              <h3 className="text-sm font-extrabold text-blue-950 mb-2 truncate">{product.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-blue-900">${product.price}</span>
                <span className="text-sm text-gray-300 font-bold line-through">${product.originalPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deals;