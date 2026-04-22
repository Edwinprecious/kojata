const ReviewSystem = ({ reviews }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-t border-blue-50">
    <div>
      <h3 className="text-2xl font-bold mb-4">Customer Reviews</h3>
      <div className="flex items-center mb-2">
        <div className="flex mr-2 text-yellow-400">★★★★☆</div>
        <p className="text-sm font-bold">4.2 out of 5</p>
      </div>
      <p className="text-xs text-gray-500">1,240 global ratings</p>
      {/* Percentage Bars (Amazon Style) */}
      {[5,4,3,2,1].map(star => (
        <div key={star} className="flex items-center text-xs mt-2">
          <span className="w-12">{star} star</span>
          <div className="flex-1 h-2 bg-gray-100 mx-2 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400" style={{ width: `${star * 15}%` }}></div>
          </div>
          <span className="w-8">{star * 15}%</span>
        </div>
      ))}
    </div>
    <div className="md:col-span-2 space-y-8">
      {/* Individual Review Item */}
      <div className="border-b border-gray-50 pb-6">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 mr-3"></div>
          <span className="font-bold text-sm">Alex Johnson</span>
        </div>
        <div className="text-yellow-400 text-xs mb-1">★★★★★ <span className="text-black font-bold ml-2">Perfect Quality</span></div>
        <p className="text-sm text-gray-600">The 3D effects on the site are amazing, and the product arrived exactly as described. Love the blue theme!</p>
      </div>
    </div>
  </div>
);

export default ReviewSystem;