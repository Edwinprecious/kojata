import InfoLayout from '../../components/ui/InfoLayout';
import { Download, Newspaper } from 'lucide-react';
import React from 'react';

const Press = () => (
  <InfoLayout subtitle="Media" title="News & Brand Assets.">
    <div className="space-y-8">
      <div className="m3-card bg-blue-900 text-white flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black mb-1">Official Brand Kit</h3>
          <p className="text-xs text-blue-200 font-bold uppercase tracking-widest">Logos, Colors & Typefaces</p>
        </div>
        <button className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
          <Download size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="m3-card border border-gray-100 group cursor-pointer">
            <Newspaper className="text-blue-600 mb-4" />
            <h4 className="text-blue-900 font-black mb-2">ShopWave raises $50M to redefine Live Commerce</h4>
            <p className="text-xs text-gray-400 font-bold">April {i + 10}, 2026</p>
          </div>
        ))}
      </div>
    </div>
  </InfoLayout>
);
export default Press;