import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import ProductCard from '../features/products/ProductCard';
import { Heart, Loader } from 'lucide-react';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Your Wishlist is Private</h2>
        <p className="text-gray-500 mt-2">Please sign in to view and manage your favorite items.</p>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-gray-900">
        <Heart className="fill-red-500 text-red-500" /> My Favorites
      </h1>
      
      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-xl font-medium">You haven't saved any items yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {items.map((item) => {
            const productData = item.product || item;
            
            if (!productData || typeof productData !== 'object') return null;

            return (
              <div key={item.id} className="relative group">
                <ProductCard product={productData} />
                <button 
                  onClick={() => dispatch(removeFromWishlist(item.id))}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 transition-colors z-10"
                  title="Remove from wishlist"
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;