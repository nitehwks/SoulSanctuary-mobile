import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import SoulSanctuary from './App';
import './index.css';
import { initializeOfflineSupport } from './services/offline';
import { initializeBackgroundSync } from './services/backgroundSync';
import { initializePushNotifications } from './services/pushNotifications';
import { initializeNotifications } from './services/notifications';

// Clerk publishable key - must start with pk_
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_Y3JlZGlibGUtbGl6YXJkLTc0LmNsZXJrLmFjY291bnRzLmRldiQ';

/**
 * Initialize mobile services after authentication
 */
function MobileServicesInitializer() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Initialize mobile services after user is authenticated
    const initMobileServices = async () => {
      try {
        // Initialize offline support (network monitoring, queue processing)
        await initializeOfflineSupport((online) => {
          // Network status logged by offline service internally
          void online;
        });

        // Initialize background sync (app state monitoring)
        await initializeBackgroundSync();

        // Initialize local notifications
        await initializeNotifications();

        // Initialize push notifications (FCM/APNs)
        await initializePushNotifications();

      } catch (error) {
        // Mobile service init failure is non-critical; silent fail
      }
    };

    initMobileServices();
  }, [isSignedIn, isLoaded]);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          rootBox: { width: '100%' },
          card: { 
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem'
          },
          headerTitle: { color: '#eaeaea' },
          headerSubtitle: { color: 'rgba(234,234,234,0.7)' },
          socialButtonsBlockButton: {
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#eaeaea',
            border: '1px solid rgba(255,255,255,0.2)'
          },
          socialButtonsBlockButtonText: { color: '#eaeaea' },
          formFieldLabel: { color: '#eaeaea' },
          formFieldInput: {
            backgroundColor: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#eaeaea'
          },
          footerActionText: { color: 'rgba(234,234,234,0.7)' },
          footerActionLink: { color: '#e94560' },
          formButtonPrimary: {
            backgroundColor: '#e94560',
            color: '#1a1a2e',
            fontWeight: '600'
          }
        }
      }}
    >
      <BrowserRouter>
        <MobileServicesInitializer />
        <SoulSanctuary />
      </BrowserRouter>
    </ClerkProvider>
  </>
);
