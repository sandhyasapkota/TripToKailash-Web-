// Frontend/src/App.jsx - FIXED VERSION
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useState, useEffect } from 'react'
import { LoadingSpinner } from './components/LoadingSpinner';
import AdminRoute from "./components/AdminRoute";
import { ToastProvider } from './contexts/ToastContext';

// Token validation function
const validateToken = async (token) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/users/verify-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};
// Public pages
const Login = lazy(() => import("./pages/public/Login"));
const Signup = lazy(() => import("./pages/public/Signup"));
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ViewDetails = lazy(() => import('./pages/public/ViewDetails'));
const Packages = lazy(() => import('./pages/public/Packages'));
const ForgetPassword = lazy(() => import('./pages/public/ForgetPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));

// Private pages
const UserProfile = lazy(() => import("./pages/private/UserProfile"));
const Booking = lazy(() => import("./pages/private/Booking"));
const MyReview = lazy(() => import("./pages/private/MyReview"));
const Reviews = lazy(() => import("./pages/private/Reviews"));

// Admin pages
const AdminDashboard = lazy(() => import('./Admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./Admin/ManageUsers'));
const ManagePackages = lazy(() => import('./Admin/ManagePackages'));
const ManageBookings = lazy(() => import('./Admin/ManageBookings'));
const ManageReviews = lazy(() => import('./Admin/ManageReviews'));

// Protected Route Component that checks auth on each render
const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Validate token with backend
      const isValid = await validateToken(token);
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        // Token is invalid, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
      setIsValidating(false);
    };

    checkAuth();
  }, []);

  if (isValidating) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Auth Route - redirects to home if already logged in
const AuthRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Validate token with backend
      const isValid = await validateToken(token);
      setIsAuthenticated(isValid);
      setIsValidating(false);
    };

    checkAuth();
  }, []);

  if (isValidating) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        }>
          <Routes>
          {/* 🌐 PUBLIC ROUTES - Anyone can access */}
          <Route path="/" element={<HomePage />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/view-details/:id" element={<ViewDetails />} />
          <Route path="/reviews" element={<Reviews />} />
          
          {/* 🔐 AUTH ROUTES - Only for NOT logged in users */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Signup /></AuthRoute>} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 🔒 PROTECTED ROUTES - Require authentication */}
          <Route path="/bookings" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/my-reviews" element={<ProtectedRoute><MyReview /></ProtectedRoute>} />

          {/* 👨‍💼 ADMIN ROUTES - Require authentication and admin role */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />
          <Route 
            path="/admin/packages" 
            element={
              <AdminRoute>
                <ManagePackages />
              </AdminRoute>
            }
          />
          <Route 
            path="/admin/bookings" 
            element={
              <AdminRoute>
                <ManageBookings />
              </AdminRoute>
            }
          />
          <Route 
            path="/admin/reviews" 
            element={
              <AdminRoute>
                <ManageReviews />
              </AdminRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
    </ToastProvider>
  )
}

export default App
