// src/pages/Cart.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Plus, Minus, ArrowRight, Truck, ShieldCheck, Zap, Tag } from 'lucide-react';
import { incrementQuantity, decrementQuantity, removeFromCart } from '../features/cart/CartSlice';

const Cart = () => {
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <div className="pt-24 md:pt-32 px-4 md:px-6 max-w-7xl mx-auto min-h-screen font-sans pb-20">
      
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-blue-950 mb-8 md:mb-12 tracking-tight">
        Your Shopping Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="lg:col-span-2 space-y-8">
          {items.length === 0 ? (
            <div className="border-t border-gray-100 pt-16 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start space-y-6">
                <p className="text-xl md:text-2xl font-bold text-gray-400">Your bag is currently empty.</p>
                <Link 
                  to="/category/all" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const rawPrice = item.price ?? 0;
                const rawOriginalPrice = item.original_price ?? item.originalPrice ?? 0;
                
                const currentPrice = parseFloat(rawPrice) || 0;
                const originalPrice = parseFloat(rawOriginalPrice) || 0;
                
                const hasDiscount = originalPrice > currentPrice && originalPrice > 0;
                const discountPercentage = item.discount_percentage || (hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

                return (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all"
                  >
                    <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 relative">
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-orange-200/80 backdrop-blur-md text-orange-800 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-sm">
                          -{discountPercentage}%
                        </div>
                      )}
                      <img 
                        src={item.image || "https://via.placeholder.com/150"} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    <div className="flex-grow space-y-1">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Premium Collection</p>
                      <h3 className="text-lg font-bold text-blue-900 line-clamp-2">{item.name}</h3>
                      <p className="text-gray-400 text-xs font-bold flex items-center mt-1">
                        <Truck size={12} className="mr-1 text-green-500" /> Ships in 24 hours
                      </p>
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
                      <button 
                        onClick={() => dispatch(decrementQuantity(item.id))}
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-4 font-black text-blue-900 w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => dispatch(incrementQuantity(item.id))}
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:min-w-[100px]">
                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-black text-blue-900">${(currentPrice * item.quantity).toFixed(2)}</p>
                        {hasDiscount && (
                          <p className="text-xs text-gray-400 font-bold line-through mt-0.5">
                            ${(originalPrice * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        title="Remove from cart"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-10 sticky top-32 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-blue-950 mb-8">Order Summary</h2>
            
            <div className="space-y-5 pb-8 border-b border-gray-200">
              <div className="flex justify-between text-gray-500 font-bold text-sm">
                <span>Original Subtotal</span>
                <span className="text-gray-400">${(totals.subtotal + totals.savings).toFixed(2)}</span>
              </div>
              
              {totals.savings > 0 && (
                <div className="flex justify-between text-orange-600 font-black text-sm items-center">
                  <span className="flex items-center"><Tag size={16} className="mr-2" /> Discounts Applied</span>
                  <span>-${totals.savings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500 font-bold text-sm">
                <span className="flex items-center"><Truck size={16} className="mr-2" /> Shipping</span>
                <span className="text-blue-600 uppercase text-[10px] tracking-widest mt-1">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-gray-500 font-bold text-sm">
                <span className="flex items-center"><ShieldCheck size={16} className="mr-2" /> Tax</span>
                <span className="text-blue-900">$0.00</span>
              </div>
            </div>

            <div className="py-8 space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Estimated Total</p>
                <p className="text-4xl font-black text-blue-950">${totals.subtotal.toFixed(2)}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/signin');
                } else {
                  navigate('/checkout');
                }
              }}
              disabled={items.length === 0}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-xl ${
                items.length > 0 
                  ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Zap size={18} className="mr-2" /> {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
            </button>

            <div className="mt-8 space-y-4">
              <p className="text-[10px] text-gray-400 text-center font-black uppercase tracking-widest">Secure Checkout</p>
              <div className="flex justify-center gap-2 grayscale opacity-40">
                {['Visa', 'Mastercard', 'PayPal', 'ApplePay'].map(p => (
                  <span key={p} className="bg-white border border-gray-200 px-3 py-1 rounded-md text-[8px] font-black">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;