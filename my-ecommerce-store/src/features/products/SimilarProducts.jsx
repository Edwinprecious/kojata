import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from './ProductCard';

const SimilarProducts = ({ products }) => (
  <section className="py-12">
    <h2 className="text-2xl font-bold text-[#003366] mb-8">Related Products</h2>
    <Swiper spaceBetween={20} slidesPerView={1.5} breakpoints={{ 768: { slidesPerView: 4 } }}>
      {products.map(p => (
        <SwiperSlide key={p.id}>
          <ProductCard product={p} />
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

export default SimilarProducts;