import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import homepageImage from '../../Images/homepageimage.png';
import { useToast } from '../../contexts/ToastContext';
import { resetPasswordSchema } from './schema/publicSchema';
import PageTransition from '../../components/PageTransition';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { showSuccess, showError } = useToast();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const result = resetPasswordSchema.safeParse(formData);
        if (result.success) {
            setErrors({});
            return true;
        }
        
        const validationErrors = {};
        const fieldErrors = result.error.flatten().fieldErrors;
        Object.keys(fieldErrors).forEach((key) => {
            if (fieldErrors[key]?.[0]) {
                validationErrors[key] = fieldErrors[key][0];
            }
        });
        setErrors(validationErrors);
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/users/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Your password has been reset successfully! Please login with your new password.', 'Password Reset');
                navigate('/login');
            } else {
                showError(data.error || 'Failed to reset password');
            }
        } catch (err) {
            showError('Network error. Please try again.');
            console.error('Reset password error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h1>
                    <Link to="/forgot-password" className="text-blue-600 hover:underline">
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="w-full max-w-md mx-4">
                <div className="text-center mb-8">
                    <h2 className="text-[#2B4C8F] text-xl font-semibold mb-6">TripToKailash</h2>
                    <div className="mb-6">
                        <img 
                            src={homepageImage} 
                            alt="Mountain" 
                            className="w-full h-32 object-cover rounded-t-lg opacity-80"
                        />
                    </div>
                    <h1 className="text-[#2B4C8F] text-3xl font-bold">Reset Password</h1>
                    <p className="text-gray-600 text-sm mt-2">
                        Enter your new password below
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-5">
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter new password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#2B4C8F] text-white font-semibold rounded-md hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
        </PageTransition>
    );
}

export default ResetPassword;