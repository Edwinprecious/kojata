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
      const qtyToAdd = action.payload.quantity || 1;
      const maxStock = action.payload.stock || 0; 

      if (existingItem) {
        // Prevent adding more than what is in stock
        if (existingItem.quantity + qtyToAdd <= maxStock) {
          existingItem.quantity += qtyToAdd;
        } else {
          existingItem.quantity = maxStock; // Max it out at available stock
        }
      } else {
        // Ensure new item doesn't bypass stock limit
        const initialQty = Math.min(qtyToAdd, maxStock);
        if (maxStock > 0) {
          state.items.push({ ...action.payload, quantity: initialQty });
        }
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      // Strictly check against stock when hitting '+' in the Cart Drawer
      if (item && item.quantity < item.stock) {
        item.quantity += 1;
      }
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
  const token = localStorage.getItem('token');

  if (items.length > 0 && token) {
    try {
      await axios.post('http://localhost:8000/api/merge-cart/', 
        { items: items.map(i => ({ id: i.id, quantity: i.quantity })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Cart sync failed", error);
    }
  }
};

export default cartSlice.reducer;