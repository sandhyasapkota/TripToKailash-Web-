import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';

function CancellationPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-800">Cancellation Policy</h1>
          <p className="mt-3 text-gray-600 max-w-3xl">
            This is dummy text. Replace with your official cancellation terms.
          </p>
        </div>
      </div>

      <div className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-white rounded-xl shadow-md p-6 border border-gray-100 text-gray-700 space-y-4">
          <p>Notify us by phone or email if you need to cancel or reschedule.</p>
          <p>Refunds (if any) depend on timing and partner policies.</p>
          <p>We will always try to offer alternative dates for confirmed travelers.</p>
          <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CancellationPolicy;
