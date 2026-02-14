import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../contexts/ToastContext';
import PageTransition from '../../components/PageTransition';
import LoadingSpinner from '../../components/LoadingSpinner';

function MyReviews() {
    const { showError } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/reviews/user`, {
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
        fetchMyReviews();
    }, [API_URL]);

    const getStatusBadge = (status) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <LoadingSpinner size="lg" text="Loading reviews..." />;
    }

    return (
        <PageTransition>
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-grow py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Reviews</h1>
                        <p className="text-gray-600">Manage your submitted reviews</p>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <p className="text-xl text-gray-600 mb-4">No reviews yet</p>
                            <Link to="/packages" className="text-[#2B4C8F] hover:underline">
                                Browse packages to leave a review
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">{review.packageName}</h3>
                                            <div className="flex items-center mb-2">
                                                {[...Array(5)].map((_, idx) => (
                                                    <span key={idx} className="text-yellow-400 text-xl">
                                                        {idx < review.rating ? '⭐' : '☆'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(review.status)}`}>
                                            {review.status}
                                        </span>
                                    </div>

                                    <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                                    <p className="text-gray-600 mb-4">{review.comment}</p>

                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>

                                    {review.status === 'Pending' && (
                                        <p className="text-sm text-yellow-600 mt-2">
                                            ⏳ Your review is pending admin approval
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
        </PageTransition>
    );
}

export default MyReviews;