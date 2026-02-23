import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import homepageImage from '../../Images/homepageimage.png';
import { registerSchema } from './schema/publicSchema';
import { useToast } from '../../contexts/ToastContext';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import PageTransition from '../../components/PageTransition';

function Signup() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [_fieldTouched, setFieldTouched] = useState({});

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
        
        // Validate individual field
        validateField(name);
    };

    const validateField = (fieldName) => {
        try {
            // Create a schema for just this field
            const fieldSchemas = {
                fullName: registerSchema.pick({ fullName: true }),
                email: registerSchema.pick({ email: true }),
                phone: registerSchema.pick({ phone: true }),
                password: registerSchema.pick({ password: true }),
                confirmPassword: registerSchema.pick({ confirmPassword: true })
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
        const result = registerSchema.safeParse(formData);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            showError('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim(),
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Account created! Please check your email to verify your account before logging in.', 'Registration Successful');
                setTimeout(() => {
                    navigate('/login', { state: { message: 'Please check your email to verify your account.' } });
                }, 2500);
            } else {
                showError(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup error:', err);
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
                    <p className="text-gray-600 text-sm">Begin your spiritual journey</p>
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
                    <h1 className="text-[#2B4C8F] text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-600 text-sm">Join us for an unforgettable journey</p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-4 border border-gray-100">
                    {/* Full Name Input */}
                    <div>
                        <label htmlFor="fullName" className="block text-gray-700 text-sm font-semibold mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={loading}
                            maxLength={50}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        {errors.fullName && (
                            <div className="flex items-center mt-1 text-red-500 text-sm">
                                <span className="mr-1">⚠️</span>
                                {errors.fullName}
                            </div>
                        )}
                    </div>

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
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="+1234567890"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={loading}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        {errors.phone && (
                            <div className="flex items-center mt-1 text-red-500 text-sm">
                                <span className="mr-1">⚠️</span>
                                {errors.phone}
                            </div>
                        )}
                        <p className="text-gray-500 text-xs mt-1">10-digit or with country code format</p>
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
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={loading}
                                maxLength={50}
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
                        
                        {/* Password Strength Indicators */}
                        {formData.password && (
                            <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Password Requirements:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                                        {formData.password.length >= 8 ? (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                                        {/[A-Z]/.test(formData.password) ? (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Uppercase letter</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                                        {/[a-z]/.test(formData.password) ? (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Lowercase letter</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                                        {/[0-9]/.test(formData.password) ? (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Number</span>
                                    </div>
                                    <div className={`flex items-center gap-1 col-span-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                                        {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>Special character (!@#$%^&*...)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {errors.password && !formData.password && (
                            <div className="flex items-start mt-1 text-red-500 text-sm">
                                <span className="mr-1 mt-0.5">⚠️</span>
                                <div>{errors.password}</div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={loading}
                            maxLength={50}
                            className={`w-full px-4 py-3 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        {errors.confirmPassword && (
                            <div className="flex items-center mt-1 text-red-500 text-sm">
                                <span className="mr-1">⚠️</span>
                                {errors.confirmPassword}
                            </div>
                        )}
                    </div>

                    {/* Sign Up Button */}
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
                                Creating Account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <Link 
                            to="/login" 
                            className="inline-block w-full py-3 px-4 border-2 border-[#2B4C8F] text-[#2B4C8F] font-semibold rounded-lg hover:bg-blue-50 transition transform hover:scale-[1.02] disabled:scale-100"
                        >
                            Sign In
                        </Link>
                    </div>
                </form>

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        By signing up, you agree to our{' '}
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
};

export default Signup;
