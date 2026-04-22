import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck, Zap } from 'lucide-react';
import { incrementQuantity, decrementQuantity, removeFromCart } from '../features/cart/CartSlice';

const Cart = () => {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  // Dynamic calculation for subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="pt-24 md:pt-32 px-4 md:px-6 max-w-7xl mx-auto min-h-screen font-caslon pb-20">
      {/* Responsive Header */}
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-8 md:mb-12">
        Your Shopping Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Section: Items List */}
        <div className="lg:col-span-2 space-y-8">
          {items.length === 0 ? (
            <div className="border-t border-gray-100 pt-16 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start space-y-6">
                <p className="text-xl md:text-2xl text-gray-400">Your bag is currently empty.</p>
                <Link 
                  to="/" 
                  className="text-lg md:text-xl text-blue-600 font-bold underline hover:text-blue-800 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-white rounded-[2rem] border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image || "https://via.placeholder.com/150"} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow space-y-1">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Premium Collection</p>
                    <h3 className="text-xl font-bold text-blue-900">{item.name}</h3>
                    <p className="text-gray-400 text-sm italic">Ships in 24 hours</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
                    <button 
                      onClick={() => dispatch(decrementQuantity(item.id))}
                      className="p-1 hover:text-blue-600 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="mx-4 font-bold text-blue-900 w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => dispatch(incrementQuantity(item.id))}
                      className="p-1 hover:text-blue-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Price and Remove */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <p className="text-2xl font-black text-blue-900">${(item.price * item.quantity).toFixed(2)}</p>
                    <button 
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-10 sticky top-32 border border-gray-100">
            <h2 className="text-2xl font-bold text-blue-900 mb-8">Order Summary</h2>
            
            <div className="space-y-4 pb-8 border-b border-gray-200">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-blue-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span className="flex items-center"><Truck size={16} className="mr-2" /> Shipping</span>
                <span className="text-blue-600 font-bold uppercase text-xs">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span className="flex items-center"><ShieldCheck size={16} className="mr-2" /> Tax</span>
                <span className="font-bold text-blue-900">$0.00</span>
              </div>
            </div>

            <div className="py-8 space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Estimated Total</p>
                <p className="text-4xl font-black text-blue-900">${subtotal.toFixed(2)}</p>
              </div>
            </div>

            <button className="w-full bg-blue-900 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center group hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10">
              <Zap size={20} className="mr-3" /> Checkout <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-8 space-y-4">
              <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">We Accept</p>
              <div className="flex justify-center gap-2 grayscale opacity-50">
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