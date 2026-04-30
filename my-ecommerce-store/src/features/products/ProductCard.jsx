import React from 'react';
import { ShoppingCart, Star, Tag, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../cart/CartSlice';
import { addToWishlist, removeFromWishlist } from '../wishlist/wishlistSlice'; 
import toast from 'react-hot-toast';

const ProductCard = ({ product = {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const p = product?.product ? product.product : product;
  
  const { isAdmin, isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items); 
  
  const isInWishlist = wishlistItems.some(item => item.product?.id === p.id);

  const rawOriginalPrice = p.original_price ?? p.originalPrice ?? p.base_price ?? 0;
  
  let calculatedPrice = p.price;
  if (calculatedPrice === undefined && p.base_price) {
    const base = parseFloat(p.base_price);
    const discount = p.discount_percentage ? parseFloat(p.discount_percentage) : 0;
    calculatedPrice = base - (base * (discount / 100));
  }

  const currentPrice = parseFloat(calculatedPrice) || 0;
  const originalPrice = parseFloat(rawOriginalPrice) || 0;
  const stock = parseInt(p.stock ?? p.stock_quantity ?? 0, 10) || 0;
  
  const categoryName = p.category_name || (typeof p.category === 'object' ? p.category?.name : null) || 'Uncategorized';
  
  const hasDiscount = originalPrice > currentPrice && originalPrice > 0;
  const discountPercentage = p.discount_percentage || (hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

  const visualMaxStock = 50; 
  const stockBarWidth = Math.min(100, (stock / visualMaxStock) * 100);

  return (
    <motion.div 
      whileHover={!isAdmin ? { y: -10 } : {}}
      onClick={() => {
        if (!isAdmin) {
          navigate(`/product/${p.id}`);
        }
      }}
      className={`bg-white rounded-3xl p-6 border border-gray-100 relative transition-all h-full flex flex-col ${!isAdmin ? 'cursor-pointer group' : 'cursor-default'}`}
    >
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-20 bg-orange-200/50 backdrop-blur-md text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center shadow-sm">
          <Tag size={12} className="mr-1"/> Flash Deal
        </div>
      )}

      {!isAdmin && (
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            
            if (!isAuthenticated) {
              toast.error("Sign in to add to wishlist");
              return; 
            }
            
            if (isInWishlist) {
              const wishlistItem = wishlistItems.find(item => item.product?.id === p.id);
              if (wishlistItem) {
                  dispatch(removeFromWishlist(wishlistItem.id));
              }
            } else {
              dispatch(addToWishlist(p.id));
            }
          }}
          className={`absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
             isInWishlist 
               ? 'bg-pink-50 text-pink-500' 
               : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-white'
          }`}
        >
          <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} />
        </button>
      )}

      <div className="aspect-square rounded-2xl bg-gray-50 mb-6 overflow-hidden shrink-0 relative z-10">
        <img 
          src={p.image || "https://via.placeholder.com/400"} 
          alt={p.name || "Product Image"} 
          className={`w-full h-full object-cover transition-transform duration-700 ${!isAdmin ? 'group-hover:scale-110' : ''}`}
        />
      </div>

      <div className="space-y-2 flex-1 flex flex-col">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest line-clamp-1">
          {categoryName}
        </p>
        
        <h3 className="text-lg font-bold text-blue-900 line-clamp-2">
          {p.name || "Product Name"}
        </h3>
        
        <div className="flex items-center text-yellow-400 space-x-1">
          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
          <span className="text-gray-300 text-xs">(0)</span>
        </div>
        
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

        <div className="flex items-center justify-between pt-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-blue-950">${currentPrice.toFixed(2)}</p>
              {hasDiscount && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                  -{discountPercentage}%
                </span>
              )}
            </div>
            
            {hasDiscount ? (
              <p className="text-xs text-gray-400 line-through mt-0.5">${originalPrice.toFixed(2)}</p>
            ) : (
              <p className="text-xs text-transparent select-none mt-0.5">$0.00</p>
            )}
          </div>
          
          {!isAdmin && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                dispatch(addToCart({ ...p, quantity: 1 }));
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