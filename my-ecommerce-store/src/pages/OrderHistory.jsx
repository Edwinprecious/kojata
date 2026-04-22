import React from 'react';
import { Package, ChevronRight, CheckCircle2, Truck, Clock } from 'lucide-react';

const OrderHistory = () => {
  // Mock Data for testing
  const orders = [
    { id: 'SW-9921', date: 'April 12, 2026', total: 299.99, status: 'Delivered', items: 2 },
    { id: 'SW-8812', date: 'March 28, 2026', total: 145.00, status: 'Processing', items: 1 }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 font-sans min-h-screen">
      <div className="mb-12">
        <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-2">Account</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-950">Order History</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="m3-card bg-white flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Package size={28} />
              </div>
              <div>
                <h3 className="font-black text-blue-950">Order {order.id}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{order.date} • {order.items} Items</p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto md:gap-12">
              <div className="text-left md:text-right">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total Amount</p>
                <p className="text-xl font-black text-blue-900">${order.total}</p>
              </div>

              <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {order.status === 'Delivered' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
              </div>
              
              <button className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;