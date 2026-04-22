import React from 'react'; // <--- ADD THIS
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Carousel = ({ items }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000 }}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 4 },
      }}
      className="product-carousel"
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          {/* Your ProductCard component would go here */}
          <div className="p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
            <img src={item.image} alt={item.name} className="rounded-lg mb-4" />
            <h3 className="text-xl font-bold">{item.name}</h3>
            <p className="text-blue-600 font-bold">${item.price}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;