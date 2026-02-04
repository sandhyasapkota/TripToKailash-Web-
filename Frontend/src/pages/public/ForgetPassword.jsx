import { useState } from 'react';
import { Link } from 'react-router-dom';
import homepageImage from '../../Images/homepageimage.png';
import { forgotPasswordSchema } from './schema/publicSchema';

function ForgetPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [fieldError, setFieldError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setFieldError('');

        // Validate email with Zod using safeParse
        const result = forgotPasswordSchema.safeParse({ email });
        if (!result.success) {
            const fieldError = result.error.flatten().fieldErrors.email?.[0] || 'Invalid email';
            setFieldError(fieldError);
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
                setMessage('Password reset link has been sent to your email. Please check your inbox.');
                setEmail('');
            } else {
                setError(data.error || 'Failed to send reset link');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Forgot password error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
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
                    <h1 className="text-[#2B4C8F] text-3xl font-bold">Forgot Password?</h1>
                    <p className="text-gray-600 text-sm mt-2">
                        Enter your email address and we'll send you a link to reset your password
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-5">
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

                    {message && (
                        <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm text-center">
                            {message}
                        </div>
                    )}

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
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-[#2B4C8F] hover:underline text-sm font-medium">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgetPassword;