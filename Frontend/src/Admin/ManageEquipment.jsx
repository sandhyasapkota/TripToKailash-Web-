import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { packageSchema } from './schema/adminSchema';
import ConfirmModal from '../components/ConfirmModal';

function ManageEquipment() {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: 'Gear',
    category: 'Equipment',
    stock_quantity: '',
    image_url: ''
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: 'Gear',
    category: 'Equipment',
    stock_quantity: '',
    image_url: ''
  });
  const [newImageFile, setNewImageFile] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products?limit=200`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const equipmentOnly = (data.products || []).filter(
          (p) => (p.category || '').toLowerCase() === 'equipment'
        );
        setItems(equipmentOnly);
      } else {
        setError('Failed to load equipment');
      }
    } catch (err) {
      console.error('Fetch equipment error:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_URL}/api/products/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Image upload failed');
    }
    return data.image_url;
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      duration: item.duration || 'Gear',
      category: 'Equipment',
      stock_quantity: item.stock_quantity || 0,
      image_url: item.image_url || ''
    });
    setEditImageFile(null);
  };

  const handleUpdate = async (id) => {
    const validation = packageSchema.safeParse(editForm);
    if (!validation.success) {
      showError(validation.error.errors[0]?.message || 'Invalid data');
      return;
    }
    try {
      let imageUrl = editForm.image_url;
      if (editImageFile) {
        imageUrl = await uploadImage(editImageFile);
      }
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...editForm, image_url: imageUrl })
      });
      if (response.ok) {
        await fetchItems();
        setEditingId(null);
        showSuccess('Equipment updated.');
      } else {
        showError('Failed to update equipment.');
      }
    } catch (err) {
      console.error('Update equipment error:', err);
      showError('Unable to update equipment.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const validation = packageSchema.safeParse(newForm);
    if (!validation.success) {
      showError(validation.error.errors[0]?.message || 'Invalid data');
      return;
    }
    try {
      let imageUrl = newForm.image_url;
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
        body: JSON.stringify({ ...newForm, image_url: imageUrl })
      });
      if (response.ok) {
        await fetchItems();
        setShowAddModal(false);
        setNewForm({
          name: '',
          description: '',
          price: '',
          duration: 'Gear',
          category: 'Equipment',
          stock_quantity: '',
          image_url: ''
        });
        setNewImageFile(null);
        showSuccess('Equipment added.');
      } else {
        showError('Failed to add equipment.');
      }
    } catch (err) {
      console.error('Add equipment error:', err);
      showError('Unable to add equipment.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setItems(items.filter((p) => p.id !== id));
        showSuccess('Equipment deleted.');
        setDeleteConfirm(null);
      } else {
        showError('Failed to delete equipment.');
      }
    } catch (err) {
      console.error('Delete equipment error:', err);
      showError('Unable to delete equipment.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-[#1a365d] via-[#2B4C8F] to-[#1a365d] text-white p-6 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-white hover:text-gray-200 bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Manage Equipment</h1>
              <p className="text-blue-200 text-sm">Add, edit and manage equipment inventory</p>
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
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Equipment</p>
            <p className="text-2xl font-bold text-[#2B4C8F]">{items.length}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#2B4C8F] text-white px-6 py-2 rounded-lg hover:bg-blue-800"
          >
            Add Equipment
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2B4C8F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading equipment...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
            No equipment found.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                        <td className="px-6 py-4">
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            className="border rounded px-2 py-1 w-24"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.stock_quantity}
                            onChange={(e) => setEditForm({ ...editForm, stock_quantity: e.target.value })}
                            className="border rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <input
                              value={editForm.image_url}
                              onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                              className="border rounded px-2 py-1 w-full"
                              placeholder="Image URL"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                              className="text-xs"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 space-x-2 text-sm">
                          <button onClick={() => handleUpdate(item.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors">Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                        <td className="px-6 py-4 font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-sm">Nrs. {parseFloat(item.price || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">{item.stock_quantity || 0}</td>
                        <td className="px-6 py-4 text-xs">{item.image_url ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button onClick={() => handleEdit(item)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors">Edit</button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#2B4C8F] mb-4">Add Equipment</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                placeholder="Name"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                rows="3"
                placeholder="Description"
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              ></textarea>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price"
                  value={newForm.price}
                  onChange={(e) => setNewForm({ ...newForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={newForm.stock_quantity}
                  onChange={(e) => setNewForm({ ...newForm, stock_quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <input
                placeholder="Image URL"
                value={newForm.image_url}
                onChange={(e) => setNewForm({ ...newForm, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-medium">Add Equipment</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Equipment"
        message="Are you sure you want to delete this equipment item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default ManageEquipment;
