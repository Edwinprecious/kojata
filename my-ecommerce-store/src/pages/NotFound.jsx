import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-20 font-sans text-center bg-blue-50/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white p-10 md:p-14 relative overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-40 pointer-events-none"></div>
        
        <motion.div 
          initial={{ rotate: -45 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.5, delay: 0.2 }}
          className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner relative z-10"
        >
          <Compass size={48} strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-7xl font-black text-blue-950 mb-2 tracking-tighter relative z-10">404</h1>
        <h2 className="text-xl font-extrabold text-blue-900 mb-4 relative z-10">Looks like you're lost in the wave.</h2>
        
        <p className="text-sm font-bold text-gray-400 mb-10 leading-relaxed relative z-10 px-4">
          The page or collection you are looking for doesn't exist, has been moved, or is currently unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-gray-50 border border-gray-100 text-gray-500 hover:bg-white hover:border-gray-200 hover:text-blue-600 transition-all shadow-sm"
          >
            <ArrowLeft size={16} className="mr-2" /> Go Back
          </button>
          
          <Link 
            to="/"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-1"
          >
            <Home size={16} className="mr-2" /> Shop Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;