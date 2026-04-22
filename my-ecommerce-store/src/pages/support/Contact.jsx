import InfoLayout from '../../components/ui/InfoLayout';
import { Mail, Phone, MapPin } from 'lucide-react';
import React from 'react';
const Contact = () => (
  <InfoLayout subtitle="Support" title="Get in Touch.">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="m3-card text-center">
        <Mail className="mx-auto mb-4 text-blue-600" />
        <p className="text-sm font-black text-blue-900">support@shopwave.com</p>
      </div>
      <div className="m3-card text-center">
        <Phone className="mx-auto mb-4 text-blue-600" />
        <p className="text-sm font-black text-blue-900">+1 (555) WAVE-001</p>
      </div>
      <div className="m3-card text-center">
        <MapPin className="mx-auto mb-4 text-blue-600" />
        <p className="text-sm font-black text-blue-900">Lagos, Nigeria</p>
      </div>
    </div>
    <form className="space-y-4">
      <input type="text" placeholder="Your Name" className="w-full p-4 rounded-2xl bg-gray-50 outline-none" />
      <textarea placeholder="How can we help?" rows="5" className="w-full p-4 rounded-2xl bg-gray-50 outline-none"></textarea>
      <button className="m3-button-filled w-full">Send Message</button>
    </form>
  </InfoLayout>
);
export default Contact;