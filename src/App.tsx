import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { SanctuaryProvider } from './context/SanctuaryContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import MoodTracker from './pages/dashboard/MoodTracker';
import GoalCoach from './pages/dashboard/GoalCoach';
import MemoryVault from './pages/dashboard/MemoryVault';
import Analytics from './pages/analytics/Analytics';
import CrisisSupport from './pages/dashboard/CrisisSupport';
import Profile from './pages/profile/Profile';
import Auth from './pages/auth/Auth';

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <div className="sanctuary-loader">Loading...</div>;

  return (
    <SanctuaryProvider>
      {isSignedIn ? (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mood" element={<MoodTracker />} />
            <Route path="/goals" element={<GoalCoach />} />
            <Route path="/memory" element={<MemoryVault />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/crisis" element={<CrisisSupport />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      ) : (
        <Auth />
      )}
    </SanctuaryProvider>
  );
}

export default App;
