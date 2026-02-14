import { useEffect, useState } from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../contexts/ToastContext';
import PageTransition from '../../components/PageTransition';
import LoadingSpinner from '../../components/LoadingSpinner';

function MyEquipmentPurchases() {
  const { showError } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/equipment-purchases/user`, {
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
      console.error('Fetch purchases error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-800">My Equipment Purchases</h1>
          <p className="text-sm text-gray-600 mt-1">Payment confirmed via phone call.</p>
        </div>
      </div>

      <div className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <LoadingSpinner size="md" text="Loading purchases..." />
          ) : purchases.length === 0 ? (
            <div className="text-center py-16 text-gray-600">No equipment purchases found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-800">{purchase.productName}</h3>
                  <p className="text-sm text-gray-600">Qty: {purchase.quantity}</p>
                  <p className="text-sm text-gray-600">Total: Nrs. {parseFloat(purchase.totalPrice || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-2">Status: <span className="font-semibold">{purchase.status}</span></p>
                  <p className="text-xs text-gray-500 mt-1">Requested: {new Date(purchase.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
    </PageTransition>
  );
}

export default MyEquipmentPurchases;
