import React from 'react';
import { ShoppingCart, Star, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProductCard = ({ product = {} }) => {
  const navigate = useNavigate();
  
  // FIX: Destructure isAdmin directly from the auth state
  const { user, isAdmin } = useSelector((state) => state.auth);

  // 1. BULLETPROOF PARSING
  const rawPrice = product.price ?? 0;
  const rawOriginalPrice = product.original_price ?? product.originalPrice ?? 0;
  const rawStock = product.stock ?? product.stock_quantity ?? 0;

  const currentPrice = parseFloat(rawPrice) || 0;
  const originalPrice = parseFloat(rawOriginalPrice) || 0;
  const stock = parseInt(rawStock, 10) || 0;
  
  const categoryName = product.category_name || (typeof product.category === 'object' ? product.category?.name : null) || 'Uncategorized';
  
  // 2. ACCURATE DISCOUNT MATH
  const hasDiscount = originalPrice > currentPrice && originalPrice > 0;
  const discountPercentage = product.discount_percentage || (hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

  // 3. STOCK BAR PROGRESS
  const visualMaxStock = 50; 
  const stockBarWidth = Math.min(100, (stock / visualMaxStock) * 100);

  return (
    <motion.div 
      // Only apply the bounce hover effect if NOT an admin
      whileHover={!isAdmin ? { y: -10 } : {}}
      
      // Only navigate if NOT an admin
      onClick={() => {
        if (!isAdmin) {
          navigate(`/product/${product.id}`);
        }
      }}
      
      // Dynamically assign pointer and group classes
      className={`bg-white rounded-3xl p-6 border border-gray-100 relative transition-all h-full flex flex-col ${!isAdmin ? 'cursor-pointer group' : 'cursor-default'}`}
    >
      {/* Dynamic Flash Deal Badge */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-10 bg-orange-200/50 backdrop-blur-md text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center shadow-sm">
          <Tag size={12} className="mr-1"/> Flash Deal
        </div>
      )}

      <div className="aspect-square rounded-2xl bg-gray-50 mb-6 overflow-hidden shrink-0">
        <img 
          src={product.image || "https://via.placeholder.com/400"} 
          alt={product.name || "Product Image"} 
          // Only zoom the image on hover if NOT an admin
          className={`w-full h-full object-cover transition-transform duration-700 ${!isAdmin ? 'group-hover:scale-110' : ''}`}
        />
      </div>

      <div className="space-y-2 flex-1 flex flex-col">
        {/* Dynamic Category */}
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest line-clamp-1">
          {categoryName}
        </p>
        
        {/* Dynamic Name */}
        <h3 className="text-lg font-bold text-blue-900 line-clamp-2">
          {product.name || "Product Name"}
        </h3>
        
        <div className="flex items-center text-yellow-400 space-x-1">
          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
          <span className="text-gray-300 text-xs">(0)</span>
        </div>
        
        {/* Dynamic Stock Indicator */}
        <div className="pt-2 mt-auto">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <p className={stock > 0 ? "text-green-600" : "text-red-500"}>
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </p>
            {stock > 0 && stock <= 10 && <p className="text-red-500">Low Stock!</p>}
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${stock > 10 ? 'bg-blue-600' : 'bg-red-500'} transition-all`} 
              style={{ width: `${stockBarWidth}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Pricing with Inline Discount Percentage */}
        <div className="flex items-center justify-between pt-4">
          <div>
            {/* Current Price & Percentage Badge side-by-side */}
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-blue-950">${currentPrice.toFixed(2)}</p>
              {hasDiscount && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                  -{discountPercentage}%
                </span>
              )}
            </div>
            
            {/* Original Strikethrough Price */}
            {hasDiscount ? (
              <p className="text-xs text-gray-400 line-through mt-0.5">${originalPrice.toFixed(2)}</p>
            ) : (
              <p className="text-xs text-transparent select-none mt-0.5">$0.00</p>
            )}
          </div>
          
          {/* Conditional Cart Button (Invisible for Admins) */}
          {!isAdmin && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevents the card click (navigation) from firing
                // Cart addition logic will go here
              }}
              className="bg-blue-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors shrink-0 shadow-sm"
            >
              <ShoppingCart size={20}/>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;