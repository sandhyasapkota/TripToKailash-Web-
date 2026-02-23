import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import PageTransition from '../../components/PageTransition';
import SkeletonLoader from '../../components/SkeletonLoader';
import homepageImage from '../../Images/homepageimage.png';
import { useToast } from '../../contexts/ToastContext';

function Packages() {
    const navigate = useNavigate();
    const { showSuccess, showError, showWarning } = useToast();
    const [activeCategory, setActiveCategory] = useState('All Packages');
    const [searchQuery, setSearchQuery] = useState('');
    const [allPackages, setAllPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [wishlistIds, setWishlistIds] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const categories = ['All Packages', 'Adventure', 'Kailash Yatra', 'Domestic', 'International'];

    // Fetch wishlist
    const fetchWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWishlistIds((data.data || []).map(item => item.product_id));
            }
        } catch (err) {
            console.error('Error fetching wishlist:', err);
        }
    };

    // Toggle wishlist
    const toggleWishlist = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            showWarning('Please login to add items to wishlist', 'Login Required');
            navigate('/login');
            return;
        }

        try {
            const isInWishlist = wishlistIds.includes(productId);
            if (isInWishlist) {
                const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setWishlistIds(wishlistIds.filter(id => id !== productId));
                    showSuccess('Removed from wishlist');
                }
            } else {
                const response = await fetch(`${API_URL}/api/wishlist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ product_id: productId })
                });
                if (response.ok) {
                    setWishlistIds([...wishlistIds, productId]);
                    showSuccess('Added to wishlist');
                }
            }
        } catch (err) {
            console.error('Wishlist error:', err);
            showError('Error updating wishlist');
        }
    };

    // Fetch packages from backend
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/products?limit=100`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (response.status === 401) {
                    setError('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setTimeout(() => window.location.href = '/login', 1500);
                    return;
                }
                if (response.ok) {
                    const result = await response.json();
                    console.log('Fetched packages:', result); // Debug log
                    // Backend returns { message, products: [...] }
                    const packagesArray = (result.products || []).filter(pkg => (pkg.category || '').toLowerCase() !== 'equipment');
                    // Transform backend data to match your UI format
                    const transformedPackages = packagesArray.map(pkg => ({
                        id: pkg.id,
                        title: pkg.name,
                        duration: pkg.duration || '10 days',
                        price: pkg.price ? `Nrs. ${parseFloat(pkg.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'Price not available',
                        slots: pkg.stock_quantity || 0,
                        description: pkg.description || 'No description available',
                        image: pkg.image_url
                            ? (pkg.image_url.startsWith('/uploads') ? `${API_URL}${pkg.image_url}` : pkg.image_url)
                            : homepageImage,
                        category: pkg.category || 'Adventure',
                        rating: 4.5,
                        reviews: 120
                    }));
                    setAllPackages(transformedPackages);
                    setError('');
                } else {
                    setError('Failed to fetch packages');
                    console.error('Failed to fetch packages');
                }
            } catch (error) {
                console.error('Error fetching packages:', error);
                setError('Unable to connect to server');
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
        fetchWishlist();
    }, [API_URL]);

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!(localStorage.getItem('token') && localStorage.getItem('user'));
    };

    // Handle view details click - check authentication
    const handleViewDetails = (packageId) => {
        navigate(`/view-details/${packageId}`);
    };

    // Filter packages based on category and search
    const filteredPackages = allPackages.filter(pkg => {
        const matchesCategory = activeCategory === 'All Packages' || pkg.category === activeCategory;
        const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative h-64 bg-gradient-to-r from-blue-900 to-blue-700">
                <div className="absolute inset-0 bg-black opacity-30"></div>
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Tour Packages</h1>
                    <p className="text-lg md:text-xl">Explore amazing destinations with us</p>
                </div>
            </div>

            <div className="flex-grow container mx-auto px-4 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search packages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#2B4C8F] shadow-md"
                            />
                            <svg 
                                className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex gap-3 justify-center min-w-max px-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-3 rounded-full font-medium transition whitespace-nowrap ${
                                    activeCategory === category
                                        ? 'bg-[#2B4C8F] text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Packages Grid */}
                {loading ? (
                    <SkeletonLoader count={6} type="card" />
                ) : filteredPackages.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-xl text-gray-600 font-medium">No packages found</p>
                        <p className="text-gray-500 mt-2">Try adjusting your search or category filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPackages.map((pkg) => (
                            <div 
                                key={pkg.id} 
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img 
                                        src={pkg.image} 
                                        alt={pkg.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = homepageImage;
                                        }}
                                    />
                                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-md">
                                        <span className="text-[#2B4C8F] font-bold">{pkg.price}</span>
                                    </div>
                                    {/* Wishlist Heart Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(pkg.id);
                                        }}
                                        className="absolute top-4 left-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-md z-10 transition-transform hover:scale-110 active:scale-90"
                                        title={wishlistIds.includes(pkg.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                    >
                                        <svg 
                                            className={`w-6 h-6 transition-colors ${wishlistIds.includes(pkg.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 fill-transparent hover:text-red-400'}`}
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                    <div className="absolute top-14 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                                        {pkg.slots > 0 ? `${pkg.slots} slots available` : 'Sold out'}
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-gray-800">{pkg.title}</h3>
                                        <span className="text-sm text-gray-500">{pkg.duration}</span>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {pkg.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className={`w-3 h-3 rounded-full ${pkg.slots > 10 ? 'bg-green-500' : pkg.slots > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            />
                                            <span className="text-sm text-gray-600">
                                                {pkg.slots > 10 ? 'High availability' : pkg.slots > 0 ? 'Limited slots' : 'Sold out'}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">{pkg.slots} slots left</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-[#2B4C8F] text-sm rounded-full">
                                            {pkg.category}
                                        </span>
                                        <button
                                            onClick={() => handleViewDetails(pkg.id)}
                                            disabled={pkg.slots === 0}
                                            className={`px-6 py-2 rounded-full font-medium transition ${
                                                pkg.slots === 0 
                                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                                    : 'bg-[#2B4C8F] text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            {pkg.slots === 0 ? 'Sold Out' : 'View Details'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
            </div>
        </PageTransition>
    );
}

export default Packages;
