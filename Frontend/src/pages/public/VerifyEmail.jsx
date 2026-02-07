import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
    const [message, setMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            verifyEmail();
        } else {
            setStatus('error');
            setMessage('Verification token is missing. Please check your email link.');
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/verify-email?token=${encodeURIComponent(token)}`);

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Your email has been verified successfully!');
                showSuccess('Email verified! You can now log in to your account.', 'Verification Successful');
            } else {
                // Check if user might have already verified
                if (data.alreadyVerified) {
                    setStatus('success');
                    setMessage('Your email has already been verified. You can login now.');
                    showSuccess('Email already verified! You can log in.', 'Already Verified');
                } else if (data.error?.includes('expired')) {
                    setStatus('expired');
                    setMessage(data.error || 'Verification link has expired.');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('error');
            setMessage('Unable to connect to server. Please try again later.');
        }
    };

    const handleResendVerification = async () => {
        if (!resendEmail) {
            showError('Please enter your email address');
            return;
        }

        setResendLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resendEmail })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Verification email sent! Please check your inbox.', 'Email Sent');
                setResendEmail('');
            } else {
                showError(data.error || 'Failed to send verification email');
            }
        } catch (error) {
            showError('Unable to connect to server. Please try again.');
            
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h2 className="text-[#2B4C8F] text-2xl font-bold mb-2 hover:text-blue-700 transition">
                            TripToKailash
                        </h2>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                    {/* Verifying State */}
                    {status === 'verifying' && (
                        <div>
                            <LoadingSpinner size="lg" text="" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Your Email</h2>
                            <p className="text-gray-600">Please wait while we verify your email address...</p>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <div>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified! 🎉</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <Link
                                to="/login"
                                className="inline-block w-full py-3 px-6 bg-[#2B4C8F] text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                            >
                                Continue to Login
                            </Link>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <Link
                                to="/login"
                                className="inline-block w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {/* Expired State */}
                    {status === 'expired' && (
                        <div>
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Link Expired</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">Enter your email to receive a new verification link:</p>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={resendEmail}
                                    onChange={(e) => setResendEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resendLoading}
                                    className="w-full py-3 px-6 bg-[#2B4C8F] text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-gray-600 hover:text-[#2B4C8F] text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
