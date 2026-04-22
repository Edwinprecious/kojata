import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Play, LayoutGrid } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative h-[85vh] flex items-center px-6 md:px-12 overflow-hidden bg-white font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="z-10"
        >
          <span className="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Zap size={14} className="mr-2" /> Limited Time Event
          </span>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-blue-950 leading-[0.9] tracking-tighter mb-10">
            The Future <br/> Of Shopping <br/> <span className="text-blue-600">Is Live.</span>
          </h1>
          
          {/* Button Group */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            {/* Primary Action: Same style as Signup */}
            <Link 
              to="/deals" 
              className="w-full sm:w-auto bg-blue-600 text-white px-5 py-5 rounded-full font-bold text-lg shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center group"
            >
              Shop Flash Deals 
              <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Secondary Action: Same style as Cart button */}
              <Link 
                to="/category/all" 
                className="flex-1 sm:flex-none bg-blue-900 text-white px-8 py-5 rounded-full font-bold text-base shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center justify-center"
              >
                <LayoutGrid size={18} className="mr-2" /> Browse All
              </Link>
              
              {/* Live Button: Classic Red Pulse Style */}
              <Link 
                to="/live" 
                className="flex-1 sm:flex-none bg-white-600 text-red-600 px-6 py-5 rounded-full font-bold text-base shadow-xl shadow-red-600/20 hover:bg-white-700 transition-all flex items-center justify-center"
              >
                <span className="animate-pulse mr-2 text-xl ">●</span> Watch Live
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Visual Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden lg:block relative"
        >
          {/* Decorative Back-shape */}
          <div className="absolute inset-0 bg-blue-100 rounded-[60px] rotate-3 -z-10 opacity-30 blur-2xl"></div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-900 rounded-[60px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <img 
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop" 
              alt="Featured Product" 
              className="relative rounded-[60px] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
            />
            
            {/* Minimal Price Tag Overlay */}
            <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">New Arrival</p>
              <p className="text-xl font-black text-blue-950">Aura Watch S2</p>
              <p className="text-2xl font-black text-blue-600 mt-2">$185.00</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block opacity-20">
        <div className="w-[2px] h-12 bg-blue-900 rounded-full">
          <motion.div 
            animate={{ y: [0, 24, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-1/3 bg-blue-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;