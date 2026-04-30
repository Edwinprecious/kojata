import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { toggleCart, incrementQuantity, decrementQuantity, removeFromCart } from './CartSlice';

const CartDrawer = () => {
  const { items, isOpen } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Dynamic Calculation for Subtotal and Savings
  const totals = items.reduce((acc, item) => {
    const rawPrice = item.price ?? 0;
    const rawOriginalPrice = item.original_price ?? item.originalPrice ?? 0;
    
    const currentPrice = parseFloat(rawPrice) || 0;
    const originalPrice = parseFloat(rawOriginalPrice) || 0;
    
    acc.subtotal += currentPrice * item.quantity;
    
    if (originalPrice > currentPrice) {
      acc.savings += (originalPrice - currentPrice) * item.quantity;
    }
    
    return acc;
  }, { subtotal: 0, savings: 0 });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleCart())}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white z-[120] shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-blue-900">Your Cart</h2>
              <button onClick={() => dispatch(toggleCart())} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold">Your cart is currently empty.</p>
                  <button 
                    onClick={() => { dispatch(toggleCart()); navigate('/category/all'); }}
                    className="mt-6 bg-gray-50 text-blue-600 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const rawPrice = item.price ?? 0;
                  const rawOriginalPrice = item.original_price ?? item.originalPrice ?? 0;
                  const currentPrice = parseFloat(rawPrice) || 0;
                  const originalPrice = parseFloat(rawOriginalPrice) || 0;
                  const hasDiscount = originalPrice > currentPrice && originalPrice > 0;

                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-blue-900 text-sm line-clamp-1">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-blue-600 font-black">${currentPrice.toFixed(2)}</p>
                            {hasDiscount && (
                              <p className="text-gray-400 text-[10px] font-bold line-through">${originalPrice.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-100 rounded-full px-2">
                            <button onClick={() => dispatch(decrementQuantity(item.id))} className="p-1 hover:text-blue-600 transition-colors"><Minus size={12}/></button>
                            <span className="mx-3 text-xs font-bold text-blue-900">{item.quantity}</span>
                            <button onClick={() => dispatch(incrementQuantity(item.id))} className="p-1 hover:text-blue-600 transition-colors"><Plus size={12}/></button>
                          </div>
                          <button onClick={() => dispatch(removeFromCart(item.id))} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-8 border-t border-gray-100 space-y-4 bg-white">
                
                {/* Dynamic Savings Banner */}
                {totals.savings > 0 && (
                  <div className="bg-orange-50/80 border border-orange-100 p-3 rounded-xl flex items-center justify-between mb-4">
                    <p className="text-orange-600 text-xs font-black flex items-center uppercase tracking-widest">
                      <Tag size={14} className="mr-2" /> You're saving
                    </p>
                    <p className="text-orange-600 font-black text-sm">${totals.savings.toFixed(2)}</p>
                  </div>
                )}

                <div className="flex justify-between items-end pt-2 mb-4">
                  <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Subtotal</p>
                  <p className="text-3xl font-black text-blue-950">${totals.subtotal.toFixed(2)}</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { dispatch(toggleCart()); navigate('/cart'); }}
                    className="flex-1 bg-white border-2 border-gray-100 text-blue-900 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:border-blue-200 hover:bg-blue-50 transition-all text-center"
                  >
                    View Bag
                  </button>
                  <button 
                    onClick={() => { dispatch(toggleCart()); navigate('/checkout'); }}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    Checkout <ArrowRight className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;