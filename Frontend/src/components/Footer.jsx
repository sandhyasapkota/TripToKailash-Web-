import { Link } from 'react-router-dom';
import logo from '../Images/logo.png';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white">
            {/* Services Section */}
            <div className="border-t border-b border-gray-200 py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="text-gray-800 text-2xl font-bold mb-8 text-center">Why Choose Us</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Best Price Guarantee */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="bg-blue-100 p-4 rounded-full flex-shrink-0 mb-4 group-hover:bg-blue-200 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-gray-800 font-bold text-lg mb-2">Best Price Guarantee</h3>
                            <p className="text-gray-600 text-sm">We offer competitive prices with 10% discount on early bookings</p>
                        </div>

                        {/* 24/7 Customer Support */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="bg-blue-100 p-4 rounded-full flex-shrink-0 mb-4 group-hover:bg-blue-200 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-gray-800 font-bold text-lg mb-2">24/7 Customer Support</h3>
                            <p className="text-gray-600 text-sm">Round-the-clock assistance for all your queries and concerns</p>
                        </div>

                        {/* Experienced Tour Guides */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="bg-blue-100 p-4 rounded-full flex-shrink-0 mb-4 group-hover:bg-blue-200 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-gray-800 font-bold text-lg mb-2">Expert Tour Guides</h3>
                            <p className="text-gray-600 text-sm">Professional and knowledgeable guides for a safe journey</p>
                        </div>

                        {/* Easy Booking Process */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="bg-blue-100 p-4 rounded-full flex-shrink-0 mb-4 group-hover:bg-blue-200 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-gray-800 font-bold text-lg mb-2">Easy Booking</h3>
                            <p className="text-gray-600 text-sm">Simple and secure online booking process in minutes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* About Section */}
                        <div>
                            <img src={logo} alt="TripToKailash" className="h-16 w-auto mb-4" />
                            <p className="text-sm mb-4">
                                Embark on a spiritual journey to reach Kailash with our meticulously curated packages, ensuring a safe and memorable experience.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="hover:text-white transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="#" className="hover:text-white transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                </a>
                                <a href="#" className="hover:text-white transition">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.757-6.162 6.162 0 3.405 2.757 6.162 6.162 6.162 3.405 0 6.162-2.757 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zm0 10.162c-2.211 0-4-1.789-4-4 0-2.211 1.789-4 4-4 2.211 0 4 1.789 4 4 0 2.211-1.789 4-4 4z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Links Section */}
                        <div className="md:col-span-2">
                            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
                                <Link to="/about" className="text-gray-300 hover:text-white transition">About Us</Link>
                                <Link to="/services" className="text-gray-300 hover:text-white transition">Services</Link>
                                <Link to="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
                            </div>
                        </div>

                        {/* Newsletter Section */}
                        <div className="w-full">
                            <h3 className="text-white text-lg font-bold mb-4">Subscribe to our Newsletter</h3>
                            <p className="text-sm mb-4">Stay updated with our latest offers and news</p>
                            <form className="flex max-w-[220px]" action="#" method="POST">
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    placeholder="Your email" 
                                    className="w-32 px-2 py-2 rounded-l-md text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" 
                                    required 
                                />
                                <button 
                                    type="submit" 
                                    className="px-5 py-2 rounded-r-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition whitespace-nowrap text-xs"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="bg-[#2B4C8F] py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center text-white text-xs">
                        <p className="mb-2 md:mb-0">© {currentYear} TripToKailash. All rights reserved.</p>
                        <div className="flex space-x-4">
                            <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
                            <Link to="/terms-of-service" className="hover:text-white transition">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;