import React from 'react';
import { ShoppingCart, Star, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product = { name: "Test Product", price: 79.99, image: "" } }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white rounded-3xl p-6 border border-gray-100 relative group transition-all"
    >
      <div className="absolute top-4 left-4 z-10 bg-orange-200/50 backdrop-blur-md text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center">
        <Tag size={12} className="mr-1"/> Test Promotion
      </div>
      <div className="absolute top-4 right-4 z-10 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">-20%</div>

      <div className="aspect-square rounded-2xl bg-gray-50 mb-6 overflow-hidden">
        <img src={product.image || "https://via.placeholder.com/400"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Uncategorized</p>
        <h3 className="text-lg font-bold text-blue-900">{product.name}</h3>
        <div className="flex items-center text-yellow-400 space-x-1">
          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
          <span className="text-gray-300 text-xs">(0)</span>
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <p className="text-green-600">100 in stock</p>
            <p className="text-gray-400">100%</p>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full"></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-2xl font-black text-red-500">${product.price}</p>
            <p className="text-xs text-gray-400 line-through">${(product.price * 1.25).toFixed(2)}</p>
          </div>
          <button className="bg-blue-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors">
            <ShoppingCart size={20}/>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;