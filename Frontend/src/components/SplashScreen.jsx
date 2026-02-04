// Frontend/src/components/SplashScreen.jsx
const SplashScreen = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
    <img src="/src/Images/logo.png" alt="Logo" className="w-24 h-24 animate-bounce mb-4" />
    <h1 className="text-2xl font-bold text-[#2B4C8F] mb-2">triptokailash</h1>
    <div className="animate-spin rounded-full border-b-4 border-[#2B4C8F] h-12 w-12"></div>
    <p className="mt-4 text-gray-600">Loading, please wait...</p>
  </div>
);

export default SplashScreen;
