import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../contexts/ToastContext';
import PageTransition from '../../components/PageTransition';
import LoadingSpinner from '../../components/LoadingSpinner';

function Reviews() {
    const { showError } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchApprovedReviews = async () => {
            try {
                // Fetch APPROVED reviews (no auth needed - public endpoint)
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/reviews/approved`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (response.status === 401) {
                    showError('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setTimeout(() => window.location.href = '/login', 1500);
                    return;
                }
                if (response.ok) {
                    const result = await response.json();
                    setReviews(result.data || []);
                } else {
                    showError('Failed to load reviews');
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                showError('Unable to connect to server');
            } finally {
                setLoading(false);
            }
        };
        fetchApprovedReviews();
    }, [API_URL]);

    if (loading) {
        return <LoadingSpinner size="lg" text="Loading reviews..." />;
    }

    return (
        <PageTransition>
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h1 className="text-2xl sm:text-4xl font-bold mb-4">Customer Reviews</h1>
                    <p className="text-lg sm:text-xl text-gray-200">See what our travelers say about their spiritual journey</p>
                </div>
            </div>

            <div className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="text-4xl font-bold text-[#2B4C8F] mb-2">{reviews.length}</div>
                            <div className="text-gray-600">Total Reviews</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="text-4xl font-bold text-yellow-500 mb-2">
                                {reviews.length > 0 
                                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                                    : '0.0'
                                }★
                            </div>
                            <div className="text-gray-600">Average Rating</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                {reviews.filter(r => r.rating >= 4).length}
                            </div>
                            <div className="text-gray-600">4+ Star Reviews</div>
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <p className="text-xl text-gray-600 mb-4">No reviews yet</p>
                            <p className="text-gray-500 mb-6">Be the first to share your experience!</p>
                            <Link to="/packages" className="inline-block bg-[#2B4C8F] text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition">
                                Browse Packages
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center mb-2">
                                                {[...Array(5)].map((_, idx) => (
                                                    <span key={idx} className="text-yellow-400 text-xl">
                                                        {idx < review.rating ? '⭐' : '☆'}
                                                    </span>
                                                ))}
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-lg">{review.title}</h4>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4 leading-relaxed">{review.comment}</p>

                                    <div className="border-t pt-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">{review.userName}</p>
                                            <p className="text-sm text-gray-500">{review.packageName}</p>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Share Your Experience</h2>
                        <p className="text-xl mb-6">Have you traveled with us? We'd love to hear about your journey!</p>
                        <Link 
                            to="/packages" 
                            className="inline-block bg-white text-[#2B4C8F] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            View Packages
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
        </PageTransition>
    );
}

export default Reviews;