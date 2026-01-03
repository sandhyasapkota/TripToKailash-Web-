// Frontend/src/App.jsx - FIXED VERSION
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LoadingSpinner } from './components/LoadingSpinner'
import AdminRoute from './components/AdminRoute';

const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const HomePage = lazy(() => import('./pages/HomePage'))
const Booking = lazy(() => import('./pages/Booking'))
const ViewDetails = lazy(() => import('./pages/ViewDetails'))
const Packages = lazy(() => import('./pages/Packages'))
const ForgetPassword = lazy(() => import('./pages/ForgetPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const AdminDashboard = lazy(() => import('./Admin/AdminDashboard'))
const ManageUsers = lazy(() => import('./Admin/ManageUsers'))
const ManagePackages = lazy(() => import('./Admin/ManagePackages'))
const ManageBookings = lazy(() => import('./Admin/ManageBookings'))
const ManageReviews = lazy(() => import('./Admin/ManageReviews'))
const Reviews = lazy(() => import('./pages/Reviews'))
const MyReviews = lazy(() => import('./pages/MyReview'))

// Protected Route Component that checks auth on each render
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Auth Route - redirects to home if already logged in
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
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
          <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />

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
  )
}

export default App
