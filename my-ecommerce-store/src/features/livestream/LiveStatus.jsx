import { motion } from 'framer-motion';
import { Video } from 'lucide-react'; // Using the safe Video icon

const LiveStatus = ({ title }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center bg-red-50 border border-red-100 px-4 py-2 rounded-full shadow-sm"
  >
    {/* Pulse Indicator Container */}
    <span className="relative flex h-3 w-3 mr-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
    </span>

    <div className="flex items-center space-x-2">
      <Video size={14} className="text-red-600" />
      <span className="text-red-700 text-[11px] font-black uppercase tracking-[0.15em]">
        Live Now
      </span>
      {/* Decorative separator */}
      <span className="h-3 w-[1px] bg-red-200 mx-1"></span>
      <span className="text-red-900 text-sm font-medium truncate max-w-[200px]">
        {title || "Special Shopping Event"}
      </span>
    </div>
  </motion.div>
);

export default LiveStatus;