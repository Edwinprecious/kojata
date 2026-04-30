import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, User } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- GOOGLE LOGIC START ---
  const handleGoogleResponse = async (response) => {
    const loadingToast = toast.loading("Connecting to Google...");
    try {
      const res = await axios.post('http://localhost:8000/api/google-auth/', {
        token: response.credential 
      });
      
      dispatch(setCredentials(res.data));
      // Removed syncCartWithBackend() here to prevent overwriting the DB cart
      
      toast.success("Welcome to ShopWave!", { id: loadingToast });
      navigate('/');
    } catch (err) {
      toast.error("Google Sign-In failed. Please try again.", { id: loadingToast });
    }
  };

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: "240859297300-959705dqg6crttenpk3kd7ffj1t7kbi8.apps.googleusercontent.com", 
        callback: handleGoogleResponse
      });

      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { 
          theme: "outline", 
          size: "large", 
          width: "280", 
          shape: "pill",
          text: "signin_with" 
        }
      );
    }
  }, []);
  // --- GOOGLE LOGIC END ---

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Please fill in all fields');
    const loadingToast = toast.loading('Authenticating...');

    try {
      const response = await axios.post('http://localhost:8000/api/token/', { username, password });
      if (response.data && response.data.access) {
        dispatch(setCredentials({ 
          ...response.data, 
          user: { username: username } 
        })); 
        // Removed syncCartWithBackend() here as well
        
        toast.success("Welcome back!", { id: loadingToast });
        navigate('/'); 
      }
    } catch (error) {
      const message = error.response?.status === 401 ? "Invalid credentials." : "Server error.";
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/30 flex items-center justify-center px-6 py-12 font-sans">
      <div className="m3-card w-full max-w-md bg-white shadow-2xl p-10 text-center border border-gray-100">
        <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
          <LogIn size={28} />
        </div>
        
        <h1 className="text-3xl font-black text-blue-950 mb-2">Sign In</h1>
        <p className="text-gray-400 font-bold text-sm mb-8 uppercase tracking-widest">Access your ShopWave Account</p>
        
        <div id="googleBtn" className="flex justify-center mb-6"></div>
        
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="px-4 text-[10px] text-gray-300 uppercase font-black tracking-[0.2em]">Or use account</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>
        
        <form onSubmit={handleSignIn} className="space-y-5 text-left">
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-300" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="shopwave_user" 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/30 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-300" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/30 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" 
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-4 mt-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Sign In to ShopWave
          </button>
        </form>
        
        <p className="mt-10 text-sm font-bold text-gray-500">
          Don't have an account? <Link to="/signup" className="text-blue-600 font-black hover:underline ml-1">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;