import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
          <p className="mt-3 text-gray-600 max-w-3xl">
            This is dummy text. Replace with your official privacy policy.
          </p>
        </div>
      </div>

      <div className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white rounded-xl shadow-md p-6 border border-gray-100 text-gray-700 space-y-4">
          <p>We collect only the information needed to process bookings and provide support.</p>
          <p>We do not sell your personal data. Information is shared only with service partners for travel arrangements.</p>
          <p>You may request data updates or deletion by contacting us.</p>
          <p>By using our service, you agree to this privacy policy.</p>
          <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
