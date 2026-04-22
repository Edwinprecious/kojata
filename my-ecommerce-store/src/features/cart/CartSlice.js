import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    isOpen: false,
  },
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) item.quantity += 1;
    },
    decrementQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter(i => i.id !== action.payload);
      }
    }
  }
});

export const { 
  toggleCart, 
  addToCart, 
  removeFromCart, 
  incrementQuantity, 
  decrementQuantity 
} = cartSlice.actions;


export const syncCartWithBackend = () => async (dispatch, getState) => {
  const { items } = getState().cart;
  // FIX: Match the key used in authSlice.js ('token' instead of 'access_token')
  const token = localStorage.getItem('token');

  if (items.length > 0 && token) {
    try {
      await axios.post('http://localhost:8000/api/merge-cart/', 
        { items: items.map(i => ({ id: i.id, quantity: i.quantity })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optional: Refresh the cart from the database to ensure sync
    } catch (error) {
      console.error("Cart sync failed", error);
    }
  }
};

export default cartSlice.reducer;