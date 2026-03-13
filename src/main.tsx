import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Capacitor } from '@capacitor/core';
import App from './App';
import './index.css';

// CAPACITOR FIX: Hardcode your Clerk key here for mobile
// Get your key from: https://dashboard.clerk.com/last-active?path=api-keys
const CLERK_PUBLISHABLE_KEY = 'sk_test_YH1FdsmwyV9nXuLoKM3OOzBtEsNSQYv5YkeUVAXCTi';

// Detect if running as native mobile app
const isNative = Capacitor.isNativePlatform();

// Use hardcoded key for mobile, env variable for web
const publishableKey = isNative 
  ? CLERK_PUBLISHABLE_KEY 
  : (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY);

// Debug logging (remove in production)
console.log(`[Clerk] Platform: ${isNative ? 'Native Mobile' : 'Web'}`);
console.log(`[Clerk] Key available: ${publishableKey ? 'YES' : 'NO'}`);

if (!publishableKey || publishableKey === 'sk_test_YH1FdsmwyV9nXuLoKM3OOzBtEsNSQYv5YkeUVAXCTi') {
  console.error('❌ CRITICAL: Replace pk_live_YOUR_ACTUAL_CLERK_KEY_HERE with your actual Clerk publishable key!');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        elements: {
          rootBox: {
            width: '100%',
          }
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

