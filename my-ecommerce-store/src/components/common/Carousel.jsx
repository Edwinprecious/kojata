import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import your universal ProductCard
import ProductCard from '../../features/products/ProductCard';

const Carousel = ({ items }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000, disableOnInteraction: true }}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 4 },
      }}
      className="product-carousel !pb-14" // Added padding-bottom so pagination dots don't overlap cards
    >
      {items.map((item) => (
        <SwiperSlide key={item.id} className="h-auto pb-4">
          <ProductCard product={item} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;