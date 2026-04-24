import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User, Package, MapPin, CreditCard, 
  Settings, ChevronRight, Camera, LogOut,
  ShieldCheck, Bell, Heart, Lock, ArrowLeft,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api'; 
import { logout } from '../features/auth/authSlice'; 

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({ username: 'Loading...', email: 'Loading...' });
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile Image State
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Password Change State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <User size={20} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error("Please sign in to view your profile.");
      navigate('/signin');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const fetchedUser = response.data;
        setUser({ username: fetchedUser.username, email: fetchedUser.email });
        
        // Load saved profile picture from local storage for this specific user
        const savedImage = localStorage.getItem(`profilePic_${fetchedUser.username}`);
        if (savedImage) setProfileImage(savedImage);
        
        setIsLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          dispatch(logout());
          navigate('/signin');
        } else {
          toast.error("Failed to load profile data.");
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [token, isAuthenticated, navigate, dispatch]);

  // --- Handlers ---
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        // Save to local storage so it persists across refreshes
        localStorage.setItem(`profilePic_${user.username}`, base64String);
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("New passwords do not match!");
    if (passwords.new.length < 8) return toast.error("New password must be at least 8 characters.");

    const loadingToast = toast.loading("Updating password...");

    try {
      await api.post('/change-password/', {
        old_password: passwords.current,
        new_password: passwords.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Password updated successfully!", { id: loadingToast });
      setIsEditingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to update password.";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50/30 pt-32 pb-20 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-900 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/30 pt-24 pb-20 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} className="mr-2" /> Back
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-8 text-center relative">
              
              {/* Profile Image Area */}
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-600/20 overflow-hidden border-4 border-white">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.username ? user.username.charAt(0).toUpperCase() : '?'
                  )}
                </div>
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-white text-blue-600 rounded-full shadow-lg border border-gray-100 hover:bg-blue-50 transition-colors z-10"
                  title="Update Profile Picture"
                >
                  <Camera size={16} />
                </button>
              </div>

              <h2 className="text-xl font-black text-blue-950 capitalize">{user.username}</h2>
              <p className="text-sm font-bold text-gray-400 truncate mb-4">{user.email}</p>
              
              <div className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                Active Member
              </div>
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

          {/* Right Content */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-8 md:p-12 min-h-[600px]"
              >
                
                {/* --- OVERVIEW TAB --- */}
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
                        <p className="text-4xl font-black text-blue-950">0</p>
                      </div>
                      <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-white rounded-xl text-red-500 shadow-sm"><Heart size={20} /></div>
                          <span className="font-black text-xs uppercase tracking-widest text-blue-900">Saved Items</span>
                        </div>
                        <p className="text-4xl font-black text-blue-950">0</p>
                      </div>
                    </div>

                    <section className="space-y-4 pt-4">
                      <h3 className="font-black text-blue-950 uppercase text-xs tracking-[0.2em] mb-6">Recent Activity</h3>
                      <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                        <p className="text-sm font-bold text-gray-400">No recent activity to display.</p>
                      </div>
                    </section>
                  </div>
                )}

                {/* --- ORDERS TAB --- */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                     <h1 className="text-3xl font-black text-blue-950">Order History</h1>
                     <div className="p-16 md:p-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-gray-100 mt-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-gray-300 shadow-sm">
                          <Package size={32} />
                        </div>
                        <h3 className="text-xl font-black text-blue-950">No orders yet</h3>
                        <p className="font-bold text-gray-400 max-w-sm mx-auto">When you make a purchase, your order status and history will appear here.</p>
                        <button 
                          onClick={() => navigate('/category/all')}
                          className="mt-4 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                        >
                          Start Shopping
                        </button>
                     </div>
                  </div>
                )}

                {/* --- WISHLIST TAB --- */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                     <h1 className="text-3xl font-black text-blue-950">My Wishlist</h1>
                     <div className="p-16 md:p-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-gray-100 mt-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-pink-300 shadow-sm">
                          <Heart size={32} />
                        </div>
                        <h3 className="text-xl font-black text-blue-950">Your wishlist is empty</h3>
                        <p className="font-bold text-gray-400 max-w-sm mx-auto">Save items you love so you can easily find them later.</p>
                        <button 
                          onClick={() => navigate('/category/all')}
                          className="mt-4 bg-white border border-gray-200 text-blue-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                          Explore Products
                        </button>
                     </div>
                  </div>
                )}

                {/* --- ADDRESSES TAB --- */}
                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                     <div className="flex justify-between items-center mb-6">
                       <h1 className="text-3xl font-black text-blue-950">Saved Addresses</h1>
                       <button className="flex items-center text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                         <Plus size={16} className="mr-1" /> Add New
                       </button>
                     </div>
                     <div className="p-16 md:p-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-blue-300 shadow-sm">
                          <MapPin size={32} />
                        </div>
                        <h3 className="text-xl font-black text-blue-950">No addresses saved</h3>
                        <p className="font-bold text-gray-400 max-w-sm mx-auto">Save your shipping addresses here for a faster checkout experience.</p>
                     </div>
                  </div>
                )}

                {/* --- PAYMENTS TAB --- */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                     <div className="flex justify-between items-center mb-6">
                       <h1 className="text-3xl font-black text-blue-950">Payment Methods</h1>
                       <button className="flex items-center text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                         <Plus size={16} className="mr-1" /> Add New
                       </button>
                     </div>
                     <div className="p-16 md:p-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-green-300 shadow-sm">
                          <CreditCard size={32} />
                        </div>
                        <h3 className="text-xl font-black text-blue-950">No payment methods</h3>
                        <p className="font-bold text-gray-400 max-w-sm mx-auto">Securely save your credit cards or link accounts for 1-click purchases.</p>
                     </div>
                  </div>
                )}

                {/* --- SETTINGS TAB --- */}
                {activeTab === 'settings' && (
                  <div className="space-y-10">
                    <header>
                      <h1 className="text-3xl font-black text-blue-950 mb-2">Security & Settings</h1>
                      <p className="text-gray-400 font-bold">Update your password and notification preferences</p>
                    </header>

                    <div className="space-y-4">
                      
                      {/* EXPANDABLE PASSWORD SECTION */}
                      <div className="bg-gray-50 rounded-3xl overflow-hidden border border-transparent transition-all">
                        <div 
                          onClick={() => setIsEditingPassword(!isEditingPassword)}
                          className="flex items-center justify-between p-6 cursor-pointer hover:bg-blue-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-6">
                             <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><ShieldCheck size={20} /></div>
                             <div>
                                <p className="font-black text-blue-950">Password & Security</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                  {isEditingPassword ? "Close form" : "Update your password"}
                                </p>
                             </div>
                          </div>
                          <ChevronRight size={18} className={`transition-transform duration-300 text-gray-300 ${isEditingPassword ? "rotate-90 text-blue-600" : ""}`} />
                        </div>
                        
                        <AnimatePresence>
                          {isEditingPassword && (
                            <motion.form 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              onSubmit={handlePasswordChange}
                              className="px-6 pb-8 space-y-4"
                            >
                              <div className="border-t border-gray-200 pt-6">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                  <input 
                                    type="password" name="current" required
                                    value={passwords.current} onChange={handlePasswordInputChange}
                                    placeholder="••••••••" 
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold" 
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                                  <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                    <input 
                                      type="password" name="new" required
                                      value={passwords.new} onChange={handlePasswordInputChange}
                                      placeholder="••••••••" 
                                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold" 
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm New</label>
                                  <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                    <input 
                                      type="password" name="confirm" required
                                      value={passwords.confirm} onChange={handlePasswordInputChange}
                                      placeholder="••••••••" 
                                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold" 
                                    />
                                  </div>
                                </div>
                              </div>
                              <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                                Save New Password
                              </button>
                            </motion.form>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* NOTIFICATIONS TILE */}
                      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group cursor-pointer hover:bg-blue-50/50 hover:border-blue-100 border border-transparent transition-all">
                        <div className="flex items-center gap-6">
                           <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><Bell size={20} /></div>
                           <div>
                              <p className="font-black text-blue-950">Notification Preferences</p>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email and SMS alerts</p>
                           </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                      
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;