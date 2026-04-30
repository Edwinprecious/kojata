import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Package, MapPin, CreditCard, 
  Settings, ChevronRight, Camera, LogOut,
  ShieldCheck, Bell, Heart, Lock, ArrowLeft,
  Plus, ShoppingCart, Navigation, Map as MapIcon, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api'; 
import { logout } from '../features/auth/authSlice'; 
import ProductCard from '../features/products/ProductCard'; 

// --- VANILLA LEAFLET IMPORTS ---
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons missing in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- CUSTOM FIXED-CENTER LEAFLET COMPONENT ---
const LeafletMap = ({ lat, lng, onMapMoveEnd }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const isProgrammaticMove = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.on('moveend', () => {
        if (isProgrammaticMove.current) {
          isProgrammaticMove.current = false;
          return;
        }
        const center = mapInstanceRef.current.getCenter();
        onMapMoveEnd(center.lat, center.lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      const currentPos = mapInstanceRef.current.getCenter();
      const latDiff = Math.abs(currentPos.lat - lat);
      const lngDiff = Math.abs(currentPos.lng - lng);

      if (latDiff > 0.0001 || lngDiff > 0.0001) {
        isProgrammaticMove.current = true;
        mapInstanceRef.current.setView([lat, lng], 16, { animate: false });
      }
    }
  }, [lat, lng]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 1 }} />
      <div 
        style={{ 
          position: 'absolute', top: '50%', left: '50%', 
          transform: 'translate(-50%, -100%)', zIndex: 400, pointerEvents: 'none',
          filter: 'drop-shadow(0px 8px 6px rgba(0,0,0,0.4))'
        }}
      >
        <svg width="46" height="46" viewBox="0 0 24 24" fill="#2563eb" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      </div>
    </div>
  );
};
// ----------------------------------------

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({ username: 'Loading...', email: 'Loading...' });
  const [isLoading, setIsLoading] = useState(true);
  
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]); 
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', zip: '', lat: 6.5244, lng: 3.3792
  });

  // --- NEW: Ref to hold the debounce timer ---
  const geocodeTimeoutRef = useRef(null);

  const { token, isAuthenticated, isAdmin } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items); 
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <User size={20} /> },
    ...(!isAdmin ? [
      { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
      { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
      { id: 'addresses', label: 'Addresses', icon: <MapPin size={20} /> },
      { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    ] : []),
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
        
        if (fetchedUser.profile_image) setProfileImage(fetchedUser.profile_image);
        if (fetchedUser.addresses) setSavedAddresses(fetchedUser.addresses);
        
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
    
    // Cleanup the timeout if the component unmounts
    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
  }, [token, isAuthenticated, navigate, dispatch]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading("Uploading image...");
    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      const response = await api.patch('/profile/', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setProfileImage(response.data.profile_image);
      toast.success("Profile picture updated!", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to upload image.", { id: loadingToast });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("New passwords do not match!");
    if (passwords.new.length < 8) return toast.error("New password must be at least 8 characters.");

    const loadingToast = toast.loading("Updating password...");
    try {
      await api.post('/change-password/', { old_password: passwords.current, new_password: passwords.new }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Password updated successfully!", { id: loadingToast });
      setIsEditingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update password.", { id: loadingToast });
    }
  };

  const handlePasswordInputChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleGetLiveLocation = async () => {
    setIsFetchingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setNewAddress(prev => ({ ...prev, lat: latitude, lng: longitude }));
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.address) {
              const addr = data.address;
              setNewAddress(prev => ({
                ...prev,
                street: addr.road ? `${addr.house_number || ''} ${addr.road}`.trim() : (data.display_name.split(',')[0] || ''),
                city: addr.city || addr.town || addr.village || addr.county || '',
                state: addr.state || '', zip: addr.postcode || ''
              }));
              toast.success("Location found! Verify street details.");
            } else {
              toast.success("Location mapped. Please enter street manually.");
            }
          } catch (error) {
            toast.error("Network error fetching street. Enter manually.");
          } finally { setIsFetchingLocation(false); }
        },
        () => {
          setIsFetchingLocation(false);
          toast.error("Please allow location permissions.");
        }
      );
    } else {
      setIsFetchingLocation(false);
      toast.error("Geolocation not supported.");
    }
  };

  // --- UPDATED: Debounced Map Move Handler ---
  const handleMapMoveEnd = (lat, lng) => {
    // 1. Instantly update the coordinates so the map visual stays in sync
    setNewAddress(prev => ({ ...prev, lat, lng }));
    
    // 2. Clear any existing timer because the user is still moving the map
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    // 3. Start a new 1-second timer. If it finishes without being cleared, fetch the address.
    geocodeTimeoutRef.current = setTimeout(async () => {
      const loadingToast = toast.loading("Finding street address...", { duration: 1500 });
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        
        if (data && data.address) {
          const addr = data.address;
          setNewAddress(prev => ({
            ...prev,
            street: addr.road ? `${addr.house_number || ''} ${addr.road}`.trim() : (data.display_name.split(',')[0] || ''),
            city: addr.city || addr.town || addr.village || addr.county || '',
            state: addr.state || '', zip: addr.postcode || ''
          }));
          toast.success("Address updated!", { id: loadingToast });
        } else {
          toast.success("Pin moved. Please enter street manually.", { id: loadingToast });
        }
      } catch (error) {
        toast.error("Network error. Enter details manually.", { id: loadingToast });
      }
    }, 1000); // Wait 1000ms (1 second)
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state) {
      return toast.error("Please fill street, city, and state.");
    }

    const loadingToast = toast.loading("Saving address...");
    try {
      const response = await api.patch('/profile/', {
        action: 'add_address',
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        postal_code: newAddress.zip
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSavedAddresses(response.data.addresses);
      setIsAddressModalOpen(false);
      toast.success("Address saved!", { id: loadingToast });
      setNewAddress({ street: '', city: '', state: '', zip: '', lat: 6.5244, lng: 3.3792 });
    } catch (error) {
      toast.error("Failed to save address.", { id: loadingToast });
    }
  };

  const handleRemoveAddress = async (id) => {
    const loadingToast = toast.loading("Removing address...");
    try {
      const response = await api.patch('/profile/', {
        action: 'remove_address',
        address_id: id
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setSavedAddresses(response.data.addresses);
      toast.success("Address removed", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to remove address.", { id: loadingToast });
    }
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
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} className="mr-2" /> Back
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-8 text-center relative">
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-600/20 overflow-hidden border-4 border-white">
                  {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-2.5 bg-white text-blue-600 rounded-full shadow-lg border border-gray-100 hover:bg-blue-50 transition-colors z-10">
                  <Camera size={16} />
                </button>
              </div>

              <h2 className="text-xl font-black text-blue-950 capitalize">{user.username}</h2>
              <p className="text-sm font-bold text-gray-400 truncate mb-4">{user.email}</p>
              
              <div className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                {isAdmin ? 'Administrator' : 'Active Member'}
              </div>
            </div>

            <nav className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-gray-50 hover:text-blue-600'}`}
                >
                  <div className="flex items-center gap-4">{item.icon} {item.label}</div>
                  <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-8 md:p-12 min-h-[600px]"
              >
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <header>
                      <h1 className="text-3xl font-black text-blue-950 mb-2">Account Overview</h1>
                      <p className="text-gray-400 font-bold">Manage your profile and recent activity</p>
                    </header>

                    {!isAdmin && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><Package size={20} /></div>
                            <span className="font-black text-xs uppercase tracking-widest text-blue-900">Total Orders</span>
                          </div>
                          <p className="text-4xl font-black text-blue-950">0</p>
                        </div>
                        
                        <Link to="/cart" className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 hover:bg-blue-100 transition-colors block cursor-pointer group">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform"><ShoppingCart size={20} /></div>
                            <span className="font-black text-xs uppercase tracking-widest text-blue-900">Cart Items</span>
                          </div>
                          <p className="text-4xl font-black text-blue-950">{cartItems.length}</p>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {!isAdmin && activeTab === 'addresses' && (
                  <div className="space-y-6">
                     <div className="flex justify-between items-center mb-6">
                       <h1 className="text-3xl font-black text-blue-950">Saved Addresses</h1>
                       <button onClick={() => setIsAddressModalOpen(true)} className="flex items-center text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                         <Plus size={16} className="mr-1" /> Add New
                       </button>
                     </div>

                     {savedAddresses.length === 0 ? (
                       <div className="p-16 md:p-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-blue-300 shadow-sm"><MapPin size={32} /></div>
                          <h3 className="text-xl font-black text-blue-950">No addresses saved</h3>
                          <p className="font-bold text-gray-400 max-w-sm mx-auto">Save your shipping addresses here for a faster checkout experience.</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {savedAddresses.map((addr) => (
                           <div key={addr.id} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm relative group hover:border-blue-200 transition-colors">
                             <button onClick={() => handleRemoveAddress(addr.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Remove address"><X size={16} /></button>
                             <div className="flex items-center mb-2">
                               <MapPin size={16} className="text-blue-600 mr-2" />
                               <span className="font-black text-blue-950 text-sm">Saved Address</span>
                             </div>
                             <p className="text-gray-500 font-semibold text-sm leading-relaxed">{addr.street}</p>
                             <p className="text-gray-500 font-semibold text-sm leading-relaxed">{addr.city}, {addr.state} {addr.zip}</p>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>
                )}

                {!isAdmin && activeTab === 'orders' && (
                  <div className="space-y-6">
                     <h1 className="text-3xl font-black text-blue-950">Order History</h1>
                     <div className="p-16 md:p-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-gray-100 mt-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-gray-300 shadow-sm"><Package size={32} /></div>
                        <h3 className="text-xl font-black text-blue-950">No orders yet</h3>
                     </div>
                  </div>
                )}

                {!isAdmin && activeTab === 'wishlist' && (
                  <div className="space-y-6">
                     <h1 className="text-3xl font-black text-blue-950">My Wishlist</h1>
                     {wishlistItems.length === 0 ? (
                       <div className="p-16 md:p-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-gray-100 mt-6">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-pink-300 shadow-sm"><Heart size={32} /></div>
                          <h3 className="text-xl font-black text-blue-950">Your wishlist is empty</h3>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                         {wishlistItems.map((item) => <ProductCard key={item.id} product={item} />)}
                       </div>
                     )}
                  </div>
                )}

                {!isAdmin && activeTab === 'payments' && (
                  <div className="space-y-6">
                     <h1 className="text-3xl font-black text-blue-950">Payment Methods</h1>
                     <div className="p-16 md:p-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-green-300 shadow-sm"><CreditCard size={32} /></div>
                        <h3 className="text-xl font-black text-blue-950">No payment methods</h3>
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
                      <div className="bg-gray-50 rounded-3xl overflow-hidden border border-transparent transition-all">
                        <div onClick={() => setIsEditingPassword(!isEditingPassword)} className="flex items-center justify-between p-6 cursor-pointer hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-center gap-6">
                             <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><ShieldCheck size={20} /></div>
                             <div>
                                <p className="font-black text-blue-950">Password & Security</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isEditingPassword ? "Close form" : "Update your password"}</p>
                             </div>
                          </div>
                          <ChevronRight size={18} className={`transition-transform duration-300 text-gray-300 ${isEditingPassword ? "rotate-90 text-blue-600" : ""}`} />
                        </div>
                        
                        <AnimatePresence>
                          {isEditingPassword && (
                            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handlePasswordChange} className="px-6 pb-8 space-y-4">
                              <div className="border-t border-gray-200 pt-6">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                  <input type="password" name="current" required value={passwords.current} onChange={handlePasswordInputChange} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold" />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                                  <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                    <input type="password" name="new" required value={passwords.new} onChange={handlePasswordInputChange} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm New</label>
                                  <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                    <input type="password" name="confirm" required value={passwords.confirm} onChange={handlePasswordInputChange} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold" />
                                  </div>
                                </div>
                              </div>
                              <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Save New Password</button>
                            </motion.form>
                          )}
                        </AnimatePresence>
                      </div>

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

      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddressModalOpen(false)} className="absolute inset-0 bg-blue-950/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsAddressModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400"/></button>
              
              <div className="mb-8">
                <h2 className="text-2xl font-black text-blue-950 mb-2">Add New Address</h2>
                <p className="text-sm font-bold text-gray-400">Pan the map to set your location.</p>
              </div>

              <div className="mb-6 rounded-3xl overflow-hidden border border-gray-200 relative bg-gray-100 h-[250px] z-0">
                <LeafletMap lat={newAddress.lat} lng={newAddress.lng} onMapMoveEnd={handleMapMoveEnd} />
                <div className="absolute top-4 right-4 z-[400]">
                  <button type="button" onClick={handleGetLiveLocation} disabled={isFetchingLocation} className="bg-white text-blue-600 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center hover:bg-blue-50 transition-colors disabled:opacity-50">
                    {isFetchingLocation ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div> : <Navigation size={14} className="mr-2" />}
                    Use Live GPS
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Street Address</label>
                  <div className="relative">
                    <MapIcon className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <input type="text" required value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} placeholder="123 Main St, Apt 4B" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold text-blue-950" />
                  </div>
                  <p className="text-[9px] font-bold text-orange-500 mt-2 ml-1">* GPS/Pin accuracy may vary. Please review and edit your street name if needed.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">City</label>
                    <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} placeholder="City" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold text-blue-950" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">State</label>
                    <input type="text" required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} placeholder="State" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold text-blue-950" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Zip Code</label>
                    <input type="text" value={newAddress.zip} onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} placeholder="ZIP (Optional)" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white outline-none focus:border-blue-500 transition-all font-semibold text-blue-950" />
                  </div>
                </div>

                <button type="submit" className="mt-8 bg-blue-600 text-white rounded-2xl w-full !py-4 font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                  Save Address
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;