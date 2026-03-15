import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { SanctuaryProvider } from './context/SanctuaryContext';
import { Layout } from './components/layout/Layout';
import Auth from './pages/auth/Auth';
import AuthCallback from './pages/auth/AuthCallback';
import { PageLoader } from './components/ui/PageLoader';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Coach = lazy(() => import('./pages/dashboard/Coach'));
// Note: Dashboard is used via /dashboard route
const MoodTracker = lazy(() => import('./pages/dashboard/MoodTracker'));
const GoalCoach = lazy(() => import('./pages/dashboard/GoalCoach'));
const MemoryVault = lazy(() => import('./pages/dashboard/MemoryVault'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const CrisisSupport = lazy(() => import('./pages/dashboard/CrisisSupport'));
const Profile = lazy(() => import('./pages/profile/Profile'));

function AuthenticatedRoutes() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Coach />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/goals" element={<GoalCoach />} />
          <Route path="/memory" element={<MemoryVault />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/crisis" element={<CrisisSupport />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

function AppContent() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const location = useLocation();

  // Show loader while Clerk initializes
  if (!isLoaded) return <PageLoader />;

  // Auth callback route must be accessible without being signed in
  if (location.pathname === '/auth-callback') {
    return (
      <AuthProvider>
        <SanctuaryProvider>
          <AuthCallback />
        </SanctuaryProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <SanctuaryProvider>
        {isSignedIn ? (
          <AuthenticatedRoutes />
        ) : (
          <Auth />
        )}
      </SanctuaryProvider>
    </AuthProvider>
  );
}

function SoulSanctuary() {
  return <AppContent />;
}

export default SoulSanctuary;
