import InfoLayout from '../../components/ui/InfoLayout';
import React from 'react';

const Shipping = () => (
  <InfoLayout subtitle="Logistics" title="Shipping Information.">
    <div className="space-y-8">
      <p>We provide global express shipping. All orders are processed within 24 hours of the live show conclusion.</p>
      
      <div className="overflow-hidden rounded-[28px] border border-gray-100">
        <table className="w-full text-left text-sm font-bold">
          <thead className="bg-gray-50 text-blue-900 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4">Timeframe</th>
              <th className="px-6 py-4">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr><td className="px-6 py-4 text-blue-950">Domestic</td><td className="px-6 py-4">2-3 Days</td><td className="px-6 py-4 text-green-600">Free</td></tr>
            <tr><td className="px-6 py-4 text-blue-950">International</td><td className="px-6 py-4">5-7 Days</td><td className="px-6 py-4">$15.00</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </InfoLayout>
);
export default Shipping;