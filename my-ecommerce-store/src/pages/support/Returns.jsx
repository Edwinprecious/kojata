import InfoLayout from '../../components/ui/InfoLayout';
import { RefreshCcw } from 'lucide-react';
import React from 'react';

const Returns = () => (
  <InfoLayout subtitle="Logistics" title="Returns & Exchanges.">
    <div className="m3-card !bg-blue-900 text-white flex items-center gap-6 mb-12">
      <RefreshCcw size={40} className="text-blue-400" />
      <div>
        <h3 className="text-xl font-black">30-Day Happiness Guarantee</h3>
        <p className="text-sm opacity-80 font-bold">If it's not perfect, the return is on us.</p>
      </div>
    </div>
    <p>To start a return, simply visit your Order History page and select the items you wish to return. We will provide a prepaid shipping label immediately.</p>
  </InfoLayout>
);
export default Returns;