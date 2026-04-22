import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/CartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import authReducer from '../features/auth/authSlice'; // 1. Import your new auth reducer

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
  },
});