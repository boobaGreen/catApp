
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { GamePage } from './pages/GamePage';
import { LandingPage } from './pages/LandingPage';
import { AnimatePresence } from 'framer-motion';
import { CatProfilesProvider } from './context/CatProfilesContext';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<GamePage />} />
        <Route path="/policy" element={<PrivacyPolicyPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <CatProfilesProvider>
        <AnimatedRoutes />
      </CatProfilesProvider>
    </Router>
  );
}

export default App;
