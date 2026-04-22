import React from 'react';
import { motion } from 'framer-motion';

const InfoLayout = ({ subtitle, title, children }) => (
  <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 font-sans">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-4">{subtitle}</p>
      <h1 className="text-4xl md:text-6xl font-black text-blue-950 mb-12 tracking-tighter">{title}</h1>
      <div className="prose prose-blue max-w-none text-gray-500 font-semibold leading-relaxed space-y-8">
        {children}
      </div>
    </motion.div>
  </div>
);

export default InfoLayout;