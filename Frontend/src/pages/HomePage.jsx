import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card } from '../components/Card';
import homepageImage from '../Images/homepageimage.png';

function HomePage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All Packages');
    const [searchQuery, setSearchQuery] = useState('');
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const categories = ['All Packages', 'Adventure', 'Kailash Yatra', 'Domestic', 'International'];

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/products`, {
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
                const transformedPackages = (Array.isArray(result) ? result : []).map(pkg => ({
                    id: pkg.id,
                    title: pkg.name,
                    duration: pkg.duration || '10 days',
                    price: `Nrs. ${parseInt(pkg.price).toLocaleString()}`,
                    description: pkg.description || 'Experience an unforgettable journey',
                    image: pkg.image_url || homepageImage,
                    category: pkg.category || 'Adventure',
                    rating: 4.5,
                    reviews: 120
                }));
                setPackages(transformedPackages);
            } else {
                setError('Failed to load packages');
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Unable to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const isAuthenticated = () => {
        return !!(localStorage.getItem('token') && localStorage.getItem('user'));
    };

    const handleViewDetails = (packageId) => {
        if (isAuthenticated()) {
            navigate(`/view-details/${packageId}`);
        } else {
            sessionStorage.setItem('redirectAfterLogin', `/view-details/${packageId}`);
            alert('Please login to view package details and book your journey!');
            navigate('/login');
        }
    };

    const filteredPackages = packages.filter(pkg => {
        const matchesCategory = activeCategory === 'All Packages' || pkg.category === activeCategory;
        const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 h-[500px] flex items-center">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${homepageImage})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/80"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-white z-10 w-full">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight animate-fade-in-up">
                            Find Your Perfect <span className="text-yellow-400">Yatra</span>
                        </h1>
                        <p className="text-xl mb-8 text-gray-200 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                            Discover the best packages for your spiritual journey to Mount Kailash
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <Link 
                                to="/packages" 
                                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                            >
                                <span>Explore Packages</span>
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link 
                                to="/reviews" 
                                className="inline-flex items-center justify-center bg-white text-[#2B4C8F] px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                            >
                                <span>Read Reviews</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-12 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2B4C8F] mb-2">500+</div>
                            <div className="text-gray-600">Happy Travelers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2B4C8F] mb-2">50+</div>
                            <div className="text-gray-600">Tour Packages</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2B4C8F] mb-2">4.8★</div>
                            <div className="text-gray-600">Average Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#2B4C8F] mb-2">15+</div>
                            <div className="text-gray-600">Years Experience</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search and Filter Section */}
            <section className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Search Bar */}
                        <div className="flex-grow max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search packages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                                        activeCategory === category
                                            ? 'bg-[#2B4C8F] text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Packages Section */}
            <section className="flex-grow py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Packages</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose from our carefully curated selection of spiritual journeys and adventure tours
                        </p>
                    </div>

                    {loading ? (
                        <LoadingSpinner size="lg" text="Loading amazing packages..." />
                    ) : error ? (
                        <div className="text-center py-20">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xl text-gray-600 mb-2">{error}</p>
                            <button 
                                onClick={fetchPackages}
                                className="text-[#2B4C8F] hover:underline font-semibold"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredPackages.length === 0 ? (
                        <div className="text-center py-20">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xl text-gray-600">No packages found</p>
                            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {filteredPackages.slice(0, 6).map((pkg) => (
                                    <Card key={pkg.id} className="overflow-hidden p-0 hover:shadow-2xl transition-shadow">
                                        <div className="relative">
                                            <img 
                                                src={pkg.image} 
                                                alt={pkg.title}
                                                className="w-full h-56 object-cover"
                                            />
                                            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                                                <span className="text-[#2B4C8F] font-bold">{pkg.price}</span>
                                            </div>
                                            {!isAuthenticated() && (
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center group">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-lg shadow-lg">
                                                        <p className="text-sm font-semibold text-gray-700">Login to Book</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                                    {pkg.category}
                                                </span>
                                                <div className="flex items-center text-yellow-500">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                                    </svg>
                                                    <span className="text-sm ml-1 text-gray-600">{pkg.rating} ({pkg.reviews})</span>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.title}</h3>
                                            <div className="flex items-center text-gray-600 text-sm mb-3">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {pkg.duration}
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                                            
                                            <button
                                                onClick={() => handleViewDetails(pkg.id)}
                                                className="block w-full bg-[#2B4C8F] text-white hover:bg-blue-800 py-3 rounded-lg font-semibold transition text-center"
                                            >
                                                {isAuthenticated() ? 'View Details' : 'Login to Book'}
                                            </button>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {filteredPackages.length > 6 && (
                                <div className="text-center">
                                    <Link 
                                        to="/packages" 
                                        className="inline-flex items-center bg-[#2B4C8F] hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                                    >
                                        <span>View All {filteredPackages.length} Packages</span>
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">What Our Travelers Say</h2>
                        <p className="text-gray-200">Real experiences from real people</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/*
                            { name: 'Rajesh Kumar', role: 'Pilgrim', review: 'An amazing spiritual journey! The team was professional and the experience was life-changing.' },
                            { name: 'Priya Sharma', role: 'Adventure Seeker', review: 'Best tour package ever! Everything was well organized and the guides were extremely helpful.' },
                            { name: 'David Chen', role: 'Tourist', review: 'Incredible experience from start to finish. Highly recommend TripToKailash for anyone planning a pilgrimage.' }
                        */}
                        {['Rajesh Kumar', 'Priya Sharma', 'David Chen'].map((name, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, idx) => (
                                        <svg key={idx} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                        </svg>
                                    ))}
                                    <span className="text-sm ml-2 font-semibold text-gray-100">{name}</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-4">
                                    "An amazing spiritual journey! The team was professional and the experience was life-changing."
                                </p>
                                <div className="flex justify-end">
                                    <Link 
                                        to="/reviews" 
                                        className="text-blue-400 hover:underline text-sm font-semibold"
                                    >
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default HomePage;
