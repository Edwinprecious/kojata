import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, CheckCircle, MapPin, Calendar, CreditCard, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- FIX: Guard against undefined IDs ---
    if (!id || id === 'undefined') {
      navigate('/profile');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data);
      } catch (error) {
        toast.error("Failed to load order details.");
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id, token, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50/30 pt-32 pb-20 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-900 font-bold uppercase tracking-widest text-xs">Tracking Order...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const getStepStatus = (stepName) => {
    const statusMap = { 'Placed': 1, 'Processing': 2, 'Delivered': 3 };
    
    let currentLevel = 1;
    if (order.status.toLowerCase() === 'processing') currentLevel = 2;
    if (order.status.toLowerCase() === 'delivered') currentLevel = 3;

    const stepLevel = statusMap[stepName];

    if (stepLevel < currentLevel) return 'completed';
    if (stepLevel === currentLevel) return 'active';
    return 'pending';
  };

  const steps = [
    { name: 'Placed', icon: <Package size={20} /> },
    { name: 'Processing', icon: <Clock size={20} /> },
    { name: 'Delivered', icon: <CheckCircle size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-blue-50/30 pt-24 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} className="mr-2" /> Back to Orders
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black text-blue-950 mb-2">Order {order.formatted_id}</h1>
              <p className="text-sm font-bold text-gray-400 flex items-center">
                <Calendar size={16} className="mr-2" /> Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full inline-flex items-center gap-2 ${
              order.status.toLowerCase() === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
            }`}>
              <span className="text-xs font-black uppercase tracking-widest">{order.status}</span>
            </div>
          </div>

          <div className="relative mb-12 pt-6">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500" 
                 style={{ width: order.status.toLowerCase() === 'delivered' ? '100%' : '50%' }}></div>
            
            <div className="relative z-10 flex justify-between">
              {steps.map((step, idx) => {
                const status = getStepStatus(step.name);
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      status === 'completed' ? 'bg-blue-600 text-white' : 
                      status === 'active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110' : 
                      'bg-white border-4 border-gray-100 text-gray-300'
                    }`}>
                      {status === 'completed' ? <CheckCircle size={20} /> : step.icon}
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-4 ${status === 'pending' ? 'text-gray-400' : 'text-blue-950'}`}>
                      {step.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-10">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center">
                <MapPin size={16} className="mr-2" /> Delivery Address
              </h3>
              <p className="text-sm font-semibold text-gray-500 leading-relaxed bg-gray-50 p-6 rounded-3xl border border-gray-100">
                {order.shipping_address.split('. Phone:').map((line, i) => (
                  <span key={i} className="block">{line.trim()}{i === 0 ? '' : <><br/><span className="text-xs font-bold text-gray-400 mt-2 block">Phone: {line.trim()}</span></>}</span>
                ))}
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center">
                <CreditCard size={16} className="mr-2" /> Payment Summary
              </h3>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3 text-sm font-bold">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${order.total_price}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 uppercase text-[10px] tracking-widest">Free</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 mt-1 items-end">
                  <span className="text-blue-950 font-black">Total Paid</span>
                  <span className="text-xl font-black text-blue-600">${order.total_price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-blue-100 p-8 md:p-12">
          <h2 className="text-xl font-black text-blue-950 mb-8">Items in this order</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <motion.div key={item.id} whileHover={{ y: -2 }} className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shrink-0 border border-gray-100 p-1">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Package size={24} className="text-gray-300 m-auto mt-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-950 line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                    <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">QTY: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-base font-black text-blue-900 pr-4">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTracking;