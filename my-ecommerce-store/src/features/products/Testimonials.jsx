import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Rachel T.",
      initials: "RT",
      text: "Fastest shipping I've ever experienced. Package arrived in 24 hours and the product quality is outstanding!",
      rating: 5
    },
    {
      id: 2,
      name: "Marcus J.",
      initials: "MJ",
      text: "The live deals are incredible. Saved 35% on my headphones. Will definitely be back for more!",
      rating: 5
    },
    {
      id: 3,
      name: "Sophia L.",
      initials: "SL",
      text: "Customer service went above and beyond. They resolved my issue within minutes. 10/10 experience.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-white font-caslon">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Section Headers from Screenshot */}
        <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">
          What Our Customers Say
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">
          Loved by 2.4 million shoppers
        </h2>
        
        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white p-10 rounded-[2rem] border border-blue-100 text-left hover:shadow-2xl hover:border-blue-200 transition-all duration-300"
            >
              {/* Star Rating */}
              <div className="flex text-yellow-400 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                "{review.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {review.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <div className="flex items-center text-blue-500 text-xs font-bold mt-1">
                    <CheckCircle size={14} className="mr-1" /> Verified Purchase
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;