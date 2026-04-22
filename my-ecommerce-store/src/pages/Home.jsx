import React from 'react';
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

const Home = () => {
  const { isLive, title } = useYouTube();

  return (
    <main className="pt-16 md:pt-20 space-y-12 md:space-y-20 overflow-x-hidden font-caslon">
      
      {/* 1. HERO SECTION - Responsive Stacked Layout */}
        <Hero />

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
          <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-colors">View all →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[
            { name: 'Electronics', count: 142, icon: <Laptop className="text-orange-500"/> },
            { name: 'Fashion', count: 287, icon: <ShoppingBag className="text-orange-700"/> },
            { name: 'Home & Wellness', count: 198, icon: <Smartphone className="text-green-500"/> },
            { name: 'Accessories', count: 165, icon: <Watch className="text-blue-500"/> },
            { name: 'Beauty', count: 213, icon: <Sparkles className="text-yellow-500"/> },
            { name: 'Footwear', count: 94, icon: <Footprints className="text-gray-500"/> },
          ].map((cat, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 flex flex-col items-center hover:shadow-xl transition-all cursor-pointer group">
              <div className="mb-4 bg-gray-50 p-4 rounded-xl group-hover:bg-blue-50 transition-colors">{cat.icon}</div>
              <h3 className="font-bold text-blue-900 text-sm">{cat.name}</h3>
              <p className="text-[10px] text-gray-400 mt-1">{cat.count} items</p>
            </div>
          ))}
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