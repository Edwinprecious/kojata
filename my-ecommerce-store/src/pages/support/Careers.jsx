import InfoLayout from '../../components/ui/InfoLayout';
import React from 'react';

const Careers = () => (
  <InfoLayout subtitle="Team" title="Join the Wave.">
    <div className="space-y-4">
      {['Frontend Engineer', 'Live Stream Producer', 'Creative Director'].map(job => (
        <div key={job} className="m3-card flex justify-between items-center group cursor-pointer hover:bg-blue-50">
          <span className="font-black text-blue-950">{job}</span>
          <span className="text-xs font-bold text-blue-600 uppercase">Apply Now →</span>
        </div>
      ))}
    </div>
  </InfoLayout>
);
export default Careers;