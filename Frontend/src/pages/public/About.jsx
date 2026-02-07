import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';

function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">About TripToKailash</h1>
            <div className="text-sm text-gray-600 hidden sm:block">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-blue-600">About</span>
            </div>
          </div>
          <p className="mt-3 text-gray-600 max-w-3xl">
            We are a dedicated travel team specializing in Kailash and Himalayan journeys. Our focus is safe travel,
            respectful pilgrimage experiences, and transparent booking.
          </p>
        </div>
      </div>

      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Provide a trustworthy and memorable spiritual journey to Mount Kailash with a strong focus on safety,
              guided support, and respectful local partnerships.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Why Travelers Choose Us</h2>
            <ul className="text-gray-600 space-y-2">
              <li>Experienced guides and local coordination.</li>
              <li>Clear pricing and flexible booking options.</li>
              <li>24/7 assistance during travel days.</li>
              <li>Well-planned itineraries with rest and acclimatization.</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About;
