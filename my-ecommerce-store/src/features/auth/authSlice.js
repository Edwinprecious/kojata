import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isAdmin: JSON.parse(localStorage.getItem('user'))?.isAdmin || false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      // Safely extract the token whether it's nested under 'tokens' or at the root
      const accessToken = action.payload?.tokens?.access || action.payload?.access;
      // Extract the user, or provide a fallback if the endpoint doesn't return one (like standard JWT)
      const user = action.payload?.user || { username: 'User' }; 
      
      if (accessToken) {
        state.user = user;
        state.token = accessToken;
        state.isAdmin = user.isAdmin || false; // Safe assignment
        state.isAuthenticated = true;
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', accessToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAdmin = false;
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;