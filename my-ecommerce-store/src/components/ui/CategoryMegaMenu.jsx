import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Grid, ArrowRight } from 'lucide-react';

const CategoryMegaMenu = ({ categories = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 160);
  };

  return (
    <div
      ref={containerRef}
      className="static lg:relative py-2"
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="category-mega-menu"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1.5 uppercase tracking-wider transition-colors ${
          isOpen ? 'text-blue-600' : 'hover:text-blue-600'
        }`}
      >
        <Grid size={16} />
        Categories
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="category-mega-menu"
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-20 mx-auto w-full max-w-5xl bg-white border border-gray-100 rounded-2xl shadow-xl shadow-blue-900/5 p-6 z-50"
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">
              Shop by category
            </p>

            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                No categories yet. Add one from the admin dashboard.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id ?? cat.slug}
                    to={`/category/${cat.slug}`}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-blue-50/60 hover:text-blue-700 transition-colors"
                  >
                    <span className={`${cat.color} bg-gray-50 p-2 rounded-lg shrink-0`}>
                      {cat.icon}
                    </span>
                    <span className="capitalize truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100">
              <Link
                to="/category/all"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all categories <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryMegaMenu;