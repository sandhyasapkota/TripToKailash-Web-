import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';

function ManageEquipmentPurchases() {
  const { showSuccess, showError } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/equipment-purchases`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.status === 401) {
        showError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => window.location.href = '/login', 1500);
        return;
      }
      const result = await response.json();
      setPurchases(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error('Fetch equipment purchases error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/equipment-purchases/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (response.ok) {
        setPurchases(purchases.map(p => (p.id === id ? { ...p, status } : p)));
        showSuccess('Status updated.');
      } else {
        showError(data.error || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Update status error:', err);
      showError('Unable to update status.');
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a365d] via-[#2B4C8F] to-[#1a365d] text-white p-4 sm:p-6 shadow-xl">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/admin/dashboard" className="text-white hover:text-gray-200 bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">Equipment Purchase Requests</h1>
              <p className="text-blue-200 text-xs sm:text-sm">Manage customer equipment purchase orders</p>
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
        {loading ? (
          <LoadingSpinner size="md" text="Loading purchases..." />
        ) : purchases.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
            No equipment purchase requests.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-6 py-4 text-sm">#{purchase.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>{purchase.userName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{purchase.userEmail || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{purchase.productName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">{purchase.quantity}</td>
                      <td className="px-6 py-4 text-sm">Nrs. {parseFloat(purchase.totalPrice || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={purchase.status}
                          onChange={(e) => handleStatusChange(purchase.id, e.target.value)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}

export default ManageEquipmentPurchases;
