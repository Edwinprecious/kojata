import InfoLayout from '../../components/ui/InfoLayout';
import React from 'react';
const SizeGuide = () => (
  <InfoLayout subtitle="Sizing" title="Find your Fit.">
    <p className="mb-8">Measurements are in inches. For the best fit, we recommend measuring a similar garment you already own.</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {['S', 'M', 'L', 'XL'].map(size => (
        <div key={size} className="m3-card text-center border border-gray-100">
          <p className="text-xs font-black text-gray-400 mb-2 uppercase">Size</p>
          <p className="text-3xl font-black text-blue-950">{size}</p>
          <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] font-bold text-blue-600">
            Details →
          </div>
        </div>
      ))}
    </div>
  </InfoLayout>
);
export default SizeGuide;