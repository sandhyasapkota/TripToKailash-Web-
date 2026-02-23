import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import homepageImage from '../../Images/homepageimage.png';
import { loginSchema } from './schema/publicSchema';
import { useToast } from '../../contexts/ToastContext';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import PageTransition from '../../components/PageTransition';

function Login() {
    const navigate = useNavigate();
    const { showSuccess, showError, showWarning } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [fieldTouched, setFieldTouched] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setFieldTouched(prev => ({ ...prev, [name]: true }));
        validateField(name);
    };

    const validateField = (fieldName) => {
        try {
            const fieldSchemas = {
                email: loginSchema.pick({ email: true }),
                password: loginSchema.pick({ password: true })
            };

            const schema = fieldSchemas[fieldName];
            if (!schema) return;

            const result = schema.safeParse({ [fieldName]: formData[fieldName] });
            
            if (result.success) {
                setErrors(prev => ({ ...prev, [fieldName]: '' }));
            } else {
                const fieldError = result.error.flatten().fieldErrors[fieldName];
                if (fieldError?.[0]) {
                    setErrors(prev => ({ ...prev, [fieldName]: fieldError[0] }));
                }
            }
        } catch (err) {
            console.error('Field validation error:', err);
        }
    };

    const validateForm = () => {
        const result = loginSchema.safeParse(formData);
        if (result.success) {
            setErrors({});
            return true;
        }

        const validationErrors = {};
        const fieldErrors = result.error.flatten().fieldErrors;
        Object.keys(fieldErrors).forEach((key) => {
            if (fieldErrors[key]?.length > 0) {
                validationErrors[key] = fieldErrors[key][0];
            }
        });

        setErrors(validationErrors);
        return false;
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verificationEmail })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Verification email sent! Please check your inbox.', 'Email Sent');
            } else {
                showError(data.error || 'Failed to send verification email');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            showError('Unable to connect to server. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            showError('Please fix the errors in the form');
            return;
        }
        
        setLoading(true);
        setNeedsVerification(false);

        try {
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    rememberMe
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Check for redirect
                const redirectTo = sessionStorage.getItem('redirectAfterLogin');
                if (redirectTo) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    navigate(redirectTo, { replace: true });
                } else {
                    if (data.user.role === 'admin') {
                        navigate('/admin/dashboard', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                }
            } else if (response.status === 403 && data.needsVerification) {
                // Email not verified
                setNeedsVerification(true);
                setVerificationEmail(data.email || formData.email);
                showWarning('Please verify your email before logging in.', 'Verification Required');
            } else {
                showError(data.error || data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Unable to connect to server. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <Navbar />
            <div className="flex-grow flex justify-center items-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h2 className="text-[#2B4C8F] text-2xl font-bold mb-2 hover:text-blue-700 transition">
                            TripToKailash
                        </h2>
                    </Link>
                    <p className="text-gray-600 text-sm">Your spiritual journey begins here</p>
                </div>

                {/* Mountain Image */}
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                    <img 
                        src={homepageImage} 
                        alt="Mount Kailash" 
                        className="w-full h-40 object-cover"
                    />
                </div>
                
                {/* Welcome Message */}
                <div className="text-center mb-6">
                    <h1 className="text-[#2B4C8F] text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-gray-600 text-sm">Sign in to continue your journey</p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={loading}
                            autoComplete="email"
                            className={`w-full px-4 py-3 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        {errors.email && (
                            <div className="flex items-center mt-1 text-red-500 text-sm">
                                <span className="mr-1">⚠️</span>
                                {errors.email}
                            </div>
                        )}
                        {!errors.email && fieldTouched.email && formData.email && (
                            <p className="text-green-500 text-sm mt-1">✓ Valid</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={loading}
                                autoComplete="current-password"
                                className={`w-full px-4 py-3 pr-12 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 focus:outline-none"
                                tabIndex="-1"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="flex items-center mt-1 text-red-500 text-sm">
                                <span className="mr-1">⚠️</span>
                                {errors.password}
                            </div>
                        )}
                        {!errors.password && fieldTouched.password && formData.password && (
                            <p className="text-green-500 text-sm mt-1">✓ Valid</p>
                        )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                            className="h-4 w-4 text-[#2B4C8F] focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                            Remember me on this device
                        </label>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link 
                            to="/forgot-password" 
                            className="text-[#2B4C8F] hover:text-blue-700 text-sm font-semibold hover:underline transition"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Email Verification Required */}
                    {needsVerification && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
                            <p className="text-yellow-700 text-sm font-semibold mb-2">📧 Email Verification Required</p>
                            <p className="text-yellow-600 text-sm mb-3">
                                Please verify your email address before logging in. Check your inbox for the verification link.
                            </p>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resendLoading}
                                className="text-sm text-[#2B4C8F] hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendLoading ? 'Sending...' : '🔄 Resend Verification Email'}
                            </button>
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#2B4C8F] text-white font-semibold rounded-lg hover:bg-blue-800 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl mt-6"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">New to TripToKailash?</span>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                        <Link 
                            to="/signup" 
                            className="inline-block w-full py-3 px-4 border-2 border-[#2B4C8F] text-[#2B4C8F] font-semibold rounded-lg hover:bg-blue-50 transition transform hover:scale-[1.02] disabled:scale-100"
                        >
                            Create New Account
                        </Link>
                    </div>
                </form>

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        By signing in, you agree to our{' '}
                        <Link to="/terms" className="text-[#2B4C8F] hover:underline">Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-[#2B4C8F] hover:underline">Privacy</Link>
                    </p>
                </div>
            </div>
            </div>
            <Footer />
        </div>
        </PageTransition>
    );
}

export default Login;