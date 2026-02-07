import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';

function ManageContactMessages() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [adminNotes, setAdminNotes] = useState('');
    const [adminReply, setAdminReply] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [savingNotes, setSavingNotes] = useState(false);
    const [sendingReply, setSendingReply] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = filter === 'all' 
                ? `${API_URL}/api/contact` 
                : `${API_URL}/api/contact?status=${filter}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                showError('Session expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                showError(errData.error || 'Failed to load messages');
                return;
            }

            const data = await response.json();
            setMessages(data.data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            showError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleViewMessage = async (message) => {
        setSelectedMessage(message);
        setAdminNotes(message.adminNotes || '');
        setAdminReply(message.adminReply || '');
        setShowModal(true);

        // Mark as read if unread
        if (message.status === 'unread') {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${API_URL}/api/contact/${message.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'read' })
                });
                fetchMessages();
            } catch (error) {
                console.error('Error updating message:', error);
            }
        }
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !adminReply.trim()) {
            showError('Please enter a reply message');
            return;
        }
        setSendingReply(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contact/${selectedMessage.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminReply, status: 'replied' })
            });

            if (response.ok) {
                showSuccess('Reply sent successfully! User can now see your response.');
                fetchMessages();
                setShowModal(false);
            } else {
                showError('Failed to send reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            showError('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    const handleUpdateStatus = async (messageId, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contact/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminNotes })
            });

            if (response.ok) {
                showSuccess(`Message marked as ${status}`);
                fetchMessages();
                setShowModal(false);
            } else {
                showError('Failed to update message');
            }
        } catch (error) {
            console.error('Error updating message:', error);
            showError('Failed to update message');
        }
    };

    const handleDelete = async (messageId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contact/${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showSuccess('Message deleted successfully');
                fetchMessages();
                setShowModal(false);
                setShowDeleteConfirm(null);
            } else {
                showError('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showError('Failed to delete message');
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedMessage) return;
        setSavingNotes(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contact/${selectedMessage.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminNotes })
            });

            if (response.ok) {
                showSuccess('Notes saved successfully');
                fetchMessages();
            } else {
                showError('Failed to save notes');
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            showError('Failed to save notes');
        } finally {
            setSavingNotes(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            unread: 'bg-red-100 text-red-800',
            read: 'bg-yellow-100 text-yellow-800',
            replied: 'bg-green-100 text-green-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <PageTransition>
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a365d] via-[#2B4C8F] to-[#1a365d] text-white p-4 sm:p-6 shadow-xl">
                <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="text-white hover:text-gray-200 bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                                Contact Messages
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </h1>
                            <p className="text-blue-200 text-xs sm:text-sm">Manage messages from the contact form</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/login';
                        }}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            <div className="container mx-auto p-6">

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-2">
                {['all', 'unread', 'read', 'replied'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filter === status
                                ? 'bg-[#2B4C8F] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Messages List */}
            {loading ? (
                <LoadingSpinner size="md" text="Loading messages..." />
            ) : messages.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-lg">No messages found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {messages.map((message) => (
                                    <tr 
                                        key={message.id} 
                                        className={`hover:bg-gray-50 cursor-pointer ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                                        onClick={() => handleViewMessage(message)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {message.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className={`text-sm font-medium text-gray-900 ${message.status === 'unread' ? 'font-bold' : ''}`}>
                                                        {message.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{message.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm text-gray-900 ${message.status === 'unread' ? 'font-bold' : ''}`}>
                                                {message.subject}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {message.message?.substring(0, 50)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(message.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                                                {message.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(message.id);
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Message Detail Modal */}
            {showModal && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedMessage.subject}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        From: {selectedMessage.name} ({selectedMessage.email})
                                    </p>
                                    {selectedMessage.phone && (
                                        <p className="text-sm text-gray-500">Phone: {selectedMessage.phone}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
                                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Admin Notes (Internal)</h3>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={2}
                                    placeholder="Add internal notes about this message..."
                                />
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={savingNotes}
                                    className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {savingNotes ? (
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                    )}
                                    Save Notes
                                </button>
                            </div>

                            {/* Reply Section */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Reply to User (User will see this)
                                </h3>
                                {selectedMessage.adminReply && selectedMessage.status === 'replied' ? (
                                    <div className="bg-white p-3 rounded-lg border border-blue-200 mb-3">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.adminReply}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Replied on: {selectedMessage.repliedAt ? new Date(selectedMessage.repliedAt).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                ) : null}
                                <textarea
                                    value={adminReply}
                                    onChange={(e) => setAdminReply(e.target.value)}
                                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Type your reply here. This will be visible to the user..."
                                />
                                <button
                                    onClick={handleSendReply}
                                    disabled={sendingReply || !adminReply.trim()}
                                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {sendingReply ? (
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                    Send Reply
                                </button>
                            </div>

                            {/* Delete Confirmation */}
                            {showDeleteConfirm === selectedMessage.id && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 font-medium mb-3">Are you sure you want to delete this message?</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(selectedMessage.id)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            Yes, Delete
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(null)}
                                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Mark as Replied
                                </button>
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Reply via Email
                                </a>
                                {selectedMessage.phone && (
                                    <a
                                        href={`tel:${selectedMessage.phone}`}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Call
                                    </a>
                                )}
                                {showDeleteConfirm !== selectedMessage.id && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(selectedMessage.id)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
                            Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
        </PageTransition>
    );
}

export default ManageContactMessages;
