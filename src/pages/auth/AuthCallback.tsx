import { useEffect, useState } from 'react';
import { useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';
import { AlertCircle, Loader2 } from 'lucide-react';

/**
 * OAuth Callback Handler
 * 
 * This component handles the OAuth callback from Apple/Google sign-in.
 * It's rendered at the /auth-callback route.
 */
export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const { handleRedirectCallback } = useClerk();
  const { isLoaded: isSignInLoaded } = useSignIn();
  const { isLoaded: isSignUpLoaded } = useSignUp();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing OAuth callback...');
        console.log('[AuthCallback] URL:', window.location.href);
        
        // Wait for Clerk to be ready
        if (!isSignInLoaded || !isSignUpLoaded) {
          console.log('[AuthCallback] Waiting for Clerk...');
          return;
        }

        // Handle the redirect from OAuth provider
        await handleRedirectCallback({
          afterSignInUrl: '/',
          afterSignUpUrl: '/',
          redirectUrl: '/',
        });

        console.log('[AuthCallback] OAuth callback handled successfully');
      } catch (err: any) {
        console.error('[AuthCallback] Error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [handleRedirectCallback, isSignInLoaded, isSignUpLoaded]);

  if (error) {
    return (
      <div className="sanctuary-bg">
        <div className="sanctuary-overlay" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <div className="sanctuary-card max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-sanctuary-cream mb-2">
              Authentication Error
            </h2>
            <p className="text-sanctuary-cream/70 mb-6">{error}</p>
            <a
              href="/auth"
              className="inline-flex items-center justify-center px-6 py-3 bg-sanctuary-gold/20 hover:bg-sanctuary-gold/30 
                         text-sanctuary-gold border border-sanctuary-gold/50 rounded-xl font-medium transition-colors"
            >
              Try Again
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sanctuary-bg">
      <div className="sanctuary-overlay" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-sanctuary-gold/30 rounded-full animate-ping" />
            <div className="relative p-6 bg-sanctuary-gold/20 backdrop-blur-sm rounded-full border border-sanctuary-gold/30">
              <Loader2 className="w-12 h-12 text-sanctuary-gold animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-sanctuary-cream mb-2">
            Completing Sign In
          </h2>
          <p className="text-sanctuary-cream/70">
            Please wait while we verify your credentials...
          </p>
        </div>
      </div>
    </div>
  );
}
