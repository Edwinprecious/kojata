import InfoLayout from '../../components/ui/InfoLayout';
import { Search, ChevronRight } from 'lucide-react';
import React from 'react';

const HelpCenter = () => (
  <InfoLayout subtitle="Support" title="How can we help?">
    <div className="relative mb-12">
      <Search className="absolute left-6 top-5 text-gray-400" size={20} />
      <input type="text" placeholder="Search for topics..." className="w-full pl-16 pr-6 py-5 rounded-[24px] bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {['Orders & Tracking', 'Account Settings', 'Payment Methods', 'Live Show FAQ'].map(topic => (
        <div key={topic} className="m3-card flex justify-between items-center group cursor-pointer hover:bg-gray-50 border border-gray-50">
          <span className="font-black text-blue-900">{topic}</span>
          <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-all" />
        </div>
      ))}
    </div>
  </InfoLayout>
);
export default HelpCenter;