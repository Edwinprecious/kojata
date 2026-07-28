import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Zap, ShoppingCart, MessageCircle, Share2,
  Info, Send, Radio, Bell, X, Pin, Star
} from 'lucide-react';
import { useYouTube } from '../hooks/useYouTube';
import YouTubeEmbed from '../features/livestream/YouTubeEmbed';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/CartSlice';
import api from '../services/api';

// ─── Live Comment Component ──────────────────────────────────────────────────
const Youtube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

const CommentItem = ({ comment }) => {
  const sourceBadge = comment.source === 'youtube'
    ? <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">YT</span>
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`text-xs flex gap-2 ${comment.is_highlighted ? 'bg-blue-500/10 border border-blue-500/20 rounded-xl p-2' : ''}`}
    >
      {comment.is_pinned && <Pin size={10} className="text-yellow-400 mt-1 shrink-0" />}
      <div>
        <span className={`font-bold mr-1 ${comment.is_highlighted ? 'text-blue-400' : 'text-blue-300'}`}>
          {comment.display_name}:
        </span>
        {sourceBadge && <span className="mr-1">{sourceBadge}</span>}
        <span className="text-gray-300">{comment.message}</span>
      </div>
    </motion.div>
  );
};

// ─── Comment Input ────────────────────────────────────────────────────────────
const CommentInput = ({ onSubmit, posting }) => {
  const user = useSelector((s) => s.auth?.user);
  const [msg, setMsg] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!msg.trim()) return;
    if (!user && !guestName.trim()) {
      setError('Enter your name to comment');
      return;
    }
    setError('');
    try {
      await onSubmit({
        message: msg,
        display_name: user ? undefined : guestName,
      });
      setMsg('');
    } catch {
      setError('Failed to send. Try again.');
    }
  };

  return (
    <div className="space-y-2">
      {!user && (
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          maxLength={50}
        />
      )}
      <div className="flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Say something…"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          maxLength={300}
        />
        <button
          onClick={handleSend}
          disabled={posting || !msg.trim()}
          className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {posting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
    </div>
  );
};


// ─── Main Page ────────────────────────────────────────────────────────────────
const LiveShowPage = () => {
  const {
    isLive, videoId, title, description, broadcastId,
    viewerCount, event,
    comments, loadingComments, postingComment, submitComment,
  } = useYouTube();

  const dispatch = useDispatch();
  const [liveProducts, setLiveProducts] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const chatEndRef = useRef(null);
  const pinnedComment = comments.find((c) => c.is_pinned);
  const regularComments = comments.filter((c) => !c.is_pinned);

  // Load products associated with the linked flash event
  useEffect(() => {
    if (!event?.id) {
      setLiveProducts([]);
      return;
    }
    api.get('/products/', { params: { event: event.id } })
      .then((res) => setLiveProducts((res.data.results || res.data).slice(0, 4)))
      .catch(() => setLiveProducts([]));
  }, [event?.id]);

  // Scroll chat to bottom on new comments
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    }));
  };

  return (
    <main className="min-h-screen pt-28 pb-20 bg-white font-caslon">
      <div className="max-w-[1600px] mx-auto px-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center ${isLive ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                {isLive ? 'Live Now' : 'Offline'}
              </span>
              {isLive && (
                <span className="text-gray-400 text-sm flex items-center">
                  <Users size={16} className="mr-2" />
                  {viewerCount.toLocaleString()} Watching
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
              {isLive ? title : 'Waiting for next Live Show…'}
            </h1>
            {isLive && description && (
              <p className="text-gray-500 text-sm mt-1">{description}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <button className="p-3 border border-gray-100 rounded-full hover:bg-gray-50 transition-all text-gray-600">
              <Share2 size={20} />
            </button>
            <button
              onClick={() => setShowChat((p) => !p)}
              className={`p-3 border rounded-full transition-all ${showChat ? 'bg-blue-900 text-white border-blue-900' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>

        {/* ── Theater Layout ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── Video Column ─────────────────────────────────────────────── */}
          <div className={showChat ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl aspect-video border-8 border-gray-900/5">
              {isLive && videoId ? (
                <YouTubeEmbed videoId={videoId} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a111f] text-white">
                  <div className="bg-blue-600/20 p-6 rounded-full mb-6">
                    <Zap size={48} className="text-blue-500 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold">The show hasn't started yet</h3>
                  <p className="text-gray-500 mt-2">Check back soon for exclusive live deals!</p>
                </div>
              )}
            </div>

            {/* Flash Event Banner */}
            {isLive && event && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3"
              >
                <Zap size={18} className="text-orange-500" />
                <p className="text-sm text-orange-700 font-bold">
                  Flash Sale Active: <span className="font-black">{event.name}</span>
                  &nbsp;— Exclusive discounts for live viewers!
                </p>
              </motion.div>
            )}

            {/* About section */}
            <div className="mt-8 p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 className="text-xl font-bold text-blue-900 mb-4">About this Live Event</h3>
              <p className="text-gray-600 leading-relaxed">
                {isLive && description
                  ? description
                  : 'Join our host for an exclusive deep dive into new arrivals. Real-time product demos, live Q&A, and flash discount codes every 15 minutes — only valid during this broadcast.'}
              </p>
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                key="sidebar"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="lg:col-span-1 space-y-6"
              >
                {/* Live Deals */}
                <div className="bg-[#111827] rounded-[2rem] p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold flex items-center">
                      <Zap size={18} className="text-blue-500 mr-2" /> Live Deals
                    </h4>
                    <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase ${isLive && event ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                      {isLive && event ? 'Active' : 'Offline'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {liveProducts.length > 0 ? (
                      liveProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-3"
                        >
                          <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0">
                            {product.image
                              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                            }
                          </div>
                          <div className="flex-grow min-w-0">
                            {product.discount_percentage > 0 && (
                              <p className="text-[10px] font-bold text-blue-400 uppercase">Save {product.discount_percentage}%</p>
                            )}
                            <h5 className="text-xs font-bold text-white truncate">{product.name}</h5>
                            <p className="text-sm font-black">
                              ${product.price}
                              {product.discount_percentage > 0 && (
                                <span className="text-[10px] text-gray-500 line-through ml-1">${product.original_price}</span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition-colors shrink-0"
                          >
                            <ShoppingCart size={14} />
                          </button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <ShoppingCart size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs">{isLive ? 'No deals linked to this stream' : 'Deals appear when stream is live'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Chat */}
                <div className="bg-[#111827] rounded-[2rem] p-6 text-white shadow-xl flex flex-col" style={{ minHeight: 400 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center">
                      <MessageCircle size={16} className="mr-2 text-blue-400" />
                      Live Chat
                    </h4>
                    <span className="text-[10px] text-gray-500">{comments.length} messages</span>
                  </div>

                  {/* Pinned comment */}
                  {pinnedComment && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2 mb-3 flex gap-2">
                      <Pin size={12} className="text-yellow-400 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-yellow-400">{pinnedComment.display_name}: </span>
                        <span className="text-gray-300">{pinnedComment.message}</span>
                      </div>
                    </div>
                  )}

                  {/* Comments list */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1" style={{ maxHeight: 280 }}>
                    {loadingComments && comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-xs">Loading chat…</div>
                    ) : regularComments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle size={24} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs">Be the first to comment!</p>
                      </div>
                    ) : (
                      [...regularComments].reverse().map((c) => (
                        <CommentItem key={c.id} comment={c} />
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Comment input */}
                  {broadcastId ? (
                    <CommentInput onSubmit={submitComment} posting={postingComment} />
                  ) : (
                    <p className="text-xs text-gray-500 text-center">Chat opens when the stream is live.</p>
                  )}
                </div>

                {/* Subscribe CTA */}
                <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell size={16} className="text-blue-700" />
                    <h4 className="text-blue-900 font-bold">Never miss a show</h4>
                  </div>
                  <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                    Get notified the moment we go live with exclusive deals.
                  </p>
                  <a
                    href={videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-full font-bold hover:bg-red-700 transition-all text-sm"
                  >
                    <Youtube size={16} />
                    Watch on YouTube
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  );
};

export default LiveShowPage;