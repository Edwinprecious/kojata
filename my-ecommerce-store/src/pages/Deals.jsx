import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../features/products/ProductCard';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch actual deals from the backend
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await api.get('/deals/');
        // Handle paginated or non-paginated responses
        setDeals(response.data.results || response.data);
      } catch (error) {
        console.error("Failed to fetch deals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 font-sans">
      
      {/* Simple Page Header */}
      <div className="mb-12 flex items-center gap-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm">
          <Zap size={28} className="fill-current" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-blue-950 tracking-tight">Active Flash Deals</h1>
          <p className="text-gray-500 font-bold mt-1">Huge discounts, limited time only.</p>
        </div>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      ) : deals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <Zap size={56} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-black text-blue-950">No Active Deals</h2>
          <p className="text-gray-400 font-bold mt-2">Check back later for massive flash sales!</p>
        </div>
      )}
    </div>
  );
};

export default Deals;