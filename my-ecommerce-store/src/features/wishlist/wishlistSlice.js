import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {
    toggleWishlist: (state, action) => {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
        toast('Removed from favorites', { icon: '💔' });
      } else {
        state.items.push(action.payload);
        toast.success('Added to favorites!', { icon: '❤️' });
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  }
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;