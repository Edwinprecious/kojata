import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, UserCheck, ArrowRight, LayoutGrid, Zap, 
  Flame, ShieldCheck, Truck, Headphones, RefreshCcw 
} from 'lucide-react';

// Component Imports
import LiveShowSection from '../features/livestream/LiveShowSection';
import Testimonials from '../features/products/Testimonials';
import Hero from '../components/home/Hero';
import ProductCard from '../features/products/ProductCard';
import Carousel from '../components/common/Carousel'; // Imported Carousel component
import api from '../services/api';

const Home = () => {
  const [activeCategories, setActiveCategories] = useState([]);
  const [displayCategories, setDisplayCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [hotSales, setHotSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Timer & Event States ---
  const [activeEvent, setActiveEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: '0', hours: '00', minutes: '00', seconds: '00' });

  // 1. Fetch store data and distribute it to the new sections
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const [prodRes, eventRes] = await Promise.allSettled([
          api.get('/products/'),
          api.get('/events/active/')
        ]);

        if (prodRes.status === 'fulfilled') {
          const products = Array.isArray(prodRes.value.data) ? prodRes.value.data : (prodRes.value.data?.results || []);
          
          // New Arrivals: Default backend sorting is by -id (newest first)
          setNewArrivals(products.slice(0, 4));

          // Hot Sales: Sort by actual sales_count from the backend
          const sortedBySales = [...products].sort((a, b) => parseInt(b.sales_count || 0) - parseInt(a.sales_count || 0));
          
          // Set to 8 items to populate the carousel effectively
          setHotSales(sortedBySales.slice(0, 8));

          // Categories processing
          const catMap = {};
          products.forEach(p => {
            const catName = p.category_name || (typeof p.category === 'object' ? p.category.name : '');
            if (catName) {
              const slug = catName.toLowerCase().replace('&', 'and').replace(/\s+/g, ' ').trim();
              if (!catMap[slug]) {
                catMap[slug] = { name: catName, slug: slug, count: 0, image: p.image || null };
              }
              catMap[slug].count += 1;
              if (!catMap[slug].image && p.image) catMap[slug].image = p.image;
            }
          });
          
          const categoryArray = Object.values(catMap);
          setActiveCategories(categoryArray);
          setDisplayCategories(categoryArray.slice(0, 9));
        }

        if (eventRes.status === 'fulfilled' && eventRes.value.data) {
          setActiveEvent(eventRes.value.data);
        }

      } catch (error) {
        console.error("Failed to fetch store data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  // 2. The Auto-Swapping Logic for Categories
  useEffect(() => {
    if (displayCategories.length <= 1) return;

    const swapInterval = setInterval(() => {
      setDisplayCategories(prev => {
        const newArray = [...prev];
        const idx1 = Math.floor(Math.random() * newArray.length);
        let idx2 = Math.floor(Math.random() * newArray.length);
        
        while (idx1 === idx2) idx2 = Math.floor(Math.random() * newArray.length);

        [newArray[idx1], newArray[idx2]] = [newArray[idx2], newArray[idx1]];
        return newArray;
      });
    }, 4000);

    return () => clearInterval(swapInterval);
  }, [displayCategories.length]);

  // 3. The Live Countdown Timer Logic
  useEffect(() => {
    if (!activeEvent || !activeEvent.end_date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endDate = new Date(activeEvent.end_date).getTime();
      const difference = endDate - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: '0', hours: '00', minutes: '00', seconds: '00' });
        setActiveEvent(null); 
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: days.toString(),
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeEvent]);

  return (
    <main className="pt-16 md:pt-20 space-y-12 md:space-y-20 overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. TRUST BADGES (Professional E-commerce staple) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-full"><Truck size={24} /></div>
            <h4 className="text-blue-950 font-black text-sm">Express Delivery</h4>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest hidden sm:block">Worldwide Shipping</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="bg-green-50 text-green-600 p-3 rounded-full"><ShieldCheck size={24} /></div>
            <h4 className="text-blue-950 font-black text-sm">Secure Payment</h4>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest hidden sm:block">256-bit Encryption</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="bg-orange-50 text-orange-600 p-3 rounded-full"><RefreshCcw size={24} /></div>
            <h4 className="text-blue-950 font-black text-sm">Free Returns</h4>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest hidden sm:block">30-Day Guarantee</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-full"><Headphones size={24} /></div>
            <h4 className="text-blue-950 font-black text-sm">24/7 Support</h4>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest hidden sm:block">Dedicated Concierge</p>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC FLASH EVENT BANNER */}
      {activeEvent && (
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-blue-950 text-white rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-blue-900/20 overflow-hidden relative border border-blue-800">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative z-10 text-center md:text-left mb-8 md:mb-0 space-y-4">
              <div className="inline-block px-4 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest rounded-xl">
                {activeEvent.name || "Flash Event"}
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Sale.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
                  {activeEvent.description || "Up to 60% Off."}
                </span>
              </h2>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <span className="text-blue-300 font-bold text-sm uppercase tracking-widest">Ends in</span>
                <div className="flex gap-2 text-xl font-black tabular-nums items-center">
                  {timeLeft.days !== '0' && (
                    <>
                      <span className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">{timeLeft.days}d</span>
                      <span className="text-blue-500/50 py-2">:</span>
                    </>
                  )}
                  <span className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">{timeLeft.hours}</span>
                  <span className="text-blue-500/50 py-2">:</span>
                  <span className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">{timeLeft.minutes}</span>
                  <span className="text-blue-500/50 py-2">:</span>
                  <span className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">{timeLeft.seconds}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 shrink-0">
              <Link 
                to="/deals" 
                className="bg-white text-blue-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-white/10 hover:scale-105 hover:bg-gray-50 transition-all flex items-center gap-2 group"
              >
                Explore Deals 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 7. LIVE SHOW PROMO & FEED */}
      <div className="bg-gray-50 py-20 mt-20 border-t border-gray-100">
        <LiveShowSection />
        
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16">
          <div className="lg:col-span-1 space-y-6">
            <p className="text-blue-600 font-bold text-xs md:text-sm uppercase tracking-widest">Live Activity</p>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 leading-tight">What's happening right now</h2>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-50 rounded-2xl"><Package className="text-blue-600" size={28}/></div>
                <div><p className="text-2xl font-black text-blue-950">1,247</p><p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Orders today</p></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-50 rounded-2xl"><UserCheck className="text-blue-600" size={28}/></div>
                <div><p className="text-2xl font-black text-blue-950">847</p><p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Live shoppers</p></div>
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
      </div>

      {/* 4. DYNAMIC 3x3 ANIMATED GRID SECTION (Categories) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <p className="text-blue-600 font-bold text-xs md:text-sm uppercase tracking-widest">Browse by Category</p>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950 mt-2">What are you looking for?</h2>
          </div>
          <Link to="/category/all" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-colors flex items-center">
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : displayCategories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-gray-100">
            <LayoutGrid size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-blue-950 font-black text-base">No Categories Yet</h3>
            <p className="text-gray-400 font-bold text-xs">Products you add will automatically create categories here.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 md:gap-5">
            {displayCategories.map((cat) => (
              <motion.div 
                layout
                key={cat.slug} 
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="z-10"
              >
                <Link 
                  to={`/category/${cat.slug}`}
                  className="bg-white p-2 sm:p-3 rounded-2xl border border-gray-100 flex flex-col items-center hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-100 transition-all cursor-pointer group h-full"
                >
                  <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 md:mb-3 rounded-xl overflow-hidden bg-gray-50 relative shrink-0">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-[8px] md:text-[10px] uppercase tracking-widest bg-gray-100 text-center px-1">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-300"></div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center flex-grow text-center">
                    <h3 className="font-black text-blue-950 text-[10px] sm:text-xs line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="hidden sm:block text-[9px] text-gray-400 mt-0.5 font-bold uppercase tracking-widest">
                      {cat.count} item{cat.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 5. HOT SALES SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <p className="text-orange-600 font-bold text-xs md:text-sm uppercase tracking-widest flex items-center">
              <Flame size={16} className="mr-1" /> Trending Now
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950 mt-2">Hot Sales</h2>
          </div>
          <Link to="/category/all" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-colors flex items-center">
            See what's popular <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        ) : hotSales.length === 0 ? (
           <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-gray-100">
             <Flame size={32} className="mx-auto text-gray-300 mb-3" />
             <p className="text-gray-400 font-bold text-xs">No trending products found.</p>
           </div>
        ) : (
          <div className="w-full relative">
            <Carousel items={hotSales} />
          </div>
        )}
      </section>

      {/* 6. NEW ARRIVALS SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <p className="text-blue-600 font-bold text-xs md:text-sm uppercase tracking-widest">Fresh Drops</p>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950 mt-2">New Arrivals</h2>
          </div>
          <Link to="/category/all" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-colors flex items-center">
            Shop latest <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : newArrivals.length === 0 ? (
           <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-gray-100">
             <Package size={32} className="mx-auto text-gray-300 mb-3" />
             <p className="text-gray-400 font-bold text-xs">No new products found.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 8. TESTIMONIALS */}
      <Testimonials />

      {/* 9. GLOBAL STATS */}
      <section className="bg-blue-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          <div><h2 className="text-3xl md:text-5xl font-bold">2.4M+</h2><p className="text-blue-200 text-xs md:text-sm opacity-70 mt-1">Happy Customers</p></div>
          <div><h2 className="text-3xl md:text-5xl font-bold">98.7%</h2><p className="text-blue-200 text-xs md:text-sm opacity-70 mt-1">Satisfaction Rate</p></div>
          <div><h2 className="text-3xl md:text-5xl font-bold">24hr</h2><p className="text-blue-200 text-xs md:text-sm opacity-70 mt-1">Fast Delivery</p></div>
          <div><h2 className="text-3xl md:text-5xl font-bold">50K+</h2><p className="text-blue-200 text-xs md:text-sm opacity-70 mt-1">Products</p></div>
        </div>
      </section>
    </main>
  );
};

export default Home;