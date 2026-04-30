import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Lock, Video, CreditCard, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { clearCart } from '../features/cart/CartSlice';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    phone: '+234 801 234 5678',
    country: '',
    state: '',
    city: 'Lagos',
    address: '',
    postalCode: '101110',
    paymentMethod: 'card'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const nextStep = () => setStep(s => s + 1);
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
        total_price: total
      });
      dispatch(clearCart());
      navigate('/'); 
    } catch (error) {}
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <nav className="bg-white py-3 px-6 border-b border-gray-100 mb-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center text-blue-900 font-black text-lg">
             <span className="bg-blue-600 text-white p-1 rounded mr-2"><Video size={14}/></span> ShopWave
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
            <Lock size={12} className="mr-1" /> Secure Encrypted
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-center mb-8 max-w-xl mx-auto relative">
          {[1, 2, 3, 4].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step > num ? 'bg-green-500 text-white' : step === num ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <Check size={12} /> : num}
                </div>
                <span className="text-[9px] mt-2 font-bold text-gray-400 uppercase tracking-tighter">
                  {num === 1 ? 'Address' : num === 2 ? 'Shipping' : num === 3 ? 'Payment' : 'Confirm'}
                </span>
              </div>
              {num < 4 && (
                <div className={`h-[2px] w-full mx-[-10px] mb-5 ${step > num ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-extrabold text-blue-950 mb-5">Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold">
                    <div className="space-y-1">
                      <label className="text-gray-400">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400">Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400">Country</label>
                      <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400">State/Province</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 outline-none focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-gray-400">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 outline-none" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-gray-400">Street Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Start typing your street address..." className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 outline-none" />
                    </div>
                  </div>
                  <button onClick={nextStep} className="m3-button-filled w-full mt-8 py-3.5 text-sm">Continue to Shipping <ChevronRight size={16} className="ml-1"/></button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-extrabold text-blue-950 mb-5">Shipping Method</h2>
                  <div className="border-2 border-blue-500 bg-blue-50/30 rounded-2xl p-5 flex justify-between items-center mb-8">
                    <div>
                      <h4 className="font-bold text-sm text-blue-900">Standard Shipping</h4>
                      <p className="text-[10px] text-gray-500">Delivery in 5-7 business days</p>
                    </div>
                    <span className="text-lg font-black text-green-500 uppercase">Free</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={prevStep} className="flex-1 px-6 py-3 rounded-full border border-gray-100 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">Back</button>
                    <button onClick={nextStep} className="m3-button-filled flex-[2] text-sm">Continue to Payment <ChevronRight size={16}/></button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-extrabold text-blue-950 mb-1">Choose Payment Method</h2>
                  <p className="text-[10px] text-gray-400 mb-6 font-bold uppercase tracking-wider">Secure templates for integration</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {[
                      { id: 'card', name: 'Credit Card', icon: <CreditCard size={18}/>, tag: 'Popular', sub: 'Stripe/Visa' },
                      { id: 'paypal', name: 'PayPal', icon: <Globe size={18}/>, tag: '', sub: 'Fast Checkout' },
                      { id: 'paystack', name: 'Paystack', icon: <Smartphone size={18}/>, tag: 'Africa', sub: 'Local Cards' }
                    ].map((m) => (
                      <div 
                        key={m.id} 
                        onClick={() => setFormData({...formData, paymentMethod: m.id})}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${formData.paymentMethod === m.id ? 'border-blue-600 bg-blue-50/30 shadow-md shadow-blue-100' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                      >
                        {m.tag && <span className="absolute top-2 right-2 text-[7px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded">{m.tag}</span>}
                        <div className={`${formData.paymentMethod === m.id ? 'text-blue-600' : 'text-gray-400'} mb-3`}>{m.icon}</div>
                        <h4 className="font-bold text-xs text-blue-900">{m.name}</h4>
                        <p className="text-[9px] text-gray-400 mt-1">{m.sub}</p>
                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-green-500">
                           <span>Processing</span>
                           <span>Instant</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl mb-8 flex items-start">
                    <ShieldCheck size={14} className="text-blue-600 mr-2 mt-0.5" />
                    <p className="text-[9px] text-gray-500 leading-relaxed font-semibold">
                      Your payment information is protected by industry-standard security protocols. You'll be redirected to a secure checkout portal.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={prevStep} className="flex-1 px-6 py-3 rounded-full border border-gray-100 text-xs font-bold text-gray-500">Back</button>
                    <button onClick={nextStep} className="m3-button-filled flex-[2] text-sm">Continue to Confirmation</button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-extrabold text-blue-950 mb-6">Order Confirmation</h2>
                  <div className="space-y-6 text-xs font-bold border-l-2 border-blue-100 pl-4">
                    <div>
                      <h4 className="text-[9px] uppercase text-gray-400 mb-1 tracking-widest">Shipping Address</h4>
                      <p className="text-blue-900">{formData.fullName} • {formData.city}, Nigeria</p>
                    </div>
                    <div>
                      <h4 className="text-[9px] uppercase text-gray-400 mb-1 tracking-widest">Selected Method</h4>
                      <p className="text-blue-900">Standard Shipping - Free Delivery</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-10">
                    <button onClick={prevStep} className="flex-1 px-6 py-3 rounded-full border border-gray-100 text-xs font-bold text-gray-500">Back</button>
                    <button onClick={handlePlaceOrder} className="m3-button-filled flex-[2] !bg-green-600 text-sm shadow-lg shadow-green-100">
                       <Check size={16} className="mr-1"/> Place Order — ${total.toFixed(2)}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 sticky top-6">
            <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-blue-950 uppercase tracking-widest mb-6 border-b border-blue-50 pb-3">Order Summary</h3>
              <div className="space-y-4 mb-6 pb-6 border-b border-blue-50">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500">{item.name} <span className="text-blue-200 mx-1">x</span> {item.quantity}</span>
                    <span className="text-blue-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-blue-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Shipping Cost</span>
                  <span className="text-green-500 uppercase text-[9px]">Free</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-blue-50 mt-2">
                  <span className="text-base font-extrabold text-blue-950">Total Amount</span>
                  <span className="text-base font-black text-blue-600">${total.toFixed(2)}</span>
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