import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';
import { logout } from '../auth/authSlice';

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
    setCartItems: (state, action) => {
      state.items = action.payload;
    },
    mergeCartItems: (state, action) => {
      const dbItems = action.payload || [];
      dbItems.forEach(dbItem => {
        const existing = state.items.find(item => item.id === dbItem.id);
        if (existing) {
          const maxStock = existing.stock ?? dbItem.stock ?? 99;
          existing.quantity = Math.min(existing.quantity + (dbItem.quantity || 1), maxStock);
        } else {
          state.items.push(dbItem);
        }
      });
    },
    _addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const qtyToAdd = action.payload.quantity || 1;
      const maxStock = action.payload.stock ?? 99; 
      if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + qtyToAdd, maxStock);
      } else {
        const initialQty = Math.min(qtyToAdd, maxStock);
        if (maxStock > 0 || action.payload.stock === undefined) {
          state.items.push({ ...action.payload, quantity: initialQty });
        }
      }
    },
    _removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    _incrementQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item && item.quantity < (item.stock ?? 99)) {
        item.quantity += 1;
      }
    },
    _decrementQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter(i => i.id !== action.payload);
      }
    },
    clearCart: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.items = [];
    });
  }
});

export const { 
  toggleCart, 
  setCartItems,
  mergeCartItems,
  clearCart,
  _addToCart,
  _removeFromCart,
  _incrementQuantity,
  _decrementQuantity
} = cartSlice.actions;

export const syncCartWithBackend = () => async (dispatch, getState) => {
  const { items } = getState().cart;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await api.post('/merge-cart/', 
        { 
          items: items.map(i => ({ id: i.id, quantity: i.quantity })), 
          action: 'sync' 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to sync cart", error);
    }
  }
};

export const fetchAndMergeCart = () => async (dispatch) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    const response = await api.post('/merge-cart/', 
      { items: [], action: 'fetch' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const dbItems = response.data?.items || [];
    
    // Fix: We use setCartItems instead of mergeCartItems so we don't accidentally
    // add database quantities to existing local quantities.
    dispatch(setCartItems(dbItems));
    
    // Fix: Removed the redundant dispatch(syncCartWithBackend()) here.
    // The database just gave us this data, we don't need to save it right back to them!
    
  } catch (error) {
    console.error("Failed to fetch cart", error);
  }
};

export const addToCart = (payload) => (dispatch) => {
  dispatch(_addToCart(payload));
  dispatch(syncCartWithBackend());
};

export const removeFromCart = (payload) => (dispatch) => {
  dispatch(_removeFromCart(payload));
  dispatch(syncCartWithBackend());
};

export const incrementQuantity = (payload) => (dispatch) => {
  dispatch(_incrementQuantity(payload));
  dispatch(syncCartWithBackend());
};

export const decrementQuantity = (payload) => (dispatch) => {
  dispatch(_decrementQuantity(payload));
  dispatch(syncCartWithBackend());
};

export default cartSlice.reducer;