import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  User, Package, MapPin, CreditCard, 
  Settings, ChevronRight, Camera, LogOut,
  ShieldCheck, Bell, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { token } = useSelector((state) => state.auth);
  const [user, setUser] = useState({ username: 'User', email: 'loading...' });

  // Sidebar links configuration
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <User size={20} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-blue-50/30 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar: Profile Navigation */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-8 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-600/20">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-100 hover:text-blue-600 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="text-xl font-black text-blue-950 capitalize">{user.username}</h2>
            <p className="text-sm font-bold text-gray-400 truncate">{user.email}</p>
          </div>

          <nav className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  {item.label}
                </div>
                <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content: Tab Panes */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-10 min-h-[600px]"
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <header>
                    <h1 className="text-3xl font-black text-blue-950 mb-2">Account Overview</h1>
                    <p className="text-gray-400 font-bold">Manage your profile and recent activity</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><Package size={20} /></div>
                        <span className="font-black text-xs uppercase tracking-widest text-blue-900">Total Orders</span>
                      </div>
                      <p className="text-4xl font-black text-blue-950">12</p>
                    </div>
                    <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl text-red-500 shadow-sm"><Heart size={20} /></div>
                        <span className="font-black text-xs uppercase tracking-widest text-blue-900">Saved Items</span>
                      </div>
                      <p className="text-4xl font-black text-blue-950">8</p>
                    </div>
                  </div>

                  <section className="space-y-4 pt-4">
                    <h3 className="font-black text-blue-950 uppercase text-xs tracking-[0.2em] mb-6">Recent Orders</h3>
                    {/* Placeholder for real order data */}
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 group cursor-pointer hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100"></div>
                          <div>
                            <p className="font-black text-blue-950">Order #SW-4932{i}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivered on April 12</p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Delivered</div>
                      </div>
                    ))}
                  </section>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                   <h1 className="text-3xl font-black text-blue-950">Order History</h1>
                   <div className="p-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <Package size={40} />
                      </div>
                      <p className="font-bold text-gray-400">You haven't placed any orders yet.</p>
                      <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Start Shopping</button>
                   </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-10">
                  <header>
                    <h1 className="text-3xl font-black text-blue-950 mb-2">Security & Settings</h1>
                    <p className="text-gray-400 font-bold">Update your password and notification preferences</p>
                  </header>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group cursor-pointer">
                      <div className="flex items-center gap-6">
                         <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><ShieldCheck size={20} /></div>
                         <div>
                            <p className="font-black text-blue-950">Password & Security</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last changed 3 months ago</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group cursor-pointer">
                      <div className="flex items-center gap-6">
                         <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><Bell size={20} /></div>
                         <div>
                            <p className="font-black text-blue-950">Notification Preferences</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email and SMS alerts</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Profile;