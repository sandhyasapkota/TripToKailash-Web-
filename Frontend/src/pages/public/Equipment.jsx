import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import homepageImage from '../../Images/homepageimage.png';
import { useToast } from '../../contexts/ToastContext';
import { equipmentPurchaseSchema } from '../private/schema/privateSchema';
import PageTransition from '../../components/PageTransition';
import LoadingSpinner from '../../components/LoadingSpinner';

function Equipment() {
  const { showWarning, showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ quantity: 1, phone: '', address: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products?limit=100`);
      if (response.ok) {
        const result = await response.json();
        const items = (result.products || []).filter(
          (item) => (item.category || '').toLowerCase() === 'equipment'
        );
        setEquipment(items);
      } else {
        showError('Failed to load equipment');
      }
    } catch (err) {
      console.error('Equipment fetch error:', err);
      showError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (item) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      showWarning('Please login to buy equipment. You will be redirected to login.', 'Login Required');
      sessionStorage.setItem('redirectAfterLogin', '/equipment');
      navigate('/login');
      return;
    }
    setSelectedItem(item);
    setForm({ quantity: 1, phone: '', address: '', notes: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const payload = {
      productId: selectedItem.id,
      quantity: Number(form.quantity),
      phone: form.phone,
      address: form.address,
      notes: form.notes
    };

    const validation = equipmentPurchaseSchema.safeParse(payload);
    if (!validation.success) {
      const validationErrors = {};
      const fieldErrors = validation.error.flatten().fieldErrors;
      Object.keys(fieldErrors).forEach((key) => {
        if (fieldErrors[key] && fieldErrors[key].length > 0) {
          validationErrors[key] = fieldErrors[key][0];
        }
      });
      setFormErrors(validationErrors);
      showError('Please fix the highlighted fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/equipment-purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess('Purchase request submitted. We will call to confirm.', 'Request Sent');
        setShowModal(false);
      } else {
        showError(data.error || 'Failed to submit purchase request.');
      }
    } catch (err) {
      console.error('Purchase request error:', err);
      showError('Unable to connect to server. Please try again.');
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Equipment Shop</h1>
            <div className="text-sm text-gray-600 hidden sm:block">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-blue-600">Equipment</span>
            </div>
          </div>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Buy trekking essentials and travel equipment. Payment by cash after confirmation call.
          </p>
        </div>
      </div>

      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <LoadingSpinner size="lg" text="Loading equipment..." />
          ) : equipment.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              No equipment available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {equipment.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={
                        item.image_url
                          ? (item.image_url.startsWith('/uploads') ? `${API_URL}${item.image_url}` : item.image_url)
                          : homepageImage
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = homepageImage; }}
                    />
                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-md">
                      <span className="text-[#2B4C8F] font-bold">
                        Nrs. {parseFloat(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Stock: {item.stock_quantity || 0}</span>
                      <span className="px-3 py-1 bg-blue-100 text-[#2B4C8F] rounded-full">Equipment</span>
                    </div>
                    <button
                      onClick={() => handleBuy(item)}
                      className="w-full bg-[#2B4C8F] hover:bg-blue-800 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Purchase Request</h2>
            <p className="text-sm text-gray-600 mb-4">
              {selectedItem.name} — Nrs. {parseFloat(selectedItem.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.quantity ? 'border-red-400' : 'border-gray-300'}`}
                />
                {formErrors.quantity && <p className="text-xs text-red-500 mt-1">{formErrors.quantity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="98XXXXXXXX"
                />
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.address ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="City, Street, House No."
                />
                {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                ></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#2B4C8F] text-white py-2 rounded-lg font-semibold hover:bg-blue-800">
                  Submit
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
    </PageTransition>
  );
}

export default Equipment;
