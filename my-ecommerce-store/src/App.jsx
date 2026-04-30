import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Global Components
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import CartDrawer from './features/cart/CartDrawer';
import { fetchAndMergeCart, syncCartWithBackend } from './features/cart/CartSlice';
import { fetchWishlist, clearWishlist } from './features/wishlist/wishlistSlice';

// Main Store Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CategoryPage from './pages/CategoryPage';
import LiveShowPage from './pages/LiveShowPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import OrderHistory from './pages/OrderHistory';
import Deals from './pages/Deals';
import AdminDashboard from './pages/AdminDashboard'; 

// Support & Legal Pages
import About from './pages/support/About';
import Careers from './pages/support/Careers';
import Press from './pages/support/Press';
import Terms from './pages/support/Terms';
import Privacy from './pages/support/Privacy';
import HelpCenter from './pages/support/HelpCenter';
import Shipping from './pages/support/Shipping';
import Returns from './pages/support/Returns';
import Contact from './pages/support/Contact';
import SizeGuide from './pages/support/SizeGuide';

// --- NEW: Scroll To Top Component ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
// ------------------------------------

const MainLayout = ({ children }) => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-blue-100">
      <Navbar />
      <CartDrawer />
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            {children}
          </div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const isInitialMount = useRef(true);

  // 1. Fetch Cart & Wishlist on Login, Clear on Logout
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAndMergeCart());
      dispatch(fetchWishlist()); 
    } else {
      dispatch(clearWishlist()); 
    }
  }, [isAuthenticated, dispatch]);

  // 2. Sync changes to Database automatically 
  useEffect(() => {
    if (isInitialMount.current) {
       isInitialMount.current = false;
       return;
    }
    if (isAuthenticated) {
      const timeoutId = setTimeout(() => {
         dispatch(syncCartWithBackend());
      }, 500); 
      return () => clearTimeout(timeoutId);
    }
  }, [items, isAuthenticated, dispatch]);

  return (
    <Router>
      <ScrollToTop /> {/* <--- ADDED HERE: Forces window to top on every route change */}
      
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: 'Nunito Sans, sans-serif',
            fontWeight: '800',
            borderRadius: '16px',
            fontSize: '14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#2563eb',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />

        <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MainLayout><OrderHistory /></MainLayout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><MainLayout><Checkout /></MainLayout></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><MainLayout><Wishlist /></MainLayout></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />

        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/live" element={<MainLayout><LiveShowPage /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
        <Route path="/category/:slug" element={<MainLayout><CategoryPage /></MainLayout>} />
        <Route path="/deals" element={<MainLayout><Deals /></MainLayout>} />

        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/careers" element={<MainLayout><Careers /></MainLayout>} />
        <Route path="/press" element={<MainLayout><Press /></MainLayout>} />
        <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
        <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
        <Route path="/help" element={<MainLayout><HelpCenter /></MainLayout>} />
        <Route path="/shipping-info" element={<MainLayout><Shipping /></MainLayout>} />
        <Route path="/returns" element={<MainLayout><Returns /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/size-guide" element={<MainLayout><SizeGuide /></MainLayout>} />

        <Route path="*" element={
          <MainLayout>
            <div className="h-[70vh] flex flex-col items-center justify-center text-blue-950 px-6">
              <h1 className="text-6xl font-black mb-4">404</h1>
              <p className="text-xl font-bold text-gray-500 mb-8">This collection is currently unavailable.</p>
              <Link to="/" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
                Return to Shop
              </Link>
            </div>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;