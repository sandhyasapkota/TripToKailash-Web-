import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';

function Services() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Our Services</h1>
            <div className="text-sm text-gray-600 hidden sm:block">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-blue-600">Services</span>
            </div>
          </div>
          <p className="mt-3 text-gray-600 max-w-3xl">
            We provide end-to-end support for Kailash and Himalayan travel.
          </p>
        </div>
      </div>

      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Booking & Itinerary', detail: 'Custom plans, date selection, and group coordination.' },
            { title: 'Permits & Documentation', detail: 'Assistance with visa, permits, and travel paperwork.' },
            { title: 'Guided Travel', detail: 'Experienced guides and on-route support.' },
            { title: 'Accommodation', detail: 'Hotel and guesthouse arrangements with trusted partners.' },
            { title: 'Transport', detail: 'Ground transport and safe transfer coordination.' },
            { title: 'Emergency Support', detail: 'On-trip support and emergency guidance.' }
          ].map((service) => (
            <div key={service.title} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Services;
