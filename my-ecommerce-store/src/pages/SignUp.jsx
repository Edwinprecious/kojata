import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { syncCartWithBackend } from '../features/cart/CartSlice'; 
import toast from 'react-hot-toast';

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // --- GOOGLE LOGIC ---
  const handleGoogleResponse = async (response) => {
    const loadingToast = toast.loading("Connecting to Google...");
    try {
      const res = await axios.post('/api/google-auth/', {
        token: response.credential 
      });
      
      dispatch(setCredentials(res.data.tokens));
      dispatch(syncCartWithBackend()); // Sync guest cart items
      
      toast.success("Welcome to ShopWave!", { id: loadingToast });
      navigate('/');
    } catch (err) {
      console.error("Google Auth Error:", err);
      toast.error("Google Sign-Up failed.", { id: loadingToast });
    }
  };

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: "240859297300-959705dqg6crttenpk3kd7ffj1t7kbi8.apps.googleusercontent.com", // Replace with your actual Client ID
        callback: handleGoogleResponse
      });

      google.accounts.id.renderButton(
        document.getElementById("googleSignUpBtn"),
        { 
          theme: "outline", 
          size: "large", 
          width: "280", // Reduced for better mobile fit
          shape: "pill",
          text: "signup_with" 
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    const loadingToast = toast.loading("Sending verification email...");

    try {
      const response = await axios.post('/api/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      toast.success(response.data.message || "Account created! Please check your email.", { 
        id: loadingToast,
        duration: 6000 
      });

      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = "Signup failed. Please try again.";
      
      if (errorData?.username) errorMessage = "Username already taken.";
      if (errorData?.email) errorMessage = "Email already registered.";
      
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/30 flex items-center justify-center px-6 py-12 font-sans">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-xl p-10 text-center border border-blue-100">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
          <UserPlus size={24} />
        </div>
        
        <h1 className="text-3xl font-black text-blue-950 mb-2">Create Account</h1>
        <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-[10px]">Join the ShopWave community</p>
        
        {/* GOOGLE BUTTON TARGET */}
        <div id="googleSignUpBtn" className="flex justify-center mb-6"></div>
        
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="px-4 text-[10px] text-gray-400 uppercase font-black tracking-widest">Or sign up with email</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input 
                name="username"
                type="text" 
                required
                placeholder="shopwave_fan" 
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input 
                name="email"
                type="email" 
                required
                placeholder="you@example.com" 
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-100 bg-gray-50/30 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input 
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-100 bg-gray-50/30 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <input 
              type="checkbox" 
              id="show-password"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4 text-blue-600 border-gray-200 rounded cursor-pointer" 
            />
            <label htmlFor="show-password" className="text-sm font-bold text-gray-500 cursor-pointer">
              Show password
            </label>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-sm font-bold text-gray-500">
          Already have an account? <Link to="/signin" className="text-blue-600 font-black hover:underline ml-1">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;