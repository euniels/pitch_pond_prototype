import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import CampaignDetail from './pages/CampaignDetail';
import Pricing from './pages/Pricing';
import About from './pages/About';
import SignIn from './pages/SignIn';
import { FounderDashboard, InvestorDashboard, AdminDashboard } from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateCampaign from './pages/CreateCampaign';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('pitchpond-theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('pitchpond-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(d => !d);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => { setCurrentUser(null); setUserCampaigns([]); };
  const handleAddCampaign = (c) => setUserCampaigns(prev => [c, ...prev]);

  const DashboardRouter = () => {
    if (!currentUser) return <Navigate to="/signin" />;
    if (currentUser.role === 'Founder') return <FounderDashboard user={currentUser} userCampaigns={userCampaigns} />;
    if (currentUser.role === 'Platform Admin') return <AdminDashboard user={currentUser} />;
    return <InvestorDashboard user={currentUser} />;
  };

  return (
    <Router>
      <div className="App">
        <Navbar currentUser={currentUser} onLogout={handleLogout} darkMode={darkMode} onToggleDark={toggleDarkMode} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/campaign/:id" element={<CampaignDetail currentUser={currentUser} />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/profile" element={currentUser ? <Profile currentUser={currentUser} /> : <Navigate to="/signin" />} />
            <Route path="/create-campaign" element={currentUser ? <CreateCampaign currentUser={currentUser} onAddCampaign={handleAddCampaign} /> : <Navigate to="/signin" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
