import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Heart, Truck, ArrowLeft, 
  Plus, Minus, Star, Share2, MessageSquare, CheckCircle, X,
  PackageX, Tag 
} from 'lucide-react';
import { addToCart } from '../features/cart/CartSlice';
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice'; 
import api from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { token, isAuthenticated, isAdmin } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items); 
  
  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const prodRes = await api.get(`/products/${id}/`);
        const productData = prodRes.data;
        setProduct(productData);

        if (typeof productData.category === 'object') {
          setCategoryName(productData.category.name);
        } else {
          const catRes = await api.get(`/categories/`);
          const categories = Array.isArray(catRes.data) ? catRes.data : catRes.data.results || [];
          const matchedCat = categories.find(c => c.id === productData.category);
          setCategoryName(matchedCat ? matchedCat.name : 'Store Item');
        }

        const reviewRes = await api.get(`/reviews/?product=${id}`);
        setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : reviewRes.data.results || []);

      } catch (error) {
        console.error(error);
        toast.error("Could not load product details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '16px', fontWeight: '800' }
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("You must be signed in to leave a review.");
      return;
    }
    if (userRating === 0) {
      return toast.error("Please select a star rating.");
    }

    const reviewToast = toast.loading("Submitting review...");

    try {
      const response = await api.post('/reviews/', {
        product: product.id,
        rating: userRating,
        comment: reviewComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviews([response.data, ...reviews]);
      setIsReviewModalOpen(false);
      setUserRating(0);
      setReviewComment('');
      toast.success("Review published successfully!", { id: reviewToast });

    } catch (error) {
      // Parse the backend error message directly
      const errorMessage = error.response?.data?.error || error.response?.data?.non_field_errors?.[0] || "Failed to submit review.";
      toast.error(errorMessage, { id: reviewToast });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-900 font-bold uppercase tracking-widest text-xs">Loading Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
          <PackageX size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-blue-950 mb-2">Product Not Found</h2>
        <p className="text-gray-400 font-bold mb-6">This item may have been removed or doesn't exist.</p>
        <button onClick={() => navigate('/category/all')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Return to Shop</button>
      </div>
    );
  }

  const rawOriginalPrice = product.original_price ?? product.originalPrice ?? product.base_price ?? 0;
  
  let calculatedPrice = product.price;
  if (calculatedPrice === undefined && product.base_price) {
    const base = parseFloat(product.base_price);
    const discount = product.discount_percentage ? parseFloat(product.discount_percentage) : 0;
    calculatedPrice = base - (base * (discount / 100));
  }

  const currentPrice = parseFloat(calculatedPrice) || 0;
  const originalPrice = parseFloat(rawOriginalPrice) || 0;
  
  const hasDiscount = originalPrice > currentPrice && originalPrice > 0;
  const discountPercentage = product.discount_percentage || (hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

  const isInWishlist = wishlistItems.some(item => item.product?.id === product.id);

  // --- Review Calculation Stats ---
  const totalReviews = reviews.length;
  const dynamicAvgRating = totalReviews > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) 
    : "0.0";

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (starCounts[r.rating] !== undefined) starCounts[r.rating]++;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 font-sans">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-xs font-black text-gray-400 hover:text-blue-600 mb-12 transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={14} className="mr-2" /> Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[40px] overflow-hidden aspect-square bg-gray-50 border border-gray-100 shadow-sm relative group">
          {hasDiscount && (
            <div className="absolute top-6 left-6 z-10 bg-orange-200/80 backdrop-blur-md text-orange-800 px-4 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm">
              <Tag size={16} className="mr-1.5"/> Flash Deal
            </div>
          )}

          {product.image ? (
             <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest">No Image</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <p className="text-blue-600 font-black text-xs uppercase tracking-widest">{categoryName}</p>
            <button className="text-gray-300 hover:text-blue-600 transition-colors"><Share2 size={20} /></button>
          </div>
          
          <h1 className="text-4xl md:text-6xl mb-6 text-blue-950 font-extrabold tracking-tight leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <p className="text-3xl font-black text-blue-600">${currentPrice.toFixed(2)}</p>
                {hasDiscount && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
                    -{discountPercentage}%
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-gray-400 line-through mt-1">${originalPrice.toFixed(2)}</p>
              )}
            </div>

            <div className="h-8 w-[1px] bg-gray-100"></div>
            
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < Math.floor(dynamicAvgRating) ? "currentColor" : "none"} className="mr-1" />
              ))}
              <span className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-tighter">{totalReviews} reviews</span>
            </div>
          </div>

          <p className="text-gray-500 text-lg leading-relaxed mb-8">{product.description}</p>

          <div className="flex items-center gap-2 mb-10 text-sm font-bold text-gray-400">
            <Truck size={18} className="text-green-500" />
            <span>{product.stock > 0 ? `${product.stock} items in stock. Ready to ship.` : "Currently Out of Stock"}</span>
          </div>

          {!isAdmin && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-100 rounded-full p-1.5 bg-gray-50/50">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-white rounded-full transition-all active:scale-90"><Minus size={18} /></button>
                  <span className="px-8 font-black text-xl text-blue-950">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 hover:bg-white rounded-full transition-all active:scale-90"><Plus size={18} /></button>
                </div>
                
                <button 
                  onClick={() => {
                     if (!isAuthenticated) {
                       toast.error("Sign in to add to wishlist");
                       return; 
                     }
                     
                     if (isInWishlist) {
                       const wishlistItem = wishlistItems.find(item => item.product?.id === product.id);
                       if (wishlistItem) {
                           dispatch(removeFromWishlist(wishlistItem.id));
                       }
                     } else {
                       dispatch(addToWishlist(product.id));
                     }
                  }}
                  className={`p-5 rounded-full border transition-all shadow-sm hover:shadow-md ${
                    isInWishlist 
                      ? 'bg-pink-50 border-pink-200 text-pink-500 hover:text-pink-600' 
                      : 'border-gray-100 text-gray-400 bg-white hover:text-pink-500'
                  }`}
                >
                  <Heart size={24} fill={isInWishlist ? "currentColor" : "none"} />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart} 
                disabled={product.stock <= 0}
                className={`w-full py-5 rounded-2xl text-lg font-black tracking-widest uppercase transition-all shadow-xl ${product.stock > 0 ? "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <section className="mt-32 pt-24 border-t border-gray-100">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Dynamic Review Breakdown Panel */}
          <div className="lg:w-1/3 space-y-8">
            <div>
              <h2 className="text-3xl font-extrabold text-blue-950 mb-2">Customer Feedback</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verified Social Proof</p>
            </div>

            <div className="border border-blue-100 bg-blue-50/50 p-8 text-center rounded-[2rem]">
              <p className="text-7xl font-black text-blue-600 mb-2">{dynamicAvgRating}</p>
              <div className="flex justify-center text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < Math.floor(dynamicAvgRating) ? "currentColor" : "none"} />)}
              </div>
              <p className="text-sm font-bold text-blue-900 mb-6">Based on {totalReviews} Verified Purchases</p>
              
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = starCounts[star];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center text-[11px] font-bold text-blue-900 uppercase tracking-widest">
                      <span className="w-16 text-left">{star} Stars</span>
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-blue-100 mx-2">
                        <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="w-10 text-right">{Math.round(percentage)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {!isAdmin && (
              <div className="pt-4">
                <button 
                  onClick={() => {
                    if(!isAuthenticated) {
                       toast.error("Please sign in to rate products.");
                    } else {
                       setIsReviewModalOpen(true);
                    }
                  }}
                  className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex justify-center items-center transition-colors"
                >
                  <MessageSquare size={18} className="mr-2" /> Rate your Purchase
                </button>
              </div>
            )}
          </div>

          <div className="lg:w-2/3">
            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-gray-100">
                 <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
                 <p className="text-gray-400 font-bold">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <motion.div key={review.id} whileHover={{ y: -5 }} className="bg-white rounded-[2rem] border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 p-8 flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                        {review.verified && (
                          <span className="flex items-center text-[9px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                            <CheckCircle size={10} className="mr-1" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-blue-950 font-bold leading-relaxed mb-8">"{review.comment}"</p>
                    </div>
                    <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                      <div>
                        <p className="text-xs font-black text-blue-900">{review.user?.username || 'Customer'}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">
                          {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewModalOpen(false)} className="absolute inset-0 bg-blue-950/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 relative z-10 shadow-2xl">
              <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400"/></button>
              
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-blue-950 mb-2">How was your {product.name}?</h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Share your experience with the wave</p>
              </div>

              <form onSubmit={submitReview} className="space-y-8">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(star)}
                      className="transition-transform active:scale-75 p-1"
                    >
                      <Star 
                        size={36} 
                        fill={(hoverRating || userRating) >= star ? "#eab308" : "none"} 
                        className={(hoverRating || userRating) >= star ? "text-yellow-400" : "text-gray-200"}
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Your Review</label>
                  <textarea 
                    required 
                    rows="4" 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you love about it?" 
                    className="w-full p-6 rounded-3xl bg-gray-50 border border-gray-100 outline-none focus:border-blue-500 font-semibold text-blue-950 resize-none transition-colors" 
                  />
                </div>

                <button type="submit" className="bg-blue-600 text-white rounded-2xl w-full !py-5 font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                  Publish Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;