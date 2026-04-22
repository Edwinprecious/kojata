import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { addToCart } from '../features/cart/CartSlice';
import { removeFromWishlist } from '../features/wishlist/wishlistSlice';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { items } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const moveToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    dispatch(removeFromWishlist(product.id));
    toast.success('Moved to cart!');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans min-h-screen">
      <div className="mb-12">
        <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-2">Personal Collection</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-950">Your Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
          <Heart size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold">Your favorites list is empty.</p>
          <button onClick={() => window.location.href = '/category/all'} className="mt-6 text-blue-600 font-black uppercase text-xs tracking-widest flex items-center justify-center mx-auto hover:gap-2 transition-all">
            Browse Products <ArrowRight size={14} className="ml-2"/>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="m3-card !p-0 bg-white overflow-hidden group border border-gray-50 shadow-sm">
              <div className="aspect-square relative overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <button 
                  onClick={() => dispatch(removeFromWishlist(item.id))}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-extrabold text-blue-950 mb-1">{item.name}</h3>
                <p className="text-blue-600 font-black text-xl mb-6">${item.price}</p>
                <button 
                  onClick={() => moveToCart(item)}
                  className="m3-button-filled w-full !text-xs !py-3.5"
                >
                  <ShoppingCart size={16} /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;