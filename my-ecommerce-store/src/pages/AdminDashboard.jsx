import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, PackageSearch, ShoppingCart, 
  MessageSquare, CalendarDays, Activity, 
  Plus, Trash2, Edit, ChevronRight, TrendingUp, Users
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sidebar Configuration
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Manage Products', icon: <PackageSearch size={20} /> },
    { id: 'orders', label: 'Order Tracking', icon: <ShoppingCart size={20} /> },
    { id: 'reviews', label: 'Customer Reviews', icon: <MessageSquare size={20} /> },
    { id: 'events', label: 'Live Events', icon: <CalendarDays size={20} /> },
    { id: 'tracking', label: 'Traffic & Visits', icon: <Activity size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-blue-50/30 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-8">
        
        {/* LEFT SIDEBAR: Admin Navigation */}
        <aside className="w-full xl:w-80 space-y-6 shrink-0">
          {/* Sidebar Header: Enhanced padding and border radius */}
          <div className="m3-card border border-blue-100 text-center !bg-blue-900 text-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Activity size={32} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Command Center</h2>
            <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mt-2">Super Admin</p>
          </div>

          <nav className="m3-card border border-blue-100 space-y-2 !p-4 rounded-[2.5rem] bg-white shadow-sm">
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

        {/* RIGHT CONTENT: Dashboard Panes */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="m3-card border border-blue-100 min-h-[700px] p-8 md:p-12 rounded-[2.5rem] bg-white shadow-sm"
            >
              
              {/* --- TAB: OVERVIEW --- */}
              {activeTab === 'overview' && (
                <div className="space-y-10">
                  <div>
                    <h1 className="text-3xl font-black text-blue-950 mb-2">Platform Overview</h1>
                    <p className="text-gray-400 font-bold">Real-time metrics and system health.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                      <p className="font-black text-xs uppercase tracking-widest text-blue-900 mb-4 flex items-center"><TrendingUp size={16} className="mr-2"/> Revenue Today</p>
                      <p className="text-4xl font-black text-blue-950">$12,450</p>
                    </div>
                    <div className="p-8 bg-green-50/50 rounded-[2rem] border border-green-100">
                      <p className="font-black text-xs uppercase tracking-widest text-green-900 mb-4 flex items-center"><Users size={16} className="mr-2"/> Active Visitors</p>
                      <p className="text-4xl font-black text-green-950">842</p>
                    </div>
                    <div className="p-8 bg-orange-50/50 rounded-[2rem] border border-orange-100">
                      <p className="font-black text-xs uppercase tracking-widest text-orange-900 mb-4 flex items-center"><ShoppingCart size={16} className="mr-2"/> Pending Orders</p>
                      <p className="text-4xl font-black text-blue-950">45</p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: PRODUCTS --- */}
              {activeTab === 'products' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <h1 className="text-3xl font-black text-blue-950 mb-2">Inventory</h1>
                      <p className="text-gray-400 font-bold">Add, edit, or remove products.</p>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center">
                      <Plus size={18} className="mr-2" /> Add Product
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="py-4 px-4">Product</th>
                          <th className="py-4 px-4">Price</th>
                          <th className="py-4 px-4">Stock</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map(i => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4 flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                              <span className="font-bold text-blue-950">Aura Headphones Pro</span>
                            </td>
                            <td className="py-4 px-4 font-bold text-blue-600">$199.99</td>
                            <td className="py-4 px-4 font-bold text-gray-500">124</td>
                            <td className="py-4 px-4 text-right space-x-2">
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit size={18}/></button>
                              <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- TAB: TRACKING --- */}
              {activeTab === 'tracking' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-black text-blue-950 mb-2">Website Traffic</h1>
                    <p className="text-gray-400 font-bold">Live visitor tracking and page analytics.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Top Page Today</p>
                      <p className="text-xl font-bold text-blue-900">/category/electronics</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unique IPs (24h)</p>
                      <p className="text-xl font-bold text-blue-900">14,209</p>
                    </div>
                  </div>
                  <p className="text-center text-gray-400 font-bold py-10 border border-dashed border-gray-200 rounded-[2rem]">
                    [ Detailed Analytics Chart / Table will render here ]
                  </p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;