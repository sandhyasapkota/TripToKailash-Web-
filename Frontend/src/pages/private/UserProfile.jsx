import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import { userProfileSchema } from './schema/privateSchema';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import PageTransition from '../../components/PageTransition';

function UserProfile() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
        phone: '',
        username: '',
        role: 'user',
        profilePicture: ''
    });

    const [editData, setEditData] = useState({
        fullName: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        // Get user data from localStorage
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
        } else {
            const parsedUser = JSON.parse(user);
            setUserData({
                fullName: parsedUser.username || '',
                email: parsedUser.email || '',
                phone: parsedUser.phone || '',
                username: parsedUser.username || '',
                role: parsedUser.role || 'user',
                profilePicture: parsedUser.profilePicture || ''
            });
            setEditData({
                fullName: parsedUser.username || '',
                email: parsedUser.email || '',
                phone: parsedUser.phone || ''
            });
        }
    }, [navigate]);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setErrors({});
        if (!isEditing) {
            setEditData({
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData({
            ...editData,
            [name]: value
        });
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        // Validate form data using safeParse
        const result = userProfileSchema.safeParse(editData);
        if (!result.success) {
            const validationErrors = {};
            const fieldErrors = result.error.flatten().fieldErrors;
            Object.keys(fieldErrors).forEach((key) => {
                if (fieldErrors[key]?.[0]) {
                    validationErrors[key] = fieldErrors[key][0];
                }
            });
            setErrors(validationErrors);
            setLoading(false);
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: editData.fullName.trim(),
                    email: editData.email.trim().toLowerCase(),
                    phone: editData.phone.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update localStorage
                const updatedUser = {
                    ...user,
                    username: editData.fullName,
                    email: editData.email,
                    phone: editData.phone
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Update state
                setUserData({
                    ...userData,
                    fullName: editData.fullName,
                    email: editData.email,
                    phone: editData.phone,
                    username: editData.fullName
                });

                showSuccess('Profile updated successfully!');
                setIsEditing(false);
            } else {
                showError(data.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Save profile error:', err);
            showError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setErrors({});
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');

            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await fetch(`${API_URL}/api/users/${user.id}/profile-picture`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Update localStorage
                const updatedUser = {
                    ...user,
                    profilePicture: data.data.profilePicture
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Update state
                setUserData({
                    ...userData,
                    profilePicture: data.data.profilePicture
                });

                showSuccess('Profile picture uploaded successfully!');
            } else {
                showError(data.error || 'Failed to upload profile picture');
            }
        } catch (err) {
            showError('Network error. Please try again.');
            console.error('Upload profile picture error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account information</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
                            <div className="flex flex-col sm:flex-row items-center">
                                <div className="relative">
                                    {userData.profilePicture ? (
                                        <img 
                                            src={`${API_URL}/uploads/profile-pictures/${userData.profilePicture}`} 
                                            alt="Profile" 
                                            className="w-24 h-24 rounded-full object-cover border-4 border-white"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold">
                                            {userData.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleProfilePictureUpload} 
                                            className="hidden" 
                                            disabled={loading}
                                        />
                                    </label>
                                </div>
                                <div className="mt-4 sm:mt-0 sm:ml-6 text-white text-center sm:text-left">
                                    <h2 className="text-2xl font-bold">{userData.fullName}</h2>
                                    <p className="text-blue-100">{userData.email}</p>
                                    <span className="inline-block mt-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-6">
                            {/* Action Buttons */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                                <div className="flex space-x-3">
                                    {!isEditing ? (
                                        <button
                                            onClick={handleEditToggle}
                                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span>Edit Profile</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                disabled={loading}
                                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{loading ? 'Saving...' : 'Save'}</span>
                                            </button>
                                            <button
                                                onClick={handleEditToggle}
                                                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span>Cancel</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Profile Form */}
                            <form onSubmit={handleSave} className="space-y-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={editData.fullName}
                                                onChange={handleChange}
                                                required
                                                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.fullName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                            {userData.fullName}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editData.email}
                                                onChange={handleChange}
                                                required
                                                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                            {userData.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editData.phone}
                                                onChange={handleChange}
                                                required
                                                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                            {userData.phone || 'Not provided'}
                                        </p>
                                    )}
                                </div>

                                {/* Username (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500">
                                        {userData.username}
                                    </p>
                                </div>

                                {/* Account Type (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Type
                                    </label>
                                    <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 capitalize">
                                        {userData.role}
                                    </p>
                                </div>
                            </form>

                            {/* Messages */}
                            {errors.general && (
                                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                                    <p className="text-red-700 text-sm">{errors.general}</p>
                                </div>
                            )}

                            {/* Account Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/bookings')}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition"
                                    >
                                        <span className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            My Bookings
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => navigate('/reviews')}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition"
                                    >
                                        <span className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                            My Reviews
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

            <Footer />
        </div>
        </PageTransition>
    );
}

export default UserProfile;