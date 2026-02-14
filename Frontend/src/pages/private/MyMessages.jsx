import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../contexts/ToastContext';
import PageTransition from '../../components/PageTransition';
import LoadingSpinner from '../../components/LoadingSpinner';

function MyMessages() {
    const { showError } = useToast();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchMyMessages = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/contact/my-messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.data || []);
            } else {
                const errData = await response.json().catch(() => ({}));
                showError(errData.error || 'Failed to load messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            showError('Unable to connect to server');
        } finally {
            setLoading(false);
        }
    }, [API_URL, showError]);

    useEffect(() => {
        fetchMyMessages();
    }, [fetchMyMessages]);
    const getStatusBadge = (status) => {
        switch (status) {
            case 'replied':
                return 'bg-green-100 text-green-800';
            case 'read':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <PageTransition>
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-[#2B4C8F] to-blue-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h1 className="text-3xl font-bold mb-2">My Messages</h1>
                    <p className="text-blue-100">View your contact messages and admin replies</p>
                </div>
            </div>

            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
                {loading ? (
                    <LoadingSpinner size="md" text="Loading messages..." />
                ) : messages.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow">
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-500 text-lg mb-4">You haven't sent any contact messages yet</p>
                        <Link 
                            to="/contact" 
                            className="inline-block bg-[#2B4C8F] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Contact Us
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div 
                                key={message.id} 
                                className={`bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg cursor-pointer ${
                                    message.status === 'replied' ? 'border-l-4 border-green-500' : ''
                                }`}
                                onClick={() => setSelectedMessage(selectedMessage?.id === message.id ? null : message)}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{message.subject}</h3>
                                            <p className="text-sm text-gray-500">
                                                Sent on: {new Date(message.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                                            {message.status === 'replied' ? '✓ Replied' : message.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{message.message}</p>

                                    {selectedMessage?.id === message.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Message:</h4>
                                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{message.message}</p>
                                            </div>

                                            {message.adminReply ? (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <h4 className="text-sm font-semibold text-green-800">Admin Reply</h4>
                                                    </div>
                                                    <p className="text-green-900 whitespace-pre-wrap">{message.adminReply}</p>
                                                    {message.repliedAt && (
                                                        <p className="text-xs text-green-600 mt-2">
                                                            Replied on: {new Date(message.repliedAt).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p className="text-yellow-800 text-sm">Awaiting reply from our team. We'll get back to you soon!</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center text-sm text-[#2B4C8F]">
                                        <span>{selectedMessage?.id === message.id ? 'Click to collapse' : 'Click to view details'}</span>
                                        <svg 
                                            className={`w-4 h-4 ml-1 transition-transform ${selectedMessage?.id === message.id ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
        </PageTransition>
    );
}

export default MyMessages;
