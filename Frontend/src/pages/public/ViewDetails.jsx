import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import homepageImage from '../../Images/homepageimage.png';
import { useToast } from '../../contexts/ToastContext';
import { bookingSchema, reviewSchema } from '../private/schema/privateSchema';
import PageTransition from '../../components/PageTransition';
import LoadingSpinner from '../../components/LoadingSpinner';

function ViewDetails() {
        const [bookingErrors, setBookingErrors] = useState({});
        const [reviewErrors, setReviewErrors] = useState({});
    const navigate = useNavigate();
    const { id } = useParams(); // Get package ID from URL
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const [activeTab, setActiveTab] = useState('Overview');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [equipmentList, setEquipmentList] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        travelDate: '',
        numberOfPeople: 1,
        specialRequests: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Check if package is in wishlist
    useEffect(() => {
        const checkWishlist = async () => {
            const token = localStorage.getItem('token');
            if (!token || !id) return;
            try {
                const response = await fetch(`${API_URL}/api/wishlist`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const wishlistIds = (data.data || []).map(item => item.product_id);
                    setIsInWishlist(wishlistIds.includes(parseInt(id)));
                }
            } catch (err) {
                console.error('Error checking wishlist:', err);
            }
        };
        checkWishlist();
    }, [API_URL, id]);

    // Toggle wishlist
    const toggleWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showWarning('Please login to add items to wishlist', 'Login Required');
            navigate('/login');
            return;
        }

        try {
            if (isInWishlist) {
                const response = await fetch(`${API_URL}/api/wishlist/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setIsInWishlist(false);
                    showSuccess('Removed from wishlist');
                }
            } else {
                const response = await fetch(`${API_URL}/api/wishlist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ product_id: parseInt(id) })
                });
                if (response.ok) {
                    setIsInWishlist(true);
                    showSuccess('Added to wishlist');
                }
            }
        } catch (err) {
            console.error('Wishlist error:', err);
            showError('Error updating wishlist');
        }
    };

    // Fetch equipment list
    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products?limit=100`);
                if (response.ok) {
                    const result = await response.json();
                    const equipment = (result.products || []).filter(p => 
                        (p.category || '').toLowerCase() === 'equipment'
                    );
                    setEquipmentList(equipment);
                }
            } catch (error) {
                console.error('Error fetching equipment:', error);
            }
        };
        fetchEquipment();
    }, [API_URL]);

    // Fetch package details from backend
    useEffect(() => {
        const fetchPackageDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products/${id}`);
                if (response.ok) {
                    const result = await response.json();
                    setPackageData(result);
                } else {
                    showError('Package not found or unavailable.', 'Package Error');
                    navigate('/packages');
                }
            } catch (error) {
                console.error('Error fetching package:', error);
                showError('Failed to load package details. Please try again.', 'Loading Error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPackageDetails();
        }
    }, [id, API_URL, navigate]);

    const itinerary = [
        {
            day: 1,
            title: 'Arrival in Kathmandu and Drive to Syabrubesi',
            description: 'Upon arrival at Tribhuvan International Airport, you will be greeted by our representative. After a brief meeting and trip briefing, we will drive to Syabrubesi, a beautiful village that serves as the gateway to the Langtang region. The journey takes approximately 7-8 hours through scenic landscapes.'
        },
        {
            day: 2,
            title: 'Drive from Syabrubesi to Kerung (Tibet Border)',
            description: 'After breakfast, we drive from Syabrubesi to Kerung, crossing the Nepal-Tibet border at Rasuwagadhi. Complete immigration formalities and continue the journey to Kerung (2,700m), where we will spend the night for acclimatization.'
        },
        {
            day: 3,
            title: 'Drive to Saga via Tingri',
            description: 'Today we drive through the Tibetan plateau, passing through Tingri with spectacular views of Mount Everest, Cho Oyu, and other Himalayan peaks. We continue to Saga (4,500m) for overnight stay.'
        },
        {
            day: 4,
            title: 'Drive to Manasarovar Lake',
            description: 'We drive to the sacred Manasarovar Lake (4,590m), one of the highest freshwater lakes in the world. Upon arrival, take a ritual bath in the holy lake and perform puja. Overnight camping near the lake shore.'
        },
        {
            day: 5,
            title: 'Manasarovar to Darchen',
            description: 'After morning prayers and a final view of Manasarovar, we drive to Darchen (4,560m), the starting point of the Mount Kailash parikrama (circumambulation). Rest and prepare for the sacred kora.'
        },
        {
            day: 6,
            title: 'Trek from Darchen to Dirapuk',
            description: 'Begin the sacred parikrama of Mount Kailash. Trek from Darchen to Dirapuk (5,080m), following the western face of Mount Kailash. The trek takes about 6-7 hours with stunning views of the north face of Kailash.'
        },
        {
            day: 7,
            title: 'Trek from Dirapuk to Zuthulpuk via Dolma La Pass',
            description: 'This is the most challenging day as we cross the Dolma La Pass (5,630m), the highest point of the parikrama. After crossing the pass, descend to Zuthulpuk (4,790m). The trek takes about 8-9 hours.'
        },
        {
            day: 8,
            title: 'Trek from Zuthulpuk to Darchen',
            description: 'Complete the final leg of the Kailash parikrama by trekking back to Darchen. The trek takes about 4-5 hours. Celebrate the successful completion of the holy circumambulation.'
        },
        {
            day: 9,
            title: 'Drive back to Kathmandu via Kerung',
            description: 'Begin the return journey to Kathmandu, driving through Kerung and crossing back into Nepal. Overnight stay in a border town or continue to Kathmandu depending on road conditions.'
        },
        {
            day: 10,
            title: 'Arrival in Kathmandu and Departure',
            description: 'Arrive in Kathmandu and transfer to your hotel. Free time for last-minute shopping or rest. Transfer to the airport for your departure flight with blessed memories of the sacred journey.'
        }
    ];


    const handleBooking = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            showWarning('Please login to book this package. You will be redirected to the login page.', 'Login Required');
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
        } else {
            setShowBookingModal(true);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingErrors({});
        const token = localStorage.getItem('token');
        const bookingData = {
            productId: parseInt(id),
            travelDate: bookingForm.travelDate,
            numberOfPeople: parseInt(bookingForm.numberOfPeople),
            specialRequests: bookingForm.specialRequests,
            equipmentItems: selectedEquipment.map(eq => ({
                id: eq.id,
                name: eq.name,
                price: eq.price,
                quantity: eq.quantity
            }))
        };
        
        // Validate booking data using safeParse
        const bookingResult = bookingSchema.safeParse(bookingData);
        if (!bookingResult.success) {
            const errors = {};
            const fieldErrors = bookingResult.error.flatten().fieldErrors;
            Object.keys(fieldErrors).forEach((key) => {
                if (fieldErrors[key]?.[0]) {
                    errors[key] = fieldErrors[key][0];
                }
            });
            setBookingErrors(errors);
            showError('Please fix the errors in the booking form');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });
            if (response.status === 401) {
                showError('Your session has expired. Please login again to continue.', 'Session Expired');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => window.location.href = '/login', 1500);
                return;
            }
            if (response.ok) {
                showSuccess('Your booking request has been submitted successfully! Our team will contact you within 24 hours.', 'Booking Submitted');
                setShowBookingModal(false);
                setBookingForm({ travelDate: '', numberOfPeople: 1, specialRequests: '' });
                setSelectedEquipment([]);
                navigate('/bookings');
            } else {
                const error = await response.json();
                showError(error.error || 'Failed to submit booking. Please try again.', 'Booking Failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            showError('Failed to submit booking. Please check your internet connection and try again.', 'Connection Error');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewErrors({});
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        const reviewData = {
            rating: parseInt(reviewForm.rating),
            title: reviewForm.title,
            comment: reviewForm.comment
        };
        
        // Validate review data using safeParse
        const reviewResult = reviewSchema.safeParse(reviewData);
        if (!reviewResult.success) {
            const errors = {};
            const fieldErrors = reviewResult.error.flatten().fieldErrors;
            Object.keys(fieldErrors).forEach((key) => {
                if (fieldErrors[key]?.[0]) {
                    errors[key] = fieldErrors[key][0];
                }
            });
            setReviewErrors(errors);
            showError('Please fix the errors in the review form');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user.id,
                    product_id: parseInt(id),
                    ...reviewData
                })
            });
            if (response.ok) {
                showSuccess('Your review has been submitted successfully! It will be visible after admin approval.', 'Review Submitted');
                setShowReviewModal(false);
                setReviewForm({ rating: 0, title: '', comment: '' });
            } else {
                const error = await response.json();
                showError(error.error || 'Failed to submit review. Please try again.', 'Review Failed');
            }
        } catch (error) {
            console.error('Review error:', error);
            showError('Failed to submit review. Please check your internet connection and try again.', 'Connection Error');
        }
    };

    if (loading) {
        return <LoadingSpinner size="lg" text="Loading package details..." />;
    }

    if (!packageData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">Package not found</p>
            </div>
        );
    }

    const imageSrc = packageData.image_url
        ? (packageData.image_url.startsWith('/uploads') ? `${API_URL}${packageData.image_url}` : packageData.image_url)
        : homepageImage;

    return (
        <PageTransition>
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Breadcrumb and Header */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Link to="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">&gt;</span>
                        <Link to="/packages" className="hover:text-blue-600">Packages</Link>
                        <span className="mx-2">&gt;</span>
                        <span className="text-gray-400">{packageData.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tour Package</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{packageData.name}</h1>
                            <p className="text-gray-600">10 Days Sacred Journey</p>
                        </div>
                        <Link to="/packages" className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap">
                            ← Back to Packages
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Image Gallery */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                                <img 
                                    src={imageSrc} 
                                    alt={packageData.name}
                                    className="w-full h-96 object-cover"
                                    onError={(e) => {
                                        e.target.src = homepageImage;
                                    }}
                                />
                            </div>

                            {/* Tabs */}
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="border-b border-gray-200">
                                    <div className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
                                        {['Overview', 'Itinerary', 'Highlights'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`py-4 text-sm font-medium border-b-2 transition ${
                                                    activeTab === tab
                                                        ? 'border-blue-600 text-blue-600'
                                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {activeTab === 'Overview' && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Journey</h2>
                                            <p className="text-gray-600 mb-4 leading-relaxed">
                                                {packageData.description || 'Mount Kailash, standing at 6,638 meters, is one of the most sacred mountains in the world. Revered by Hindus, Buddhists, Jains, and Bon followers, this spiritual journey offers a unique opportunity to embark on a pilgrimage that has been undertaken by devotees for thousands of years.'}
                                            </p>
                                            <p className="text-gray-600 mb-4 leading-relaxed">
                                                Our carefully designed 10-day Kailash Yatra package takes you through the mystical landscapes of Tibet, including the sacred Manasarovar Lake and the holy circumambulation (parikrama) of Mount Kailash. This journey is not just a physical trek but a profound spiritual experience that transforms lives.
                                            </p>
                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                The package includes comfortable accommodation, experienced guides, all necessary permits, and transportation. We ensure your safety and comfort throughout this sacred journey while respecting the spiritual significance of every location we visit.
                                            </p>

                                            <h3 className="text-xl font-bold text-gray-800 mb-3">What's Included</h3>
                                            <ul className="space-y-2 mb-6">
                                                {[
                                                    'All ground transportation in private vehicle',
                                                    'Accommodation in hotels and guesthouses',
                                                    'All meals during the trek (breakfast, lunch, dinner)',
                                                    'Experienced English-speaking guide and porters',
                                                    'Tibet visa and all necessary permits',
                                                    'First aid medical kit and oxygen cylinder'
                                                ].map((item, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-700">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {activeTab === 'Itinerary' && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Detailed Itinerary</h2>
                                            <div className="space-y-4">
                                                {itinerary.map((item) => (
                                                    <div key={item.day} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-grow">
                                                                <h3 className="font-semibold text-gray-800 mb-2">
                                                                    <span className="text-blue-600">Day {item.day}:</span> {item.title}
                                                                </h3>
                                                                {item.description && (
                                                                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Highlights' && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tour Highlights</h2>
                                            <ul className="space-y-3">
                                                {[
                                                    'Sacred darshan of Mount Kailash, the abode of Lord Shiva',
                                                    'Holy bath and circumambulation of Manasarovar Lake',
                                                    'Complete the sacred Kailash Parikrama (circumambulation)',
                                                    'Cross the challenging Dolma La Pass at 5,630 meters',
                                                    'Visit ancient Tibetan monasteries and experience Buddhist culture',
                                                    'Breathtaking views of the Himalayan ranges including Mount Everest',
                                                    'Experienced guides ensuring safe and meaningful pilgrimage',
                                                    'Life-changing spiritual experience and inner transformation'
                                                ].map((highlight, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-700">{highlight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
                                
                                <button
                                    onClick={() => {
                                        const user = localStorage.getItem('user');
                                        if (!user) {
                                            showWarning('Please login to write a review. You will be redirected to the login page.', 'Login Required');
                                            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                                            navigate('/login');
                                        } else {
                                            setShowReviewModal(true);
                                        }
                                    }}
                                    className="bg-[#2B4C8F] text-white px-6 py-3 rounded-lg hover:bg-blue-700 mb-6 transition"
                                >
                                    Write a Review
                                </button>

                                <p className="text-gray-600 text-sm">Reviews will appear after admin approval</p>
                            </div>
                        </div>

                        {/* Sidebar - Booking Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <div className="mb-4 relative">
                                    <img 
                                        src={imageSrc} 
                                        alt={packageData.name}
                                        className="w-full h-32 object-cover rounded-lg mb-4"
                                        onError={(e) => {
                                            e.target.src = homepageImage;
                                        }}
                                    />
                                    {/* Wishlist Heart Button */}
                                    <button
                                        onClick={toggleWishlist}
                                        className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all hover:scale-110"
                                        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                    >
                                        <svg 
                                            className={`w-5 h-5 transition-colors ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400 fill-transparent hover:text-red-400'}`}
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{packageData.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{packageData.duration || '10 days'} Journey</p>
                                    <div className="flex items-baseline mb-4">
                                        <span className="text-3xl font-bold text-[#2B4C8F]">
                                            {packageData.formattedPrice || `Nrs. ${parseFloat(packageData.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        </span>
                                        <span className="text-gray-500 text-sm ml-2">per person</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Available slots: <strong className={packageData.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>{packageData.stock_quantity || 0}</strong>
                                    </p>
                                </div>

                                <button 
                                    onClick={handleBooking}
                                    className="w-full bg-[#2B4C8F] hover:bg-blue-800 text-white py-3 rounded-md font-semibold transition mb-4 shadow-lg"
                                >
                                    Book Now
                                </button>
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                                    Payment is collected in cash at the office or as confirmed by phone. We will call to confirm your appointment.
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-3">
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>10 days duration</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>Max 100 participants</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Mount Kailash, Tibet</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>All permits included</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <svg className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span>Accommodation included</span>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Required Items</h4>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>Passport or valid ID</li>
                                        <li>Warm clothing and trekking shoes</li>
                                        <li>Personal medication and basic first aid</li>
                                        <li>Reusable water bottle</li>
                                        <li>Power bank and flashlight</li>
                                    </ul>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-gray-600 text-center">
                                        <strong>Note:</strong> Physical fitness required. Medical clearance recommended for travelers above 60 years.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Book Your Journey</h2>
                            <button 
                                onClick={() => setShowBookingModal(false)}
                                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Travel Date *</label>
                                    <input
                                        type="date"
                                        value={bookingForm.travelDate}
                                        onChange={(e) => setBookingForm({...bookingForm, travelDate: e.target.value})}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                                        required
                                    />
                                    {bookingErrors.travelDate && <p className="text-red-500 text-sm mt-1">{bookingErrors.travelDate}</p>}
                                </div>
                            
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Number of People *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={packageData.stock_quantity || 100}
                                        value={bookingForm.numberOfPeople}
                                        onChange={(e) => setBookingForm({...bookingForm, numberOfPeople: parseInt(e.target.value) || 1})}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                                        required
                                    />
                                    {bookingErrors.numberOfPeople && <p className="text-red-500 text-sm mt-1">{bookingErrors.numberOfPeople}</p>}
                                </div>
                            </div>

                            {/* Equipment Add-ons */}
                            {equipmentList.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        <span className="flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-[#2B4C8F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                                            </svg>
                                            Add Equipment (Optional)
                                        </span>
                                    </label>
                                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                                        {equipmentList.map((equip) => (
                                            <label 
                                                key={equip.id}
                                                className="flex items-center justify-between p-2 hover:bg-white rounded cursor-pointer transition"
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEquipment.some(e => e.id === equip.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedEquipment([...selectedEquipment, { ...equip, quantity: 1 }]);
                                                            } else {
                                                                setSelectedEquipment(selectedEquipment.filter(item => item.id !== equip.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-[#2B4C8F] rounded focus:ring-[#2B4C8F]"
                                                    />
                                                    <span className="ml-3 text-gray-700">{equip.name}</span>
                                                </div>
                                                <span className="text-[#2B4C8F] font-medium text-sm">
                                                    Nrs. {parseFloat(equip.price).toLocaleString()}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {selectedEquipment.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-sm text-gray-600 font-medium">Selected Equipment:</p>
                                            {selectedEquipment.map((equip) => (
                                                <div key={equip.id} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                                                    <span className="text-sm text-gray-700">{equip.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedEquipment(selectedEquipment.map(e => 
                                                                    e.id === equip.id ? { ...e, quantity: Math.max(1, e.quantity - 1) } : e
                                                                ));
                                                            }}
                                                            className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                                                        >-</button>
                                                        <span className="w-8 text-center text-sm font-medium">{equip.quantity}</span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedEquipment(selectedEquipment.map(e => 
                                                                    e.id === equip.id ? { ...e, quantity: e.quantity + 1 } : e
                                                                ));
                                                            }}
                                                            className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                                                        >+</button>
                                                        <span className="text-sm text-[#2B4C8F] font-medium ml-2">
                                                            Nrs. {(parseFloat(equip.price) * equip.quantity).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Special Requests (Optional)</label>
                                <textarea
                                    value={bookingForm.specialRequests}
                                    onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                                    rows="3"
                                    placeholder="Any dietary requirements, accessibility needs, etc."
                                ></textarea>
                            </div>

                            {/* Pricing Summary */}
                            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                <h4 className="font-semibold text-gray-800 mb-3">Price Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Package ({bookingForm.numberOfPeople} person{bookingForm.numberOfPeople > 1 ? 's' : ''})</span>
                                        <span className="font-medium">Nrs. {(parseInt(packageData.price) * bookingForm.numberOfPeople).toLocaleString()}</span>
                                    </div>
                                    {selectedEquipment.length > 0 && (
                                        <>
                                            <div className="border-t border-blue-200 pt-2 mt-2">
                                                <span className="text-gray-600 font-medium">Equipment Add-ons:</span>
                                            </div>
                                            {selectedEquipment.map(equip => (
                                                <div key={equip.id} className="flex justify-between pl-4">
                                                    <span className="text-gray-600">{equip.name} x{equip.quantity}</span>
                                                    <span className="font-medium">Nrs. {(parseFloat(equip.price) * equip.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between text-base font-bold">
                                        <span className="text-gray-800">Total Amount</span>
                                        <span className="text-[#2B4C8F]">
                                            Nrs. {(
                                                (parseInt(packageData.price) * bookingForm.numberOfPeople) +
                                                selectedEquipment.reduce((sum, equip) => sum + (parseFloat(equip.price) * equip.quantity), 0)
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button 
                                    type="submit"
                                    className="flex-1 bg-[#2B4C8F] hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition shadow-lg"
                                >
                                    Confirm Booking
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md font-semibold transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Write a Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Rating *</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({...reviewForm, rating: star})}
                                            className="text-3xl transition hover:scale-110"
                                        >
                                            {star <= reviewForm.rating ? '⭐' : '☆'}
                                        </button>
                                    ))}
                                </div>
                                {reviewForm.rating === 0 && <p className="text-red-500 text-xs mt-1">Please select a rating</p>}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={reviewForm.title}
                                    onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                                    placeholder="Sum up your experience"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Your Review *</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                                    rows="4"
                                    placeholder="Share your experience with this journey..."
                                    required
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewForm.rating === 0}
                                    className="flex-1 bg-[#2B4C8F] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
        </PageTransition>
    );
}

export default ViewDetails;
