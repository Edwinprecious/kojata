import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Rachel T.",
    initials: "RT",
    text: "Fastest shipping I've ever experienced. Package arrived in 24 hours and the product quality is outstanding!",
    rating: 5,
  },
  {
    id: 2,
    name: "Marcus J.",
    initials: "MJ",
    text: "The live deals are incredible. Saved 35% on my headphones. Will definitely be back for more!",
    rating: 5,
  },
  {
    id: 3,
    name: "Sophia L.",
    initials: "SL",
    text: "Customer service went above and beyond. They resolved my issue within minutes. 10/10 experience.",
    rating: 5,
  },
  {
    id: 4,
    name: "Daniel K.",
    initials: "DK",
    text: "I was skeptical at first, but the product exceeded every expectation. The packaging was pristine and delivery was right on time.",
    rating: 5,
  },
];

/** Returns how many cards are visible at the current breakpoint */
function useSlidesPerView() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const calc = () => {
      if (window.innerWidth >= 1024) setCount(3);
      else if (window.innerWidth >= 640) setCount(2);
      else setCount(1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return count;
}

const Testimonials = () => {
  const slidesPerView = useSlidesPerView();
  const maxIndex = reviews.length - slidesPerView; // 0-based max starting index
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback(
    (idx) => setCurrent(Math.max(0, Math.min(idx, maxIndex))),
    [maxIndex],
  );

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  const next = useCallback(() => {
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);

  // Autoplay
  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  // Reset index if viewport widens and maxIndex shrinks
  useEffect(() => {
    setCurrent((c) => Math.min(c, maxIndex));
  }, [maxIndex]);

  const cardWidthPct = 100 / slidesPerView;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">
          What Our Customers Say
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">
          Loved by 2.4 million shoppers
        </h2>

        {/* Slider viewport */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * cardWidthPct}%)` }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 px-3 md:px-4"
                  style={{ width: `${cardWidthPct}%` }}
                >
                  <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-blue-100 text-left hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
                    {/* Stars */}
                    <div className="flex text-yellow-400 mb-6">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>

                    {/* Review text */}
                    <p className="text-gray-600 text-base md:text-lg mb-8 md:mb-10 leading-relaxed flex-grow">
                      "{review.text}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center space-x-4 mt-auto">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0">
                        {review.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">
                          {review.name}
                        </h4>
                        <div className="flex items-center text-blue-500 text-[10px] md:text-xs font-bold mt-1">
                          <CheckCircle size={12} className="mr-1" />
                          Verified Purchase
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next arrows — only show when there's more than one visible slide group */}
          {maxIndex > 0 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-white border border-blue-100 shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-white border border-blue-100 shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Dot pagination */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === current ? '#2563eb' : '#d1d5db',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;