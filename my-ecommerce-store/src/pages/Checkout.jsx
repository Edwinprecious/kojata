import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChevronRight, Lock, Video, CreditCard, Smartphone, Globe, 
  ShieldCheck, ShoppingCart, MapPin, Plus, Navigation, Map as MapIcon, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { clearCart } from '../features/cart/CartSlice';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', zip: '', lat: 6.5244, lng: 3.3792
  });

  const geocodeTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    paymentMethod: 'stripe_ach' // Default changed since card is removed
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const fetchedUser = response.data;
        
        setFormData(prev => ({
          ...prev,
          fullName: fetchedUser.username || prev.fullName,
          phone: fetchedUser.phone || prev.phone
        }));

        if (fetchedUser.addresses && fetchedUser.addresses.length > 0) {
          setSavedAddresses(fetchedUser.addresses);
          handleSelectAddress(fetchedUser.addresses[0]); 
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (error) {
        console.error("Failed to load profile addresses", error);
        setIsAddingNewAddress(true);
      }
    };

    fetchProfile();

    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
  }, [isAuthenticated, token, navigate]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    setFormData(prev => ({
      ...prev,
      address: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      country: addr.country || '',
      postalCode: addr.zip || ''
    }));
  };

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

  const handleMapMoveEnd = (lat, lng) => {
    setNewAddress(prev => ({ ...prev, lat, lng }));
    
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }
    
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
    }, 1000); 
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state) {
      return toast.error("Please fill street, city, and state.");
    }

    const loadingToast = toast.loading("Saving address to profile...");
    try {
      const response = await api.patch('/profile/', {
        action: 'add_address',
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        postal_code: newAddress.zip
      }, { headers: { Authorization: `Bearer ${token}` } });

      const updatedAddresses = response.data.addresses;
      setSavedAddresses(updatedAddresses);
      
      if (updatedAddresses.length > 0) {
        handleSelectAddress(updatedAddresses[0]);
      }
      
      toast.success("Address saved!", { id: loadingToast });
      setNewAddress({ street: '', city: '', state: '', zip: '', lat: 6.5244, lng: 3.3792 });
    } catch (error) {
      toast.error("Failed to save address.", { id: loadingToast });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) return toast.error("Please provide your full name.");
      if (!formData.phone.trim()) return toast.error("Please provide your phone number.");
      if (!selectedAddressId || isAddingNewAddress) {
        return toast.error("Please select or save a delivery address.");
      }
    }
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    try {
      const shippingAddress = `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}, ${formData.postalCode}. Phone: ${formData.phone}`;
      
      await api.post('/checkout/', {
        shipping_address: shippingAddress,
        payment_method: formData.paymentMethod,
        total_price: total,
        phone: formData.phone 
      });
      
      dispatch(clearCart());
      navigate('/'); 
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Checkout failed. Please try again.");
    }
  };

  if (!isAuthenticated) return null;

  const inputStyle = "w-full px-4 py-3.5 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-blue-950 font-semibold";
  const labelStyle = "block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1";
  const primaryBtn = "bg-blue-600 text-white py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center";
  const secondaryBtn = "bg-gray-100 text-gray-500 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center";
  const successBtn = "bg-green-600 text-white py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center";

  return (
    <div className="min-h-screen bg-blue-50/30 font-sans pb-20">
      <nav className="bg-white py-4 px-6 border-b border-blue-100 shadow-sm mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center text-blue-950 font-black text-xl tracking-tight">
            <span className="bg-blue-600 text-white p-1.5 rounded-lg mr-2"><Video size={16}/></span> ShopWave
          </div>
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center bg-blue-50 px-3 py-1.5 rounded-full">
            <Lock size={12} className="mr-1.5" /> Secure Checkout
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center mb-10 max-w-2xl mx-auto relative">
          {[1, 2, 3, 4].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step > num ? 'bg-green-500 text-white shadow-md' : step === num ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110' : 'bg-white border-2 border-blue-100 text-gray-400'
                }`}>
                  {step > num ? <Check size={14} strokeWidth={3} /> : num}
                </div>
                <span className={`text-[10px] mt-3 font-black uppercase tracking-widest transition-colors ${step >= num ? 'text-blue-900' : 'text-gray-400'}`}>
                  {num === 1 ? 'Address' : num === 2 ? 'Shipping' : num === 3 ? 'Payment' : 'Confirm'}
                </span>
              </div>
              {num < 4 && (
                <div className={`h-1 w-full mx-[-8px] mb-6 rounded-full transition-colors duration-300 ${step > num ? 'bg-green-500' : 'bg-blue-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/5 border border-blue-50">
                  <h2 className="text-2xl font-black text-blue-950 mb-6">Shipping Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm mb-8">
                    <div className="space-y-1">
                      <label className={labelStyle}>Full Name <span className="text-red-500">*</span></label>
                      <input type="text" required name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputStyle} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelStyle}>Phone Number <span className="text-red-500">*</span></label>
                      <input type="text" required name="phone" value={formData.phone} onChange={handleInputChange} className={inputStyle} />
                    </div>
                  </div>

                  <div className="h-px w-full bg-blue-50 mb-8"></div>
                  
                  {isAddingNewAddress || savedAddresses.length === 0 ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-black text-blue-950">Add New Address</h3>
                        {savedAddresses.length > 0 && (
                          <button onClick={() => setIsAddingNewAddress(false)} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                            &larr; Back to Saved
                          </button>
                        )}
                      </div>

                      <div className="h-[250px] rounded-3xl overflow-hidden border border-gray-200 relative bg-gray-100 z-0">
                        <LeafletMap lat={newAddress.lat} lng={newAddress.lng} onMapMoveEnd={handleMapMoveEnd} />
                        <div className="absolute top-4 right-4 z-[400]">
                          <button type="button" onClick={handleGetLiveLocation} disabled={isFetchingLocation} className="bg-white text-blue-600 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center hover:bg-blue-50 transition-colors disabled:opacity-50">
                            {isFetchingLocation ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div> : <Navigation size={14} className="mr-2" />}
                            Use Live GPS
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleSaveNewAddress} className="space-y-5 text-sm">
                        <div className="space-y-1">
                          <label className={labelStyle}>Street Address</label>
                          <div className="relative">
                            <MapIcon className="absolute left-4 top-3.5 text-gray-300" size={18} />
                            <input type="text" required value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} placeholder="123 Main St, Apt 4B" className={`${inputStyle} pl-12`} />
                          </div>
                          <p className="text-[9px] font-bold text-orange-500 mt-2 ml-1">* GPS/Pin accuracy may vary. Please review and edit your street name if needed.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1">
                            <label className={labelStyle}>City</label>
                            <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className={inputStyle} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelStyle}>State / Province</label>
                            <input type="text" required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className={inputStyle} />
                          </div>
                        </div>
                        <div className="space-y-1 w-full md:w-1/2 md:pr-2">
                          <label className={labelStyle}>Zip Code</label>
                          <input type="text" value={newAddress.zip} onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} className={inputStyle} />
                        </div>
                        
                        <button type="submit" className={`w-full !mt-8 ${primaryBtn}`}>
                          <Check size={16} className="mr-2"/> Save Address
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-blue-950 mb-4">Select Delivery Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {savedAddresses.map(addr => (
                          <div 
                            key={addr.id} 
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative ${selectedAddressId === addr.id ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/10' : 'border-blue-50 bg-white hover:border-blue-100'}`}
                          >
                            {selectedAddressId === addr.id && <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1"><Check size={14} strokeWidth={3}/></div>}
                            <div className="flex items-center mb-2">
                              <MapPin size={16} className={`${selectedAddressId === addr.id ? 'text-blue-600' : 'text-gray-400'} mr-2`} />
                              <span className="font-black text-blue-950 text-sm">Saved Address</span>
                            </div>
                            <p className="text-xs text-gray-500 font-semibold leading-relaxed">{addr.street}</p>
                            <p className="text-xs text-gray-500 font-semibold leading-relaxed">{addr.city}, {addr.state} {addr.zip}</p>
                          </div>
                        ))}
                        <div 
                          onClick={() => setIsAddingNewAddress(true)}
                          className="p-6 rounded-3xl border-2 border-dashed border-gray-200 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 min-h-[120px]"
                        >
                          <Plus size={24} className="mb-2" />
                          <span className="font-black text-sm">Add New Address</span>
                        </div>
                      </div>
                      
                      <button onClick={nextStep} className={`w-full mt-8 ${primaryBtn}`}>
                        Continue to Shipping <ChevronRight size={16} className="ml-1"/>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/5 border border-blue-50">
                  <h2 className="text-2xl font-black text-blue-950 mb-6">Shipping Method</h2>
                  
                  <div className="border-2 border-blue-600 bg-blue-50/50 rounded-2xl p-6 flex justify-between items-center mb-8 cursor-pointer transition-all hover:bg-blue-50">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white mr-4"></div>
                      <div>
                        <h4 className="font-black text-base text-blue-950">Standard Shipping</h4>
                        <p className="text-xs text-gray-500 font-bold mt-1">Delivery in 5-7 business days</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-green-600 uppercase tracking-widest">Free</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={prevStep} className={`flex-1 ${secondaryBtn}`}>Back</button>
                    <button onClick={nextStep} className={`flex-[2] ${primaryBtn}`}>
                      Continue to Payment <ChevronRight size={16} className="ml-1"/>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/5 border border-blue-50">
                  <h2 className="text-2xl font-black text-blue-950 mb-2">Choose Payment Method</h2>
                  <p className="text-[10px] text-gray-400 mb-8 font-black uppercase tracking-widest">Secure templates for integration</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {[
                      { id: 'stripe_ach', name: 'Stripe Bank Transfer', icon: <Globe size={20}/>, tag: 'Global', sub: 'Direct Bank Payment (No Cards)' },
                      { id: 'paystack', name: 'Paystack', icon: <Smartphone size={20}/>, tag: 'Africa', sub: 'Details Coming Soon' }
                    ].map((m) => (
                      <div 
                        key={m.id} 
                        onClick={() => setFormData({...formData, paymentMethod: m.id})}
                        className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 relative ${formData.paymentMethod === m.id ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/10 scale-[1.02]' : 'border-blue-50 bg-white hover:border-blue-100 hover:bg-gray-50'}`}
                      >
                        {m.tag && <span className="absolute top-3 right-3 text-[8px] font-black uppercase bg-blue-600 text-white px-2 py-1 rounded-md tracking-wider">{m.tag}</span>}
                        <div className={`${formData.paymentMethod === m.id ? 'text-blue-600' : 'text-gray-400'} mb-4`}>{m.icon}</div>
                        <h4 className="font-black text-sm text-blue-950">{m.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">{m.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl mb-8 flex items-start">
                    <ShieldCheck size={16} className="text-green-600 mr-3 mt-0.5 shrink-0" />
                    <p className="text-xs text-green-900 leading-relaxed font-bold">
                      Your payment information is protected by AES-256 industry-standard encryption. You'll be redirected to a secure checkout portal.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={prevStep} className={`flex-1 ${secondaryBtn}`}>Back</button>
                    <button onClick={nextStep} className={`flex-[2] ${primaryBtn}`}>
                      Review Order <ChevronRight size={16} className="ml-1"/>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/5 border border-blue-50">
                  <h2 className="text-2xl font-black text-blue-950 mb-8">Order Confirmation</h2>
                  
                  <div className="bg-blue-50/30 rounded-3xl p-6 border border-blue-100 space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="bg-white p-3 rounded-xl shadow-sm text-blue-600"><Check size={20} /></div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Shipping Details</h4>
                        <p className="text-sm font-bold text-blue-950 leading-relaxed">{formData.fullName} <br/> {formData.address}, {formData.city}, {formData.state} <br/> {formData.country}</p>
                      </div>
                    </div>
                    <div className="h-px bg-blue-100 w-full"></div>
                    <div className="flex gap-4 items-start">
                      <div className="bg-white p-3 rounded-xl shadow-sm text-blue-600"><CreditCard size={20} /></div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Payment & Delivery</h4>
                        <p className="text-sm font-bold text-blue-950">Standard Shipping - Free <br/> Paid via {formData.paymentMethod.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button onClick={prevStep} className={`flex-1 ${secondaryBtn}`}>Back</button>
                    <button onClick={handlePlaceOrder} className={`flex-[2] ${successBtn}`}>
                      <Check size={16} className="mr-2"/> Authorize Payment &bull; ${total.toFixed(2)}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] p-8 border border-blue-100 shadow-xl shadow-blue-900/5 sticky top-28">
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-6 flex items-center">
                <ShoppingCart size={16} className="mr-2" /> Order Summary
              </h3>
              
              <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-950 line-clamp-1 max-w-[150px]">{item.name}</p>
                        <p className="text-[10px] font-black text-gray-400 mt-0.5">QTY: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-blue-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm font-bold bg-blue-50/30 p-6 rounded-3xl border border-blue-50">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-blue-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Shipping Cost</span>
                  <span className="text-[10px] font-black tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase">Free</span>
                </div>
                
                <div className="flex justify-between pt-4 border-t border-blue-100 mt-2 items-end">
                  <span className="text-base font-black text-blue-950">Total Amount</span>
                  <span className="text-3xl font-black text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;