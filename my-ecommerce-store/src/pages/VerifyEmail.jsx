import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { setCredentials } from '../features/auth/authSlice';
import { syncCartWithBackend } from '../features/cart/CartSlice'; // Added for guest cart merge
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast'; // Added missing import

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verify = async () => {
      try {
        // 1. FIXED: Assigned to 'response' so we can access response.data
        const response = await axios.post(`http://localhost:8000/api/verify-email/${uid}/${token}/`);

        // 2. AUTO-LOGIN LOGIC
        // Uses the tokens returned by our updated 'High Conversion' backend view
        dispatch(setCredentials(response.data.tokens));

        // 3. MERGE GUEST CART
        // Immediately syncs local cart items to the new PostgreSQL account
        dispatch(syncCartWithBackend());

        setStatus('success');
        toast.success("Account Verified! Welcome to ShopWave.");
        
        // 4. HIGH CONVERSION REDIRECT
        // Straight to Home/Dashboard after a short delay
        setTimeout(() => navigate('/'), 2000);
      } catch (error) {
        console.error("Verification Error:", error);
        setStatus('error');
      }
    };
    verify();
  }, [uid, token, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-blue-50/30 flex items-center justify-center px-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl p-12 text-center border border-blue-100">
        
        {status === 'verifying' && (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <h1 className="text-2xl font-black text-blue-950">Verifying Account...</h1>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-black text-blue-950">Success!</h1>
            {/* Updated text to match the auto-login high conversion logic */}
            <p className="font-bold text-gray-500">Your email has been verified. Logging you in and redirecting to your dashboard...</p>
            <div className="pt-4">
              <Link to="/" className="block bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-3xl font-black text-blue-950">Link Expired</h1>
            <p className="font-bold text-gray-500">This verification link is invalid or has already been used.</p>
            <Link to="/signup" className="block border-2 border-blue-900 text-blue-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;