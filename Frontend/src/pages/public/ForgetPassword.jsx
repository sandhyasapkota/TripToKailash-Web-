import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import homepageImage from '../../Images/homepageimage.png';
import { forgotPasswordSchema } from './schema/publicSchema';
import { useToast } from '../../contexts/ToastContext';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import PageTransition from '../../components/PageTransition';

function ForgetPassword() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldError, setFieldError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldError('');

        // Validate email with Zod using safeParse
        const result = forgotPasswordSchema.safeParse({ email });
        if (!result.success) {
            const validationError = result.error.flatten().fieldErrors.email?.[0] || 'Invalid email';
            setFieldError(validationError);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Password reset link has been sent to your email. Please check your inbox.', 'Email Sent');
                setEmail('');
            } else {
                showError(data.error || 'Failed to send reset link');
            }
        } catch (err) {
            showError('Network error. Please try again.');
            console.error('Forgot password error:', err);
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
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-[#2B4C8F] hover:text-blue-700 mb-6 group transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    <span className="text-sm font-semibold">Back</span>
                </button>

                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h2 className="text-[#2B4C8F] text-2xl font-bold mb-2 hover:text-blue-700 transition">TripToKailash</h2>
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

                <div className="text-center mb-6">
                    <h1 className="text-[#2B4C8F] text-3xl font-bold mb-2">Forgot Password?</h1>
                    <p className="text-gray-600 text-sm">
                        Enter your email address and we'll send you a link to reset your password
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setFieldError('');
                            }}
                            required
                            className={`w-full px-4 py-3 border rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldError ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {fieldError && (
                            <p className="text-red-500 text-sm mt-1">{fieldError}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#2B4C8F] text-white font-semibold rounded-lg hover:bg-blue-800 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </span>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Remember your password?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link 
                            to="/login" 
                            className="inline-block w-full py-3 px-4 border-2 border-[#2B4C8F] text-[#2B4C8F] font-semibold rounded-lg hover:bg-blue-50 transition transform hover:scale-[1.02]"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
            </div>
            <Footer />
        </div>
        </PageTransition>
    );
}

export default ForgetPassword;