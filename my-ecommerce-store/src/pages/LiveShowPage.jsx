import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, ShoppingCart, MessageCircle, Share2, Info } from 'lucide-react';
import { useYouTube } from '../hooks/useYouTube';
import YouTubeEmbed from '../features/livestream/YouTubeEmbed';

const LiveShowPage = () => {
  const { isLive, videoId, title } = useYouTube(); // Fetches real-time YouTube data

  return (
    <main className="min-h-screen pt-28 pb-20 bg-white font-caslon">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header Information */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                {isLive ? 'Live Now' : 'Offline'}
              </span>
              <span className="text-gray-400 text-sm flex items-center">
                <Users size={16} className="mr-2" /> 390 Watching
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
              {isLive ? title : "Waiting for next Live Show..."}
            </h1>
          </div>
          
          <div className="flex space-x-3">
            <button className="p-3 border border-gray-100 rounded-full hover:bg-gray-50 transition-all text-gray-600">
              <Share2 size={20} />
            </button>
            <button className="p-3 border border-gray-100 rounded-full hover:bg-gray-50 transition-all text-gray-600">
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* Main Theater Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left/Center: Video Player Area */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl aspect-video border-8 border-gray-900/5">
              {isLive && videoId ? (
                <YouTubeEmbed videoId={videoId} /> // Utilizes your existing embed logic
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

            {/* Stream Description Section */}
            <div className="mt-10 p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <h3 className="text-xl font-bold text-blue-900 mb-4">About this Live Event</h3>
              <p className="text-gray-600 leading-relaxed">
                Join our host for an exclusive deep dive into our new arrivals. We'll be doing real-time product demos, 
                answering your questions live, and dropping flash discount codes every 15 minutes that are only valid 
                during this broadcast. Don't miss out on the savings!
              </p>
            </div>
          </div>

          {/* Right: Live Shopping & Interaction Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Live Deals Section from Screenshot Design */}
            <div className="bg-[#111827] rounded-[2rem] p-8 text-white shadow-xl h-fit">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-bold flex items-center">
                  <Zap size={18} className="text-blue-500 mr-2" /> Live Deals
                </h4>
                <span className="bg-blue-500 text-[10px] px-2 py-1 rounded-md font-black uppercase">Active</span>
              </div>

              <div className="space-y-6">
                {/* Product Deal Item */}
                {[1, 2].map((item) => (
                  <motion.div 
                    key={item}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center space-x-4"
                  >
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden">
                      <img src="https://via.placeholder.com/150" alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Save 40%</p>
                      <h5 className="text-sm font-bold text-white">Premium Item {item}</h5>
                      <p className="text-lg font-black">$49.99 <span className="text-[10px] text-gray-500 line-through">$89.00</span></p>
                    </div>
                    <button className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition-colors">
                      <ShoppingCart size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Live Chat Highlights</p>
                <div className="space-y-4 text-xs">
                  <p><span className="text-blue-400 font-bold">Alex:</span> Is the blue color in stock? 😍</p>
                  <p><span className="text-orange-400 font-bold">Sarah:</span> Just grabbed the blender, such a steal!</p>
                </div>
              </div>

              <button className="w-full mt-10 bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                <MessageCircle size={18} className="mr-2" />
                Open Live Chat
              </button>
            </div>

            {/* Subscriber CTA */}
            <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8">
              <h4 className="text-blue-900 font-bold mb-2">Never miss a show</h4>
              <p className="text-xs text-blue-700 mb-6 leading-relaxed">
                Get notified instantly on your phone when we go live with new deals.
              </p>
              <button className="w-full bg-white border-2 border-blue-900 text-blue-900 py-3 rounded-full font-bold hover:bg-blue-900 hover:text-white transition-all">
                Remind Me
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default LiveShowPage;