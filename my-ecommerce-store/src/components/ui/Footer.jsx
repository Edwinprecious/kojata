import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, ArrowUp, Mail, MapPin } from 'lucide-react';

const Instagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Twitter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-1 2.17-2.41 3.06a12.18 12.18 0 0 1-2.09 10.83A12.18 12.18 0 0 1 5.09 18.09 12.28 12.28 0 0 1 2 13.51a12.28 12.28 0 0 0 8.29-2.41A12.18 12.18 0 0 1 7.09 5.09a12.18 12.18 0 0 1 10.83-2.09A12.18 12.18 0 0 0 22 4z"/></svg>
);
const Facebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const Youtube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
);
const ShieldCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  return (
    <footer className="w-full font-sans">
      
      {/* Conditionally render this section ONLY on the profile page */}
      {location.pathname === '/profile' && (
        <section className="bg-[#f0f7ff] py-10 px-6 text-center border-t border-blue-50">
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-blue-950 tracking-tighter">
              Get <span className="text-blue-600">15% off</span> your first order
            </h2>
            <p className="text-gray-500 text-base max-w-2xl mx-auto font-bold leading-relaxed">
              Join 340,000+ subscribers and get early access to flash deals, 
              exclusive discounts, and new arrivals.
            </p>
            
            <form className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="w-full md:w-[400px] px-6 py-3 rounded-full border border-blue-200 outline-none focus:border-blue-500 bg-white transition-all shadow-sm font-semibold"
              />
              <button className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-full font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase text-xs tracking-widest">
                Get My 15% Off
              </button>
            </form>
            
            <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">
              No spam, ever. Unsubscribe anytime. 🔒 Secure & Private.
            </p>
          </div>
        </section>
      )}

      <section className="bg-[#0a111f] text-gray-400 pt-12 pb-8 px-6">
        {/* Adjusted grid: 2 columns on mobile, 4 on desktop */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          
          {/* Brand info spans full width (2 columns) on mobile, 2 cols on desktop */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="text-2xl font-black text-white flex items-center">
              <span className="bg-blue-600 text-white p-1 rounded-md mr-2">
                <Video size={20}/>
              </span> 
              ShopWave
            </Link>
            <p className="text-sm font-semibold leading-relaxed max-w-xs">
              Your destination for premium products at unbeatable prices. 
              Live deals, real savings. Redefining the wave of commerce.
            </p>
            <div className="flex gap-4 pt-2">
               <span className="hover:text-blue-500 transition-colors cursor-pointer"><Instagram /></span>
               <span className="hover:text-blue-500 transition-colors cursor-pointer"><Twitter/></span>
               <span className="hover:text-blue-500 transition-colors cursor-pointer"><Facebook /></span>
               <span className="hover:text-blue-500 transition-colors cursor-pointer"><Youtube /></span>
            </div>
          </div>

          {/* Support takes 1 column on mobile (side-by-side) */}
          <div className="col-span-1">
            <h3 className="text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-5">Support</h3>
            <ul className="space-y-2 text-xs sm:text-sm font-bold">
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/shipping-info" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Company takes 1 column on mobile (side-by-side) */}
          <div className="col-span-1">
            <h3 className="text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-5">Company</h3>
            <ul className="space-y-2 text-xs sm:text-sm font-bold">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              {/* <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li> */}
              {/* <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li> */}
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            © {currentYear} ShopWave. All rights reserved.
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map((p) => (
              <span key={p} className="bg-gray-800 text-[8px] text-gray-300 px-3 py-1.5 rounded-md uppercase tracking-widest font-black border border-gray-700">
                {p}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <ShieldCheck /> AES-256 SECURED
            </div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 group"
            >
              <ArrowUp size={18} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;