import { StrictMode, useEffect, useState } from 'react';
import App from './App.jsx';
import SplashScreen from './components/SplashScreen.jsx';

const RootApp = () => {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 120);
    return () => clearTimeout(timer);
  }, []);
  return showSplash ? <SplashScreen /> : (
    <StrictMode>
      <App />
    </StrictMode>
  );
};

export default RootApp;
