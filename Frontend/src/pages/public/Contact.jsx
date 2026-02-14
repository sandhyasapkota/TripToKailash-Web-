import { Link } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../contexts/ToastContext';
import { contactSchema } from './schema/publicSchema';
import PageTransition from '../../components/PageTransition';

function Contact() {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const validationErrors = {};
      const fieldErrors = result.error.flatten().fieldErrors;
      Object.keys(fieldErrors).forEach((key) => {
        if (fieldErrors[key] && fieldErrors[key].length > 0) {
          validationErrors[key] = fieldErrors[key][0];
        }
      });
      setErrors(validationErrors);
      showError('Please fix the highlighted fields.');
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // Include token if user is logged in
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Thank you for your enquiry! We will get back to you soon.', 'Message Sent');
        setForm({ name: '', phone: '', email: '', subject: '', message: '' });
      } else {
        showError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Contact Us</h1>
            <div className="text-sm text-gray-600 hidden sm:block">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-blue-600">Contact</span>
            </div>
          </div>
          <p className="mt-3 text-gray-600 max-w-2xl">
            We confirm bookings by phone call. Reach out anytime for itinerary details, pricing, or documentation help.
          </p>
        </div>
      </div>

      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Our Details</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Company:</span> TripToKailash Tours and Travels</p>
              <p><span className="font-semibold">Phone:</span> +977-98XXXXXXXX</p>
              <p><span className="font-semibold">WhatsApp:</span> +977-98XXXXXXXX</p>
              <p><span className="font-semibold">Email:</span> info@triptokailash.com</p>
              <p><span className="font-semibold">Address:</span> Thamel, Kathmandu, Nepal</p>
              <p><span className="font-semibold">Working Hours:</span> 9:00 AM - 7:00 PM (Sun-Fri)</p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
              After you submit a booking request, our team will call you to confirm the appointment and payment method.
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Your name"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Your phone"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.subject ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Trip inquiry"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.message ? 'border-red-400' : 'border-gray-300'}`}
                  rows="5"
                  placeholder="Tell us about your travel plans..."
                ></textarea>
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>
              <div className="md:col-span-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#2B4C8F] hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </PageTransition>
  );
}

export default Contact;
