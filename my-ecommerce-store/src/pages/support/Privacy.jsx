import InfoLayout from '../../components/ui/InfoLayout';
import React from 'react';

const Privacy = () => (
  <InfoLayout subtitle="Legal" title="Privacy Policy.">
    <section className="space-y-8">
      <div>
        <h3 className="text-blue-900 font-black text-xl mb-4">Data Collection</h3>
        <p>We collect information to provide better services to our users—from figuring out basic stuff like which language you speak, to more complex things like which ads you’ll find most useful.</p>
      </div>
      <div className="m3-card !bg-blue-50/30">
        <h3 className="text-blue-900 font-black mb-2 italic">Your Protection</h3>
        <p className="text-sm font-semibold">We use AES-256 encryption for all user data and never sell your personal information to third parties.</p>
      </div>
    </section>
  </InfoLayout>
);
export default Privacy;