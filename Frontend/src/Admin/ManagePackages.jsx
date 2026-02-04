import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useToast } from '../contexts/ToastContext';
import { packageSchema } from './schema/adminSchema';
import PageTransition from '../components/PageTransition';
import SkeletonLoader from '../components/SkeletonLoader';
import ConfirmModal from '../components/ConfirmModal';

function ManagePackages() {
  const { showSuccess, showError } = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPackage, setEditingPackage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'Adventure',
    stock_quantity: '',
    image_url: ''
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [newPackageForm, setNewPackageForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '10 days',
    category: 'Adventure',
    stock_quantity: '',
    image_url: ''
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Adventure', 'Kailash Yatra', 'Domestic', 'International'];
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/products?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched packages:', result); // Debug log
        // Backend returns { message, products: [...] }
        // Filter out equipment from packages
        const packagesOnly = (result.products || []).filter(pkg => 
          (pkg.category || '').toLowerCase() !== 'equipment'
        );
        setPackages(packagesOnly);
      } else {
        setError('Failed to load packages');
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleDelete = async (packageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/${packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPackages(packages.filter(pkg => pkg.id !== packageId));
        showSuccess('Package has been deleted successfully.', 'Package Deleted');
        setDeleteConfirm(null);
      } else {
        showError('Failed to delete the package. Please try again.', 'Delete Failed');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      showError('Failed to delete the package. Please check your connection and try again.', 'Connection Error');
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg.id);
    setEditForm({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration || '10 days',
      category: pkg.category || 'Adventure',
      stock_quantity: pkg.stock_quantity,
      image_url: pkg.image_url || ''
    });
    setEditImageFile(null);
    setShowEditModal(true);
  };

  const uploadImage = async (file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_URL}/api/products/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (!response.ok) {
      throw new Error(data?.error || data?.message || response.statusText || 'Image upload failed');
    }
    return data.image_url;
  };

  const getErrorMessage = async (response, fallback) => {
    try {
      const data = await response.json();
      return data?.error || data?.message || fallback;
    } catch {
      return response.statusText || fallback;
    }
  };

  const handleUpdate = async (packageId) => {
    try {
      const validation = packageSchema.safeParse(editForm);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0];
        showError(firstIssue?.message || 'Invalid data');
        return;
      }
      let imageUrl = editForm.image_url;
      if (editImageFile) {
        imageUrl = await uploadImage(editImageFile);
      }
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...editForm, image_url: imageUrl })
      });

      if (response.ok) {
        const result = await response.json();
        const updatedProduct = result.product || result;
        setPackages(packages.map(pkg => pkg.id === packageId ? updatedProduct : pkg));
        setEditingPackage(null);
        setShowEditModal(false);
        showSuccess('Package has been updated successfully.', 'Package Updated');
      } else {
        showError('Failed to update the package. Please try again.', 'Update Failed');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      showError(error.message || 'Failed to update the package. Please check your connection and try again.', 'Connection Error');
    }
  };

  const handleCancel = () => {
    setEditingPackage(null);
    setShowEditModal(false);
    setEditForm({ name: '', description: '', price: '', duration: '', category: 'Adventure', stock_quantity: '', image_url: '' });
    setEditImageFile(null);
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      const validation = packageSchema.safeParse(newPackageForm);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0];
        showError(firstIssue?.message || 'Invalid data');
        return;
      }
      let imageUrl = newPackageForm.image_url;
      if (newImageFile) {
        imageUrl = await uploadImage(newImageFile);
      }
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newPackageForm, image_url: imageUrl })
      });

      if (response.ok) {
        await fetchPackages(); // Refresh the list
        setShowAddModal(false);
        setNewPackageForm({ name: '', description: '', price: '', duration: '10 days', category: 'Adventure', stock_quantity: '', image_url: '' });
        setNewImageFile(null);
        showSuccess('New package has been added successfully.', 'Package Added');
      } else {
        const errorMessage = await getErrorMessage(response, 'Failed to add the package. Please try again.');
        showError(errorMessage, 'Add Failed');
      }
    } catch (error) {
      console.error('Error adding package:', error);
      showError(error.message || 'Failed to add the package. Please check your connection and try again.', 'Connection Error');
    }
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-100 p-6">
          <SkeletonLoader count={10} type="table" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a365d] via-[#2B4C8F] to-[#1a365d] text-white p-6 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-white hover:text-gray-200 bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Manage Packages</h1>
              <p className="text-blue-200 text-sm">Create, edit and organize tour packages</p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
      <div className="container mx-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats and Actions Bar */}
        <motion.div 
          className="bg-white rounded-lg shadow p-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <motion.div 
              className="flex gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: 'Total Packages', value: packages.length, color: 'text-[#2B4C8F]' },
                { label: 'Total Stock', value: packages.reduce((sum, pkg) => sum + (parseInt(pkg.stock_quantity) || 0), 0), color: 'text-green-600' },
                { label: 'Avg Price', value: `Nrs. ${packages.length > 0 ? (packages.reduce((sum, pkg) => sum + parseFloat(pkg.price || 0), 0) / packages.length).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}`, color: 'text-purple-600' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.3 }
                    }
                  }}
                >
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="bg-[#2B4C8F] text-white px-6 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Package
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="Search packages by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
          />
        </div>

        {/* Packages Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredPackages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium">No packages found</p>
              <p className="text-sm mt-2">Click "Add Package" to create your first package</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackages.map((pkg, index) => (
                  <motion.tr 
                    key={pkg.id} 
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pkg.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pkg.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {pkg.category || 'Adventure'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pkg.duration || '10 days'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nrs. {parseFloat(pkg.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pkg.stock_quantity > 10 ? 'bg-green-100 text-green-800' : 
                        pkg.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {pkg.stock_quantity || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pkg.image_url ? (
                        <img 
                          src={pkg.image_url.startsWith('/uploads') ? `${API_URL}${pkg.image_url}` : pkg.image_url} 
                          alt={pkg.name}
                          className="h-10 w-10 object-cover rounded"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(pkg.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#2B4C8F]">Add New Package</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddPackage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={newPackageForm.name}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                  placeholder="Enter package name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={newPackageForm.description}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={newPackageForm.category}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={newPackageForm.duration}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                    placeholder="e.g. 10 days"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={newPackageForm.price}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newPackageForm.stock_quantity}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newPackageForm.image_url}
                  onChange={(e) => {
                    setNewPackageForm({ ...newPackageForm, image_url: e.target.value });
                    if (e.target.value) {
                      setNewImageFile(null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewImageFile(file);
                    if (file) {
                      setNewPackageForm({ ...newPackageForm, image_url: '' });
                    }
                  }}
                  className="w-full text-sm"
                />
                {newImageFile && (
                  <img
                    src={URL.createObjectURL(newImageFile)}
                    alt="Preview"
                    className="mt-2 h-24 object-contain rounded border"
                  />
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Package
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-[#2B4C8F]">Edit Package</h2>
                <p className="text-sm text-gray-500">Update package details below</p>
              </div>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F] focus:border-transparent"
                  placeholder="Enter package name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F] focus:border-transparent"
                  placeholder="Enter package description"
                  rows="4"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F] focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F] focus:border-transparent"
                    placeholder="e.g. 10 days"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Nrs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={editForm.stock_quantity}
                    onChange={(e) => setEditForm({ ...editForm, stock_quantity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editForm.image_url}
                  onChange={(e) => {
                    setEditForm({ ...editForm, image_url: e.target.value });
                    if (e.target.value) setEditImageFile(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4C8F] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditImageFile(file);
                    if (file) setEditForm({ ...editForm, image_url: '' });
                  }}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2"
                />
                {editImageFile && (
                  <img
                    src={URL.createObjectURL(editImageFile)}
                    alt="Preview"
                    className="mt-2 h-32 object-contain rounded border"
                  />
                )}
                {editForm.image_url && !editImageFile && (
                  <img
                    src={editForm.image_url.startsWith('/uploads') ? `${API_URL}${editForm.image_url}` : editForm.image_url}
                    alt="Current"
                    className="mt-2 h-32 object-contain rounded border"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleUpdate(editingPackage)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
    </PageTransition>
  );
}

export default ManagePackages;
