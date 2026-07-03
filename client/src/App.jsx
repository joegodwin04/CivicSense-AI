import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MPDashboard from './pages/MPDashboard';
import CitizenPortal from './pages/CitizenPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<MPDashboard />} />
        <Route path="/citizen" element={<CitizenPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
