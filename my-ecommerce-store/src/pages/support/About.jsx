import InfoLayout from '../../components/ui/InfoLayout';
import React from 'react';

const About = () => (
  <InfoLayout subtitle="Our Story" title="Redefining the Wave.">
    <p className="text-xl text-blue-900 font-bold">ShopWave was born from a simple idea: Shopping should be an experience, not a chore.</p>
    <div className="m3-card !bg-blue-50/50">
      <h3 className="text-blue-900 font-black mb-4">The Live Vision</h3>
      <p>We combine real-time interaction with premium logistics to bring the storefront directly to your screen.</p>
    </div>
  </InfoLayout>
);
export default About;