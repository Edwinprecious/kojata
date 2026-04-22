import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const styles = {
    primary: "bg-[#003366] text-white hover:bg-[#0052a3]",
    outline: "border-2 border-[#003366] text-[#003366] hover:bg-[#E6F0FF]",
    cta: "bg-[#007BFF] text-white shadow-lg hover:shadow-blue-200/50"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`px-8 py-3 rounded-md font-medium transition-all duration-300 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;