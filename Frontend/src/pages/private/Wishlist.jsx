import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import PageTransition from '../../components/PageTransition';
import SkeletonLoader from '../../components/SkeletonLoader';
import { useToast } from '../../contexts/ToastContext';

function Wishlist() {
  const { showSuccess, showError } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to view your wishlist');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data || []);
      } else if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
      } else {
        setError('Failed to load wishlist');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showSuccess('Removed from wishlist');
        setWishlistItems(wishlistItems.filter(item => item.product_id !== productId));
      } else {
        showError('Failed to remove from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      showError('Error removing from wishlist');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        {/* Hero Section */}
        <div className="relative h-64 bg-gradient-to-r from-blue-900 to-blue-700">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <motion.div 
            className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Wishlist</h1>
            <p className="text-lg md:text-xl">Save your favorite packages for later</p>
          </motion.div>
        </div>

        <div className="flex-grow container mx-auto px-4 py-8">
          {loading ? (
            <SkeletonLoader count={6} type="card" />
          ) : error ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl text-gray-600 font-medium">{error}</p>
              <Link to="/packages" className="mt-4 inline-block text-[#2B4C8F] hover:underline font-semibold">
                Browse Packages
              </Link>
            </motion.div>
          ) : wishlistItems.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-xl text-gray-600 font-medium">Your wishlist is empty</p>
              <p className="text-gray-500 mt-2">Start adding packages to your wishlist!</p>
              <Link to="/packages" className="mt-4 inline-block bg-[#2B4C8F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
                Browse Packages
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {wishlistItems.map((item) => (
                <motion.div 
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5 }
                    }
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <motion.img 
                      src={item.Product?.image_url
                        ? (item.Product.image_url.startsWith('/uploads') ? `${API_URL}${item.Product.image_url}` : item.Product.image_url)
                        : '/default-image.jpg'}
                      alt={item.Product?.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-md">
                      <span className="text-[#2B4C8F] font-bold">Nrs. {item.Product?.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.Product?.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.Product?.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-[#2B4C8F] text-sm rounded-full">
                        {item.Product?.category}
                      </span>
                      <span className="text-sm text-gray-500">{item.Product?.duration}</span>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => removeFromWishlist(item.product_id)}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg font-medium transition"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Remove
                      </motion.button>
                      <Link
                        to={`/view-details/${item.product_id}`}
                        className="flex-1 bg-[#2B4C8F] text-white hover:bg-blue-800 py-2 rounded-lg font-medium transition text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}

export default Wishlist;
