import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import homepageImage from '../../Images/homepageimage.png';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import PageTransition from '../../components/PageTransition';

function Booking() {
    const { showSuccess, showError } = useToast();
    const [activeTab, setActiveTab] = useState('Current Bookings');
    const [activeCategory, setActiveCategory] = useState('All Packages');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentBookings, setCurrentBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(null);

    const categories = ['All Packages', 'Adventure', 'Kailash Yatra', 'Domestic', 'International'];
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchBookings = useCallback(async () => {
        try {
            // setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/bookings/user`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (response.status === 401) {
                let errorMsg = 'Session expired or invalid. Please login again.';
                try {
                    const errData = await response.json();
                    if (errData && errData.error) {
                        if (errData.error.includes('expired')) errorMsg = 'Your session has expired. Please login again.';
                        else if (errData.error.includes('User not found')) errorMsg = 'User not found. Please login again.';
                        else if (errData.error.includes('Invalid token')) errorMsg = 'Invalid login session. Please login again.';
                        else errorMsg = errData.error;
                    }
                } catch (e) {
                    // Optionally log the error for debugging
                    console.error('Error parsing error response:', e);
                }
                showError(errorMsg);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            }
            if (response.ok) {
                const result = await response.json();
                setCurrentBookings(result.data.filter(b => b.status !== 'Completed'));
                setPastBookings(result.data.filter(b => b.status === 'Completed'));
            } else {
                showError('Failed to load bookings. Please try again.');
                setCurrentBookings([]);
                setPastBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            showError('Unable to connect to server. Please try again.');
            setCurrentBookings([]);
            setPastBookings([]);
        } finally {
            // setLoading(false);
        }
    }, [API_URL, showError]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Filter bookings based on category and search
    const filterBookings = (bookings) => {
        return bookings.filter(booking => {
            const matchesCategory = activeCategory === 'All Packages' || 
                (booking.packageName && booking.packageName.toLowerCase().includes(activeCategory.toLowerCase()));
            const matchesSearch = !searchQuery || 
                (booking.packageName && booking.packageName.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    };

    const displayBookings = filterBookings(activeTab === 'Current Bookings' ? currentBookings : pastBookings);

    const handleCancelBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const result = await response.json();
            if (response.ok) {
                showSuccess('Booking cancelled successfully.');
                setCurrentBookings((prev) =>
                    prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
                );
                setPastBookings((prev) =>
                    prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
                );
                setCancelConfirm(null);
            } else {
                showError(result.error || 'Failed to cancel booking.');
            }
        } catch (err) {
            console.error('Cancel booking error:', err);
            showError('Unable to connect to server. Please try again.');
        }
    };

    return (
        <PageTransition>
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Bookings</h1>
                        <div className="flex space-x-2 text-sm text-gray-600 hidden sm:flex">
                            <span>Home</span>
                            <span>/</span>
                            <span className="text-blue-600">My Bookings</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border-b border-yellow-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-sm text-yellow-800">
                    Booking confirmation is completed by phone call. Payment is accepted in cash at the office or as agreed during the confirmation call.
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('Current Bookings')}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition ${
                                activeTab === 'Current Bookings'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Current Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('Past Bookings')}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition ${
                                activeTab === 'Past Bookings'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Past Bookings
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Filter & Search */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative max-w-md">
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Category Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    activeCategory === category
                                        ? 'bg-[#2B4C8F] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bookings Content */}
            <div className="flex-grow py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {displayBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-gray-600 mb-4">No {activeTab.toLowerCase()} found</p>
                            <Link to="/packages" className="inline-block bg-[#2B4C8F] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition">
                                Browse Packages
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {displayBookings.map((booking) => (
                                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Image */}
                                        <div className="w-full sm:w-2/5">
                                            <img 
                                                src={homepageImage} 
                                                alt={booking.packageName || 'Package'}
                                                className="w-full h-48 sm:h-full object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="w-full sm:w-3/5 p-4 sm:p-6 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">{booking.packageName || 'Travel Package'}</h3>
                                                <p className="text-[#2B4C8F] text-lg font-semibold mb-2">
                                                    Nrs. {parseFloat(booking.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                
                                                {/* Status Badge */}
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                                                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {booking.status}
                                                </span>

                                                {/* Date Information */}
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    {booking.travelDate && (
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>Travel Date: {booking.travelDate}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <span>Travelers: {booking.numberOfPeople || 1}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* View Details Button */}
                                            <div className="mt-4 space-y-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="block w-full bg-[#2B4C8F] hover:bg-blue-800 text-white py-2 rounded-md font-medium transition text-center"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    disabled={booking.status === 'Cancelled' || booking.status === 'Completed'}
                                                    className={`w-full py-2 rounded-md font-medium transition ${
                                                        booking.status === 'Cancelled' || booking.status === 'Completed'
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                    }`}
                                                >
                                                    {booking.status === 'Cancelled' ? 'Cancelled' : 'Cancel Booking'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* More Bookings Section */}
                    {activeTab === 'Past Bookings' && pastBookings.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">More Bookings</h2>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <img 
                                    src={homepageImage} 
                                    alt="More bookings"
                                    className="w-full h-64 object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#2B4C8F] to-blue-600 text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
                                    <p className="text-blue-100 text-sm">Booking ID: #{selectedBooking.id}</p>
                                </div>
                                <button 
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-white hover:bg-white/20 p-2 rounded-full transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Package Info */}
                            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                                <img 
                                    src={homepageImage}
                                    alt={selectedBooking.packageName}
                                    className="w-32 h-24 object-cover rounded-lg"
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedBooking.packageName || 'Travel Package'}</h3>
                                    <p className="text-[#2B4C8F] text-lg font-semibold">
                                        Nrs. {parseFloat(selectedBooking.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mb-6">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                                    selectedBooking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                    selectedBooking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    selectedBooking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                    selectedBooking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${
                                        selectedBooking.status === 'Confirmed' ? 'bg-green-500' :
                                        selectedBooking.status === 'Pending' ? 'bg-yellow-500' :
                                        selectedBooking.status === 'Completed' ? 'bg-blue-500' :
                                        selectedBooking.status === 'Cancelled' ? 'bg-red-500' :
                                        'bg-gray-500'
                                    }`}></span>
                                    {selectedBooking.status}
                                </span>
                            </div>

                            {/* Booking Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-1">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm">Travel Date</span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{selectedBooking.travelDate || 'Not specified'}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-1">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="text-sm">Number of Travelers</span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{selectedBooking.numberOfPeople || 1} person(s)</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-1">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm">Booking Date</span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{new Date(selectedBooking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-1">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm">Total Amount</span>
                                    </div>
                                    <p className="font-semibold text-[#2B4C8F]">Nrs. {parseFloat((selectedBooking.price || 0) * (selectedBooking.numberOfPeople || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            {/* Special Requests */}
                            {selectedBooking.specialRequests && (
                                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Special Requests
                                    </h4>
                                    <p className="text-gray-700">{selectedBooking.specialRequests}</p>
                                </div>
                            )}

                            {/* Equipment Items */}
                            {selectedBooking.equipmentItems && selectedBooking.equipmentItems.length > 0 && (
                                <div className="bg-purple-50 p-4 rounded-lg mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Equipment Rented
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedBooking.equipmentItems.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white p-2 rounded border border-purple-100">
                                                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                                                <span className="font-medium text-purple-700">Nrs. {(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 border-t border-purple-200 mt-2">
                                            <span className="font-semibold text-gray-800">Equipment Total</span>
                                            <span className="font-bold text-purple-700">
                                                Nrs. {selectedBooking.equipmentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Notice */}
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800 mb-1">Payment Information</h4>
                                        <p className="text-sm text-yellow-700">Payment is collected in cash at the office or as confirmed by phone call. Our team will contact you shortly.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Link 
                                    to={`/view-details/${selectedBooking.productId}`}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition text-center"
                                >
                                    View Package
                                </Link>
                                {selectedBooking.status !== 'Cancelled' && selectedBooking.status !== 'Completed' && (
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setCancelConfirm(selectedBooking.id);
                                        }}
                                        className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 py-3 rounded-lg font-medium transition"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={cancelConfirm !== null}
                onClose={() => setCancelConfirm(null)}
                onConfirm={() => handleCancelBooking(cancelConfirm)}
                title="Cancel Booking"
                message="Are you sure you want to cancel this booking? This action may have cancellation policies applied."
                confirmText="Yes, Cancel"
                cancelText="No, Keep"
                type="warning"
            />

            <Footer />
        </div>
        </PageTransition>
    );
}

export default Booking;
