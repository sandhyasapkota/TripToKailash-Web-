import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../Images/logo.png';
import ConfirmModal from './ConfirmModal';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const profileMenuRef = useRef(null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            if (token && userData) {
                setIsAuthenticated(true);
                setUser(JSON.parse(userData));
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) => {
        return `text-white text-sm font-medium hover:text-gray-200 transition-colors duration-200 ${
            isActive(path) ? 'border-b-2 border-white pb-1' : ''
        }`;
    };

    return (
        <nav className={`bg-[#2B4C8F] sticky top-0 z-50 transition-all duration-300 ${
            isScrolled ? 'shadow-lg' : 'shadow-md'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <img 
                            src={logo} 
                            alt="TripToKailash" 
                            className="h-12 w-auto group-hover:scale-105 transition-transform"
                        />
                        <span className="text-white font-bold text-xl">TripToKailash</span>
                    </Link>

                    {/* Desktop Menu Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={navLinkClass('/')}>
                            Home
                        </Link>
                        <Link to="/packages" className={navLinkClass('/packages')}>
                            Packages
                        </Link>
                        <Link to="/reviews" className={navLinkClass('/reviews')}>
                            Reviews
                        </Link>
                        <Link to="/contact" className={navLinkClass('/contact')}>
                            Contact
                        </Link>
                        <Link to="/equipment" className={navLinkClass('/equipment')}>
                            Equipment
                        </Link>
                    </div>

                    {/* Right side - Auth buttons or Profile */}
                    <div className="flex items-center space-x-4">
                        {!isAuthenticated ? (
                            /* 🔓 NOT LOGGED IN - Show Login/Signup Buttons */
                            <>
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="hidden sm:block text-white hover:text-gray-200 font-medium transition"
                                >
                                    Login
                                </button>
                                <button 
                                    onClick={() => navigate('/signup')}
                                    className="bg-white text-[#2B4C8F] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            
                            <>
                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileMenuRef}>
                                    <button 
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center space-x-2 bg-white rounded-full p-1 pr-3 hover:bg-gray-100 transition group"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                                            {user?.profilePicture ? (
                                                <img 
                                                    src={`${API_URL}/uploads/profile-pictures/${user.profilePicture}`} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                user?.username ? user.username.charAt(0).toUpperCase() : 'U'
                                            )}
                                        </div>
                                        <span className="hidden sm:block text-gray-700 text-sm font-medium">
                                            {user?.username || 'User'}
                                        </span>
                                        <svg className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 animate-fade-in">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-900">{user?.username || 'User'}</p>
                                                <p className="text-xs text-gray-600 truncate">{user?.email || 'user@example.com'}</p>
                                            </div>
                                            
                                            <Link 
                                                to="/profile" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                My Profile
                                            </Link>
                                            
                                            <Link 
                                                to="/bookings" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                My Bookings
                                            </Link>

                                            <Link 
                                                to="/my-reviews" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                My Reviews
                                            </Link>

                                            <Link 
                                                to="/my-equipment" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                                                </svg>
                                                My Equipment
                                            </Link>

                                            <Link 
                                                to="/wishlist" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                My Wishlist
                                            </Link>

                                            <Link 
                                                to="/my-messages" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                My Messages
                                            </Link>

                                            {user?.role === 'admin' && (
                                                <Link 
                                                    to="/admin/dashboard" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition border-t border-gray-100"
                                                    onClick={() => setShowProfileMenu(false)}
                                                >
                                                    <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            
                                            <button 
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
                                            >
                                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        
                        {/* Mobile menu button */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-white hover:text-gray-200 p-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-blue-600 animate-slide-down">
                        <div className="flex flex-col space-y-1">
                            <Link 
                                to="/" 
                                className={`text-white text-sm font-medium hover:bg-blue-700 px-4 py-3 rounded-lg transition ${isActive('/') ? 'bg-blue-700' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link 
                                to="/packages" 
                                className={`text-white text-sm font-medium hover:bg-blue-700 px-4 py-3 rounded-lg transition ${isActive('/packages') ? 'bg-blue-700' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Packages
                            </Link>
                            <Link 
                                to="/reviews" 
                                className={`text-white text-sm font-medium hover:bg-blue-700 px-4 py-3 rounded-lg transition ${isActive('/reviews') ? 'bg-blue-700' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Reviews
                            </Link>
                            <Link 
                                to="/contact" 
                                className={`text-white text-sm font-medium hover:bg-blue-700 px-4 py-3 rounded-lg transition ${isActive('/contact') ? 'bg-blue-700' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </Link>
                            <Link 
                                to="/equipment" 
                                className={`text-white text-sm font-medium hover:bg-blue-700 px-4 py-3 rounded-lg transition ${isActive('/equipment') ? 'bg-blue-700' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Equipment
                            </Link>
                            {isAuthenticated && (
                                <Link 
                                    to="/bookings" 
                                    className={`text-white text-sm font-medium hover:bg-blue-700 px-4 py-3 rounded-lg transition ${isActive('/bookings') ? 'bg-blue-700' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    My Bookings
                                </Link>
                            )}
                            {isAuthenticated && (
                                <Link 
                                    to="/my-messages" 
                                    className={`text-white text-sm font-medium hover:bg-blue-700 px-4 py-3 rounded-lg transition ${isActive('/my-messages') ? 'bg-blue-700' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    My Messages
                                </Link>
                            )}
                            
                            {!isAuthenticated && (
                                <>
                                    <Link 
                                        to="/login" 
                                        className="text-white text-sm font-medium hover:bg-blue-700 px-4 py-3 rounded-lg transition"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/signup" 
                                        className="bg-white text-[#2B4C8F] text-sm font-semibold px-4 py-3 rounded-lg transition text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                title="Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                cancelText="Cancel"
                type="warning"
            />
        </nav>
    );
}

export default Navbar;
