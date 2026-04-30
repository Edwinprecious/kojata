import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const response = await api.get('/wishlist/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
});

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (payload, { rejectWithValue }) => {
    try {
      const productId = typeof payload === 'object' && payload !== null ? payload.id : payload;
      const response = await api.post('/wishlist/', { product_id: productId });
      toast.success('Added to favorites!', { icon: '❤️' });
      return response.data;
    } catch (error) {
      toast.error('Failed to add to wishlist');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (wishlistItemId) => {
  await api.delete(`/wishlist/${wishlistItemId}/`);
  toast('Removed from favorites', { icon: '💔' });
  return wishlistItemId;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Automatically wipe wishlist items from memory when logout action fires globally
      .addCase('auth/logout', (state) => {
        state.items = [];
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const exists = state.items.find(item => item.id === action.payload.id);
        if (!exists) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;