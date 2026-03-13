import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { Capacitor } from '@capacitor/core';
import { ReactNode } from 'react';

// CAPACITOR FIX: Replace with your actual Clerk key
const CLERK_PUBLISHABLE_KEY = 'pk_live_YOUR_ACTUAL_CLERK_KEY_HERE';

interface Props {
  children: ReactNode;
}

export function ClerkProvider({ children }: Props) {
  const isNative = Capacitor.isNativePlatform();
  
  const publishableKey = isNative 
    ? CLERK_PUBLISHABLE_KEY 
    : (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY);

  if (!publishableKey || publishableKey === 'pk_test_Y3JlZGlibGUtbGl6YXJkLTc0LmNsZXJrLmFjY291bnRzLmRldiQ') {
    console.error('❌ Replace pk_live_YOUR_ACTUAL_CLERK_KEY_HERE with your actual Clerk key!');
    return <div style={{padding: 20, color: 'red'}}>Missing Clerk Configuration</div>;
  }

  return (
    <BaseClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        elements: {
          rootBox: { width: '100%' }
        }
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}

