import InfoLayout from '../../components/ui/InfoLayout';
import React from 'react';

const Terms = () => (
  <InfoLayout subtitle="Legal" title="Terms of Service.">
    <section className="space-y-6">
      <h3 className="text-blue-900 font-black text-xl">1. Acceptance of Terms</h3>
      <p>By accessing ShopWave, you agree to be bound by these terms. If you do not agree, please do not use our services.</p>
      
      <h3 className="text-blue-900 font-black text-xl">2. User Conduct</h3>
      <p>Users must not engage in any activity that disrupts the live shopping experience or violates international trade laws.</p>
      
      <div className="m3-card !bg-gray-50">
        <p className="text-xs font-bold leading-relaxed">Last Updated: April 15, 2026</p>
      </div>
    </section>
  </InfoLayout>
);
export default Terms;