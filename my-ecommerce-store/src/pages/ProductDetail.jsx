import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ShoppingBag, Heart, ShieldCheck, Truck, ArrowLeft, 
  Plus, Minus, Star, Share2, MessageSquare, CheckCircle, X 
} from 'lucide-react';
import { products } from '../data/products';
import { addToCart } from '../features/cart/CartSlice';

const topReviews = [
  { id: 1, name: "Alexander V.", rating: 5, date: "2 days ago", comment: "The build quality is exceptional. It feels much more premium than the photos suggest.", verified: true },
  { id: 2, name: "Sarah M.", rating: 5, date: "1 week ago", comment: "Perfect balance of form and function. Fits perfectly into my minimalist setup.", verified: true },
  { id: 3, name: "David K.", rating: 4, date: "2 weeks ago", comment: "Solid performance. The blue accent is a nice touch. Shipping was surprisingly fast.", verified: true },
  { id: 4, name: "Elena G.", rating: 5, date: "1 month ago", comment: "ShopWave never misses with the packaging. An unboxing experience as good as the product.", verified: true },
  { id: 5, name: "Marcus T.", rating: 5, date: "1 month ago", comment: "Highly recommend for anyone looking for the best in this category. Worth every penny.", verified: true },
  { id: 6, name: "Julian P.", rating: 4, date: "2 months ago", comment: "Minimalist, sleek, and high-performance. Exactly what I was looking for.", verified: true },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // States
  const [quantity, setQuantity] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <h2 className="text-2xl font-extrabold text-blue-900">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 m3-button-tonal">Return to Shop</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '16px', fontWeight: '800' }
    });
  };

  const submitReview = (e) => {
    e.preventDefault();
    toast.success("Review submitted! It will appear after verification.", { icon: '✨' });
    setIsReviewModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 font-sans">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-xs font-bold text-gray-400 hover:text-blue-600 mb-12 transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={14} className="mr-2" /> Back to Collection
      </button>

      {/* PRODUCT CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[40px] overflow-hidden aspect-square bg-gray-50 border border-gray-100 shadow-sm">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <p className="text-blue-600 font-black text-xs uppercase tracking-widest">{product.category}</p>
            <button className="text-gray-300 hover:text-blue-600 transition-colors"><Share2 size={20} /></button>
          </div>
          <h1 className="text-4xl md:text-6xl mb-6 text-blue-950">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-10">
            <p className="text-3xl font-black text-blue-600">${product.price}</p>
            <div className="h-8 w-[1px] bg-gray-100"></div>
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className="mr-1" />
              ))}
              <span className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-tighter">{product.reviews} reviews</span>
            </div>
          </div>

          <p className="text-gray-500 text-lg leading-relaxed mb-12">{product.description}</p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-100 rounded-full p-1.5 bg-gray-50/50">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:bg-white rounded-full transition-all active:scale-90"><Minus size={18} /></button>
                <span className="px-8 font-black text-xl text-blue-950">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-2 hover:bg-white rounded-full transition-all active:scale-90"><Plus size={18} /></button>
              </div>
              <button className="p-4 rounded-full border border-gray-100 hover:text-pink-500 transition-all text-gray-400"><Heart size={24} /></button>
            </div>
            <button onClick={handleAddToCart} className="m3-button-filled !py-5 w-full text-lg">Add to Cart</button>
          </div>
        </motion.div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <section className="mt-32 pt-24 border-t border-gray-100">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3 space-y-8">
            <div>
              <h2 className="text-3xl font-extrabold text-blue-950 mb-2">Customer Feedback</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verified Social Proof</p>
            </div>

            <div className="m3-card !bg-blue-50/50 border border-blue-100 p-8 text-center">
              <p className="text-7xl font-black text-blue-600 mb-2">4.8</p>
              <div className="flex justify-center text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-sm font-bold text-blue-900">Based on 124 Verified Purchases</p>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="m3-button-filled w-full !py-4"
              >
                <MessageSquare size={18} className="mr-2" /> Rate your Purchase
              </button>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topReviews.map((review) => (
                <motion.div key={review.id} whileHover={{ y: -5 }} className="m3-card !bg-white border border-gray-50 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                      <span className="flex items-center text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-widest">
                        <CheckCircle size={10} className="mr-1" /> Verified
                      </span>
                    </div>
                    <p className="text-sm text-blue-950 font-bold leading-relaxed mb-6">"{review.comment}"</p>
                  </div>
                  <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-xs font-black text-blue-900">{review.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{review.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- RATING MODAL --- */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewModalOpen(false)} className="absolute inset-0 bg-blue-950/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[32px] p-8 md:p-12 relative z-10 shadow-2xl">
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
                  <textarea required rows="4" placeholder="What did you love about it?" className="w-full p-6 rounded-3xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-950 resize-none" />
                </div>

                <button type="submit" className="m3-button-filled w-full !py-5 shadow-xl shadow-blue-600/20">
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