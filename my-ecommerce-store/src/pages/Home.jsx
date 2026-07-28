import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, Flame, ShieldCheck, Truck,
  Headphones, RefreshCcw, Radio, Users, Star,
  Package, ChevronRight, TrendingUp, Eye, Award,
  Sparkles, LayoutGrid, Timer
} from 'lucide-react';

import LiveShowSection from '../features/livestream/LiveShowSection';
import Testimonials from '../features/products/Testimonials';
import ProductCard from '../features/products/ProductCard';
import Carousel from '../components/common/Carousel';
import api from '../services/api';
import { getLiveStatus } from '../services/youtubeApi';

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const numeric = parseFloat(end.replace(/[^0-9.]/g, ''));
    const steps = 60;
    const increment = numeric / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  const display = parseFloat(end) >= 1000
    ? (count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : Math.round(count).toString())
    : count >= 10 ? Math.round(count).toString()
    : count.toFixed(1);

  return <span ref={ref}>{display}{suffix}</span>;
};

// ─── Section Wrapper with scroll reveal ──────────────────────────────────────
const RevealSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
    <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-4" />
    <div className="h-3 bg-gray-100 rounded-full mb-2 w-3/4" />
    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
    <div className="h-8 bg-gray-100 rounded-full mt-4 w-full" />
  </div>
);


// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [hotSales, setHotSales] = useState([]);
  const [displayCategories, setDisplayCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [liveStatus, setLiveStatus] = useState({ isLive: false });
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: '0', hours: '00', minutes: '00', seconds: '00' });
  const [activeCatIndex, setActiveCatIndex] = useState(0);

  // ── Data Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, eventRes, liveRes] = await Promise.allSettled([
          api.get('/products/'),
          api.get('/events/active/'),
          getLiveStatus(),
        ]);

        if (prodRes.status === 'fulfilled') {
          const products = Array.isArray(prodRes.value.data)
            ? prodRes.value.data
            : (prodRes.value.data?.results || []);

          setNewArrivals(products.slice(0, 4));
          const byPopularity = [...products].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
          setHotSales(byPopularity.slice(0, 8));

          const catMap = {};
          products.forEach(p => {
            const name = p.category_name || (typeof p.category === 'object' ? p.category?.name : '');
            if (!name) return;
            const slug = name.toLowerCase().replace('&', 'and').replace(/\s+/g, ' ').trim();
            if (!catMap[slug]) catMap[slug] = { name, slug, count: 0, image: null };
            catMap[slug].count++;
            if (!catMap[slug].image && p.image) catMap[slug].image = p.image;
          });
          const cats = Object.values(catMap);
          setActiveCategories(cats);
          setDisplayCategories(cats.slice(0, 9));
        }

        if (eventRes.status === 'fulfilled' && eventRes.value.data) {
          setActiveEvent(eventRes.value.data);
        }

        if (liveRes.status === 'fulfilled') {
          setLiveStatus(liveRes.value);
        }
      } catch (e) {
        console.error('Home fetch error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Category auto-swap ──────────────────────────────────────────────────────
  useEffect(() => {
    if (displayCategories.length <= 1) return;
    const id = setInterval(() => {
      setDisplayCategories(prev => {
        const arr = [...prev];
        const i = Math.floor(Math.random() * arr.length);
        let j = Math.floor(Math.random() * arr.length);
        while (i === j) j = Math.floor(Math.random() * arr.length);
        [arr[i], arr[j]] = [arr[j], arr[i]];
        return arr;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [displayCategories.length]);

  // ── Countdown ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeEvent?.end_date) return;
    const tick = () => {
      const diff = new Date(activeEvent.end_date).getTime() - Date.now();
      if (diff <= 0) { setActiveEvent(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000).toString(),
        hours: Math.floor((diff % 86400000) / 3600000).toString().padStart(2, '0'),
        minutes: Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0'),
        seconds: Math.floor((diff % 60000) / 1000).toString().padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeEvent]);

  // ── Category tab filter ─────────────────────────────────────────────────────
  const visibleCats = activeCategories.slice(0, 6);

  return (
    <main className="overflow-x-hidden font-sans bg-white">

      {/* ═══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center bg-[#f8f9ff] overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-blue-100/60 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-indigo-100/50 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            {/* Live badge */}
            <AnimatePresence>
              {liveStatus.isLive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest mb-6"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  We're Live Now — Join the Show
                  <Link to="/live" className="text-red-700 hover:underline ml-1">→</Link>
                </motion.div>
              )}
            </AnimatePresence>

            {!liveStatus.isLive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.18em] mb-6"
              >
                <Zap size={13} /> Limited Time Deals
              </motion.div>
            )}

            <h1 className="text-[clamp(3rem,8vw,6.5rem)] font-black text-blue-950 leading-[0.88] tracking-[-0.03em] mb-8">
              The Future<br />
              of Shopping<br />
              <span className="text-blue-600 italic">Is Live.</span>
            </h1>

            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10 max-w-md">
              Exclusive flash deals, live product demos, and prices that only exist during the broadcast. Don't shop. Watch. Shop.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/deals"
                className="flex items-center gap-3 bg-blue-600 text-white px-7 py-4 rounded-2xl font-bold text-base shadow-xl shadow-blue-600/25 hover:bg-blue-700 hover:-translate-y-0.5 transition-all group"
              >
                Shop Flash Deals
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/live"
                className="flex items-center gap-3 bg-white border-2 border-gray-200 text-blue-950 px-7 py-4 rounded-2xl font-bold text-base hover:border-red-300 hover:text-red-600 hover:-translate-y-0.5 transition-all"
              >
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                Watch Live
              </Link>
              <Link
                to="/category/all"
                className="flex items-center gap-3 text-blue-950 px-7 py-4 rounded-2xl font-bold text-base border-2 border-gray-100 hover:border-blue-200 hover:-translate-y-0.5 transition-all"
              >
                <LayoutGrid size={18} /> Browse All
              </Link>
            </div>

            {/* Social proof pills */}
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {['#1e40af','#1d4ed8','#3b82f6','#60a5fa'].map((bg, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: bg }}>
                    {['R','M','S','T'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <p className="text-[11px] text-gray-400 font-bold mt-0.5">2.4M+ happy customers</p>
              </div>
            </div>
          </motion.div>

          {/* Right — product visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-4 bg-blue-200/40 rounded-[60px] blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop"
                alt="Featured Product"
                className="relative w-full rounded-[48px] shadow-2xl shadow-blue-900/15 object-cover aspect-square"
              />

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-8 bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-5 border border-gray-100"
              >
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">New Arrival</p>
                <p className="text-base font-black text-blue-950 mt-0.5">Aura Watch S2</p>
                <p className="text-xl font-black text-blue-600 mt-1">$185.00</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-8 -right-6 bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-4 border border-gray-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <Flame size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Trending</p>
                  <p className="text-xs font-black text-blue-950">847 orders today</p>
                </div>
              </motion.div>

              {liveStatus.isLive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Live Now
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-12 bg-blue-900 rounded-full overflow-hidden">
            <motion.div animate={{ y: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-full h-1/2 bg-blue-600 rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══ 2. TRUST STRIP ═══════════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {[
              { icon: <Truck size={22} />, color: 'blue', label: 'Express Delivery', sub: 'Worldwide Shipping' },
              { icon: <ShieldCheck size={22} />, color: 'green', label: 'Secure Payment', sub: '256-bit Encryption' },
              { icon: <RefreshCcw size={22} />, color: 'orange', label: 'Free Returns', sub: '30-Day Guarantee' },
              { icon: <Headphones size={22} />, color: 'purple', label: '24/7 Support', sub: 'Dedicated Concierge' },
            ].map(({ icon, color, label, sub }) => (
              <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-6 md:p-8 text-center sm:text-left">
                <div className={`p-3 rounded-2xl shrink-0 bg-${color}-50 text-${color}-600`}>{icon}</div>
                <div>
                  <p className="font-black text-blue-950 text-sm">{label}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 hidden sm:block">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ═══ 3. FLASH EVENT BANNER ════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeEvent && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-7xl mx-auto px-6 mt-8"
          >
            <div className="relative overflow-hidden bg-blue-950 text-white rounded-[2.5rem] p-8 md:p-12 border border-blue-800 shadow-2xl shadow-blue-900/20">
              {/* Ambient blobs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/15 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/25 text-red-400 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl mb-4">
                    <Timer size={12} /> {activeEvent.name || 'Flash Event'}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                    {activeEvent.description || 'Up to 60% off.'}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">Only while live.</span>
                  </h2>

                  {/* Countdown */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-blue-300 text-xs font-black uppercase tracking-widest">Ends in</span>
                    <div className="flex items-center gap-1.5 text-lg font-black tabular-nums">
                      {timeLeft.days !== '0' && (
                        <>
                          <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10">{timeLeft.days}<span className="text-blue-400 text-xs ml-0.5">d</span></span>
                          <span className="text-blue-500/50">:</span>
                        </>
                      )}
                      <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10">{timeLeft.hours}</span>
                      <span className="text-blue-500/50">:</span>
                      <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10">{timeLeft.minutes}</span>
                      <span className="text-blue-500/50">:</span>
                      <motion.span
                        key={timeLeft.seconds}
                        initial={{ scale: 1.15 }}
                        animate={{ scale: 1 }}
                        className="bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-xl text-red-300"
                      >
                        {timeLeft.seconds}
                      </motion.span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/deals"
                  className="shrink-0 flex items-center gap-3 bg-white text-blue-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 hover:bg-blue-50 transition-all group"
                >
                  Explore Deals
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ 4. CATEGORIES ════════════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-6 mt-20 md:mt-28">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <p className="text-blue-600 font-bold text-[11px] uppercase tracking-[0.2em] mb-2">Browse by Category</p>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950 tracking-tight">What are you<br className="hidden md:block" /> looking for?</h2>
          </div>
          <Link to="/category/all" className="flex items-center gap-2 text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-colors">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[...Array(9)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : displayCategories.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-gray-100">
            <LayoutGrid size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-blue-950 font-black text-base">No categories yet</p>
            <p className="text-gray-400 text-xs mt-1">Add products to generate categories.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3 md:gap-4">
            {displayCategories.map((cat, i) => (
              <motion.div key={cat.slug} layout transition={{ type: 'spring', stiffness: 250, damping: 22 }}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="group bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center hover:shadow-xl hover:shadow-blue-900/6 hover:border-blue-100 hover:-translate-y-1 transition-all h-full"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 relative mb-2 md:mb-3">
                    {cat.image
                      ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] font-bold bg-gray-100">No img</div>
                    }
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/8 transition-colors duration-300 rounded-xl" />
                  </div>
                  <p className="font-black text-blue-950 text-[10px] sm:text-xs line-clamp-1 group-hover:text-blue-600 transition-colors text-center">{cat.name}</p>
                  <p className="hidden sm:block text-[9px] text-gray-400 mt-0.5 font-bold uppercase tracking-widest">{cat.count} item{cat.count !== 1 ? 's' : ''}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </RevealSection>

      {/* ═══ 5. HOT SALES CAROUSEL ════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-6 mt-20 md:mt-28">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <p className="text-orange-500 font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2">
              <Flame size={13} /> Trending Now
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950 tracking-tight">Hot Sales</h2>
          </div>
          <Link to="/category/all" className="flex items-center gap-2 text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-colors">
            See what's popular <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : hotSales.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-gray-100">
            <Flame size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 font-bold text-xs">No trending products found.</p>
          </div>
        ) : (
          <Carousel items={hotSales} />
        )}
      </RevealSection>

      {/* ═══ 6. NEW ARRIVALS GRID ═════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-6 mt-20 md:mt-28">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <p className="text-blue-600 font-bold text-[11px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
              <Sparkles size={13} /> Fresh Drops
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950 tracking-tight">New Arrivals</h2>
          </div>
          <Link to="/category/all" className="flex items-center gap-2 text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-colors">
            Shop latest <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-gray-100">
            <Package size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 font-bold text-xs">No new products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {newArrivals.map((product, i) => (
              <motion.div
                key={`new-${product.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </RevealSection>

      {/* ═══ 7. LIVE SHOW PROMO ═══════════════════════════════════════════════ */}
      <RevealSection className="bg-[#f4f6ff] border-y border-blue-100 mt-20 md:mt-28 py-20">
        <LiveShowSection />

        {/* Live Activity Feed */}
        <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left stats */}
          <div className="space-y-5">
            <p className="text-blue-600 font-bold text-[11px] uppercase tracking-[0.2em]">Live Activity</p>
            <h2 className="text-3xl font-black text-blue-900 leading-tight">What's happening<br />right now</h2>
            <div className="space-y-4">
              {[
                { icon: <Package size={20} className="text-blue-600" />, value: '1,247', label: 'Orders today' },
                { icon: <Users size={20} className="text-blue-600" />, value: '847', label: 'Live shoppers' },
                { icon: <TrendingUp size={20} className="text-green-600" />, value: '94%', label: 'Satisfaction rate' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
                  <div>
                    <p className="text-xl font-black text-blue-950">{value}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <p className="flex items-center font-bold text-[11px] tracking-widest text-gray-500 uppercase gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Feed
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Updates live</p>
            </div>
            {[
              { initials: 'T', color: '#1e3a8a', name: 'Tom H.', product: 'CuisineArt Precision Blender', location: 'San Diego, CA', price: '$89.99', time: 'Just now' },
              { initials: 'S', color: '#7c3aed', name: 'Sarah K.', product: 'Wireless Noise-Cancelling Headphones', location: 'New York, NY', price: '$149.00', time: '2 min ago' },
              { initials: 'M', color: '#059669', name: 'Marcus L.', product: 'Smart Fitness Watch Pro', location: 'London, UK', price: '$220.00', time: '5 min ago' },
            ].map(({ initials, color, name, product, location, price, time }) => (
              <motion.div
                key={name}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg shrink-0" style={{ backgroundColor: color }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <strong className="text-blue-900">{name}</strong>
                      {' '}purchased{' '}
                      <span className="text-gray-500 italic">{product}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">{location}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block ml-4">
                  <p className="text-blue-600 font-black">{price}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ═══ 8. TESTIMONIALS ══════════════════════════════════════════════════ */}
      <Testimonials />

      {/* ═══ 9. STATS BANNER ══════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="bg-blue-950 text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2400000', suffix: '+', label: 'Happy Customers' },
              { value: '98.7', suffix: '%', label: 'Satisfaction Rate' },
              { value: '24', suffix: 'hr', label: 'Fast Delivery' },
              { value: '50000', suffix: '+', label: 'Products Listed' },
            ].map(({ value, suffix, label }) => (
              <div key={label}>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                  <AnimatedCounter end={value} suffix={suffix} />
                </h2>
                <p className="text-blue-300/70 text-xs md:text-sm mt-2 font-bold uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ═══ 10. CTA FOOTER STRIP ═════════════════════════════════════════════ */}
      <RevealSection className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-2xl shadow-blue-600/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full" />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-[11px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Radio size={13} /> Join the experience
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
              Never miss a live deal again.
            </h2>
            <p className="text-blue-200 text-sm max-w-md">Watch, shop, and save — exclusive prices only during the broadcast.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              to="/live"
              className="flex items-center gap-3 bg-white text-blue-700 px-7 py-4 rounded-2xl font-black text-sm hover:scale-105 hover:bg-blue-50 transition-all shadow-lg group"
            >
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              Watch Live
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/deals"
              className="flex items-center gap-3 bg-blue-500/30 border border-blue-400/30 text-white px-7 py-4 rounded-2xl font-black text-sm hover:bg-blue-500/50 transition-all"
            >
              Browse Deals
            </Link>
          </div>
        </div>
      </RevealSection>
    </main>
  );
};

export default Home;