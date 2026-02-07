import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';

function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
          <p className="mt-3 text-gray-600 max-w-3xl">
            This is dummy text. Replace with your official terms.
          </p>
        </div>
      </div>

      <div className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white rounded-xl shadow-md p-6 border border-gray-100 text-gray-700 space-y-4">
          <p>Bookings are confirmed after our team calls you to verify dates and traveler details.</p>
          <p>Payments can be made in cash at the office or as agreed during the confirmation call.</p>
          <p>Travelers must carry valid identification and required permits.</p>
          <p>Health and safety guidelines must be followed during the trip.</p>
          <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TermsOfService;
