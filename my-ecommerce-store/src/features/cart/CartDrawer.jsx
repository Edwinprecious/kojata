import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
// ADDED 'Tag' and 'Truck' to the import list below
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Zap, Tag, Truck } from 'lucide-react';
import { toggleCart, incrementQuantity, decrementQuantity, removeFromCart } from './CartSlice';

const CartDrawer = () => {
  const { items, isOpen } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
              <button onClick={() => dispatch(toggleCart())} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-500 font-bold">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-blue-900 text-sm">{item.name}</h4>
                      <p className="text-blue-600 font-black">${item.price}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-100 rounded-full px-2">
                          <button onClick={() => dispatch(decrementQuantity(item.id))} className="p-1"><Minus size={12}/></button>
                          <span className="mx-3 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => dispatch(incrementQuantity(item.id))} className="p-1"><Plus size={12}/></button>
                        </div>
                        <button onClick={() => dispatch(removeFromCart(item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-8 border-t border-gray-100 space-y-4">
                <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
                  <p className="text-blue-600 text-xs font-bold flex items-center">
                    <Tag size={14} className="mr-2" /> You're saving
                  </p>
                  <p className="text-blue-600 font-black text-sm">-$0.00</p>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <p className="text-gray-400 font-bold text-xs uppercase">Subtotal</p>
                  <p className="text-2xl font-black text-blue-900">${subtotal.toFixed(2)}</p>
                </div>

                <button 
                  onClick={() => { dispatch(toggleCart()); window.location.href = '/checkout'; }}
                  className="m3-button-filled w-full !py-5 shadow-xl shadow-blue-200"
                >
                  Checkout Now <ArrowRight className="ml-2" size={18} />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;