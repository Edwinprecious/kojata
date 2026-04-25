import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Laptop, ShoppingBag, Smartphone, Watch, 
  Sparkles, Footprints, Package, UserCheck, 
  Truck, ShieldCheck, Heart, ArrowRight 
} from 'lucide-react';

// Component Imports
import ProductScene from '../components/ThreeD/ProductScene';
import LiveShowSection from '../features/livestream/LiveShowSection';
import Testimonials from '../features/products/Testimonials';
import { useYouTube } from '../hooks/useYouTube';
import Hero from '../components/home/Hero';
import api from '../services/api';

const Home = () => {
  const { isLive, title } = useYouTube();
  const [categoryCounts, setCategoryCounts] = useState({});

  // Fetch products and calculate accurate category counts
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const res = await api.get('/products/');
        const products = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        
        const counts = {};
        products.forEach(p => {
          // Get the category name from the serializer or nested object
          const catName = p.category_name || (typeof p.category === 'object' ? p.category.name : '');
          
          if (catName) {
            // Normalize to gracefully handle "Home & Decor" vs "Home and Decor"
            const normalized = catName.toLowerCase().replace('&', 'and').replace(/\s+/g, ' ').trim();
            counts[normalized] = (counts[normalized] || 0) + 1;
          }
        });
        setCategoryCounts(counts);
      } catch (error) {
        console.error("Failed to fetch product counts:", error);
      }
    };

    fetchCategoryCounts();
  }, []);

  // Helper function to match the hardcoded categories with the backend tally
  const normalizeString = (str) => {
    return str.toLowerCase().replace('&', 'and').replace(/\s+/g, ' ').trim();
  };

  return (
    <main className="pt-16 md:pt-20 space-y-12 md:space-y-20 overflow-x-hidden font-caslon">
      
      {/* 1. HERO SECTION - Responsive Stacked Layout */}
      <Hero />

      {/* --- FLASH EVENT BANNER --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16 mt-8">
        <div className="bg-blue-950 text-white rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-blue-900/20 overflow-hidden relative border border-blue-800">
          
          {/* Abstract Background Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 text-center md:text-left mb-8 md:mb-0 space-y-4">
            <div className="inline-block px-4 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest rounded-xl">
              Flash Event
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Midnight Sale.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">Up to 60% Off.</span>
            </h2>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
              <span className="text-blue-300 font-bold text-sm uppercase tracking-widest">Ends in</span>
              <div className="flex gap-2 text-xl font-black tabular-nums">
                <span className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">04</span>
                <span className="text-blue-500/50 py-2">:</span>
                <span className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">22</span>
                <span className="text-blue-500/50 py-2">:</span>
                <span className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">12</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <Link 
              to="/deals" 
              className="bg-white text-blue-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-white/10 hover:scale-105 hover:bg-gray-50 transition-all flex items-center gap-2 group"
            >
              Explore Tech Deals 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      {/* --------------------------- */}

      {/* 2. STATS SECTION - Responsive Grid */}
      <section className="bg-blue-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          <div><h2 className="text-3xl md:text-5xl font-bold">2.4M+</h2><p className="text-blue-200 text-xs md:text-sm opacity-70 mt-1">Happy Customers</p></div>
          <div><h2 className="text-3xl md:text-5xl font-bold">98.7%</h2><p className="text-blue-200 text-xs md:text-sm opacity-70 mt-1">Satisfaction Rate</p></div>
          <div><h2 className="text-3xl md:text-5xl font-bold">24hr</h2><p className="text-blue-200 text-xs md:text-sm opacity-70 mt-1">Fast Delivery</p></div>
          <div><h2 className="text-3xl md:text-5xl font-bold">50K+</h2><p className="text-blue-200 text-xs md:text-sm opacity-70 mt-1">Products</p></div>
        </div>
      </section>

      {/* 3. CATEGORIES GRID - Responsive 2 to 6 columns */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <p className="text-blue-600 font-bold text-xs md:text-sm uppercase tracking-widest">Browse by Category</p>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mt-2">What are you looking for?</h2>
          </div>
          <Link to="/category/all" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[
            { name: 'Electronics', icon: <Laptop className="text-orange-500"/> },
            { name: 'Fashion', icon: <ShoppingBag className="text-orange-700"/> },
            { name: 'Home and Decor', icon: <Smartphone className="text-green-500"/> },
            { name: 'Accessories', icon: <Watch className="text-blue-500"/> },
            { name: 'Beauty', icon: <Sparkles className="text-yellow-500"/> },
            { name: 'Footwear', icon: <Footprints className="text-gray-500"/> },
          ].map((cat, i) => {
            // Retrieve the dynamically calculated count from state, default to 0
            const actualCount = categoryCounts[normalizeString(cat.name)] || 0;

            return (
              <Link 
                to={`/category/${cat.name.toLowerCase()}`} 
                key={i} 
                className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 flex flex-col items-center hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="mb-4 bg-gray-50 p-4 rounded-xl group-hover:bg-blue-50 transition-colors">{cat.icon}</div>
                <h3 className="font-bold text-blue-900 text-sm">{cat.name}</h3>
                <p className="text-[10px] text-gray-400 mt-1">{actualCount} item{actualCount !== 1 ? 's' : ''}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. LIVE SHOW SECTION */}
      <LiveShowSection />

      {/* 5. TESTIMONIALS SECTION */}
      <Testimonials />

      {/* 6. LIVE ACTIVITY FEED - Responsive Layout */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
        <div className="lg:col-span-1 space-y-6">
          <p className="text-blue-600 font-bold text-xs md:text-sm uppercase tracking-widest">Live Activity</p>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 leading-tight">What's happening right now</h2>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-50 rounded-2xl"><Package className="text-blue-600" size={28}/></div>
              <div><p className="text-2xl font-bold text-blue-900">1,247</p><p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Orders today</p></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-50 rounded-2xl"><UserCheck className="text-blue-600" size={28}/></div>
              <div><p className="text-2xl font-bold text-blue-900">847</p><p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Live shoppers</p></div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <p className="flex items-center font-bold text-xs tracking-widest text-gray-500">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span> LIVE FEED
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Updates every few seconds</p>
          </div>
          <div className="space-y-3">
             {/* Feed Item Template */}
             <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-900/20">T</div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <strong className="text-blue-900">Tom H.</strong> purchased <span className="text-gray-500 italic">CuisineArt Precision Blender</span>
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">San Diego, CA</p>
                  </div>
                </div>
                <div className="text-right hidden xs:block">
                  <p className="text-blue-600 font-black">$89.99</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Just now</p>
                </div>
              </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;