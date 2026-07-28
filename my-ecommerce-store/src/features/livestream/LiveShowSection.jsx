import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Users, Zap, ShoppingCart, ArrowRight } from 'lucide-react';
import { useYouTube } from '../../hooks/useYouTube';

const LiveShowSection = () => {
  const navigate = useNavigate();
   const { isLive, title, viewerCount } = useYouTube();

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto font-caslon">
      {/* Header Area */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="flex items-center text-red-600 font-bold text-sm uppercase tracking-widest mb-2">
            <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
            Live Now
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900">
            Watch the <span className="text-blue-600">Live Show</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Real-time product demos, flash deals, and exclusive offers
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/live')}
          className="bg-blue-900 text-white px-6 py-3 rounded-full font-bold flex items-center hover:bg-blue-800 transition-all shadow-lg"
        >
          <Radio size={18} className="mr-2" />
          Join Live <ArrowRight size={18} className="ml-2" />
        </button>
      </div>

      {/* Main Container from Screenshot */}
      <div className="bg-[#0a111f] rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row min-h-[500px] shadow-2xl">
        
        {/* Left: Video Area */}
        <div className="lg:w-2/3 relative bg-gradient-to-br from-blue-900/20 to-black p-8 flex flex-col justify-between">
          <div className="flex space-x-3">
            <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span> LIVE
            </div>
            <div className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center border border-white/10">
              <Users size={14} className="mr-2" /> 390 watching
            </div>
          </div>

          <div className="mt-auto">
            <h3 className="text-white text-2xl font-bold">Minimal Livestream</h3>
          </div>
        </div>

        {/* Right: Info Area */}
        <div className="lg:w-1/3 bg-[#111827] p-10 border-l border-white/5 flex flex-col justify-center">
          <div className="flex space-x-3 mb-8">
            <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-md text-[10px] font-bold flex items-center">
              <Radio size={12} className="mr-1" /> On Air
            </span>
            <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-md text-[10px] font-bold flex items-center">
              <Zap size={12} className="mr-1" /> Flash Deals Active
            </span>
          </div>

          <div className="bg-blue-600/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
            <ShoppingCart className="text-blue-500" size={28} />
          </div>

          <h4 className="text-white text-2xl font-bold mb-4">Exclusive Live Deals</h4>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Watch the live show for real-time product demos, flash discounts, 
            and deals you won't find anywhere else.
          </p>

          <ul className="space-y-4 mb-10">
            {[
              "Flash discounts up to 60% off",
              "Live product demos & Q&A",
              "Exclusive viewer-only promo codes"
            ].map((item, i) => (
              <li key={i} className="flex items-start text-sm text-gray-300">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3"></span>
                {item}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => navigate('/live')}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-red-700 transition-all group"
          >
            <Radio size={18} className="mr-2" />
            Watch Live Now <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest font-bold">
            390 viewers watching right now
          </p>
        </div>
      </div>
    </section>
  );
};

export default LiveShowSection;