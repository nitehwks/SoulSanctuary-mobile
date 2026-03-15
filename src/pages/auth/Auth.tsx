import { SignIn, SignUp, useUser, useAuth as useClerkAuth, useSignIn } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { Heart, Cross, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, isLoaded: isAuthLoaded } = useClerkAuth();
  const { setUser, syncUserWithBackend } = useAuth();
  const { signIn } = useSignIn();

  // Sync Clerk user with our auth context and backend
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    const syncUser = async () => {
      if (isSignedIn && clerkUser) {
        setIsSyncing(true);
        try {
          setUser({
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            name: clerkUser.fullName || clerkUser.firstName || null,
            imageUrl: clerkUser.imageUrl,
          });
          await syncUserWithBackend();
        } catch (error) {
          console.error('Failed to sync user:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    syncUser();
  }, [isSignedIn, clerkUser, isAuthLoaded, isUserLoaded, setUser, syncUserWithBackend]);

  // Detect if running in Capacitor mobile app
  const isCapacitor = typeof window !== 'undefined' && 
    ((window as any).Capacitor?.isNative || 
     (window as any).capacitor?.isNative ||
     /Capacitor\//.test(navigator.userAgent));

  // Get the appropriate redirect URL based on platform
  const getRedirectUrl = () => {
    if (isCapacitor) {
      // Mobile app deep link (matches iOS URL scheme in Info.plist)
      return 'soulsanctuary://auth-callback';
    }
    // Web
    return `${window.location.origin}/auth-callback`;
  };

  // Handle OAuth sign in
  const handleOAuthSignIn = async (strategy: 'oauth_apple' | 'oauth_google' | 'oauth_facebook') => {
    try {
      setOauthError(null);
      
      if (!signIn) {
        setOauthError('Authentication not ready. Please try again.');
        return;
      }

      const redirectUrl = getRedirectUrl();
      const redirectUrlComplete = isCapacitor ? 'soulsanctuary://auth' : window.location.origin;

      console.log(`[OAuth] Starting ${strategy} flow...`);
      console.log(`[OAuth] Redirect URL: ${redirectUrl}`);
      console.log(`[OAuth] Platform: ${isCapacitor ? 'Capacitor Mobile' : 'Web'}`);

      // For mobile apps, we need to use the native OAuth flow
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete,
      });
    } catch (error: any) {
      console.error('[OAuth] Error:', error);
      setOauthError(error.message || 'Failed to sign in. Please try again.');
    }
  };

  if (!isAuthLoaded || !isUserLoaded || isSyncing) {
    return (
      <div className="sanctuary-bg">
        <div className="sanctuary-overlay" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-sanctuary-gold/30 rounded-full animate-ping" />
              <div className="relative p-6 bg-sanctuary-gold/20 backdrop-blur-sm rounded-full border border-sanctuary-gold/30">
                <Cross className="w-12 h-12 text-sanctuary-gold" />
              </div>
            </div>
            <p className="text-sanctuary-cream/80 text-lg">
              {isSyncing ? 'Preparing your sanctuary...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sanctuary-bg">
      {/* Dark overlay for readability */}
      <div className="sanctuary-overlay" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header with icon */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 relative">
              <div className="absolute inset-0 bg-sanctuary-gold/20 rounded-full animate-pulse-glow" />
              <div className="relative p-5 bg-black/30 backdrop-blur-sm rounded-full border border-sanctuary-gold/40">
                <Heart className="w-10 h-10 text-sanctuary-gold fill-sanctuary-gold/20" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-sanctuary-cream text-shadow-lg mb-2">
              SoulSanctuary
            </h1>
            <p className="text-sanctuary-cream/70 text-shadow text-lg">
              A place of hope, peace, and comfort
            </p>
            <p className="text-sanctuary-gold/80 text-sm mt-2 font-medium">
              Psalm 34:18 • Philippians 4:6-7
            </p>
          </div>

          {/* OAuth Error */}
          {oauthError && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{oauthError}</p>
            </div>
          )}

          {/* Custom OAuth Buttons */}
          <div className="sanctuary-card mb-6">
            <p className="text-center text-sanctuary-cream/70 mb-4 text-sm">
              Continue with
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Apple Sign In */}
              <button
                onClick={() => handleOAuthSignIn('oauth_apple')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.14 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zm-5.85-15.1c.07-1.76 1.55-3.28 3.28-3.41.29 2.32-2.05 4.41-3.28 3.41z"/>
                </svg>
                Apple
              </button>
              
              {/* Google Sign In */}
              <button
                onClick={() => handleOAuthSignIn('oauth_google')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-white/90 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              
              {/* Phone Sign In */}
              <button
                onClick={() => setIsSignUp(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-sanctuary-gold/20 text-sanctuary-gold border border-sanctuary-gold/50 rounded-xl font-medium hover:bg-sanctuary-gold/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Phone
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-sanctuary-cream/50">Or continue with email</span>
            </div>
          </div>

          {/* Auth Card */}
          <div className="sanctuary-card animate-slide-up">
            {isSignUp ? (
              <>
                <SignUp 
                  routing="hash" 
                  signInUrl="#"
                  appearance={{
                    elements: {
                      rootBox: { width: '100%' },
                      card: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        border: 'none',
                      },
                      headerTitle: { 
                        color: '#f5e6c8',
                        fontSize: '1.5rem',
                        fontWeight: '600'
                      },
                      headerSubtitle: { color: 'rgba(245, 230, 200, 0.7)' },
                      socialButtonsBlockButton: { display: 'none' }, // Hide default OAuth buttons
                      dividerBox: { display: 'none' },
                      formFieldLabel: { color: '#f5e6c8' },
                      formFieldInput: {
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#f5e6c8',
                      },
                      footerActionText: { color: 'rgba(245, 230, 200, 0.7)' },
                      footerActionLink: { color: '#d4a853' },
                      formButtonPrimary: {
                        background: 'linear-gradient(to right, #c9a227, #b8860b)',
                        color: '#1a1510',
                        fontWeight: '600',
                        borderRadius: '9999px',
                      },
                      identityPreviewEditButton: { color: '#d4a853' },
                      formFieldErrorText: { color: '#ef4444' },
                      alertText: { color: '#f5e6c8' },
                      alert: {
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      },
                    }
                  }}
                />
                <p className="text-center mt-6 text-sanctuary-cream/70 text-shadow">
                  Already have an account?{' '}
                  <button 
                    onClick={() => setIsSignUp(false)}
                    className="text-sanctuary-gold hover:text-sanctuary-amber font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </>
            ) : (
              <>
                <SignIn 
                  routing="hash"
                  signUpUrl="#"
                  appearance={{
                    elements: {
                      rootBox: { width: '100%' },
                      card: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        border: 'none',
                      },
                      headerTitle: { 
                        color: '#f5e6c8',
                        fontSize: '1.5rem',
                        fontWeight: '600'
                      },
                      headerSubtitle: { color: 'rgba(245, 230, 200, 0.7)' },
                      socialButtonsBlockButton: { display: 'none' }, // Hide default OAuth buttons
                      dividerBox: { display: 'none' },
                      formFieldLabel: { color: '#f5e6c8' },
                      formFieldInput: {
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#f5e6c8',
                      },
                      footerActionText: { color: 'rgba(245, 230, 200, 0.7)' },
                      footerActionLink: { color: '#d4a853' },
                      formButtonPrimary: {
                        background: 'linear-gradient(to right, #c9a227, #b8860b)',
                        color: '#1a1510',
                        fontWeight: '600',
                        borderRadius: '9999px',
                      },
                      identityPreviewEditButton: { color: '#d4a853' },
                      formFieldErrorText: { color: '#ef4444' },
                      alertText: { color: '#f5e6c8' },
                      alert: {
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: 'rgba(239, 68, 68, 0.3)',
                      },
                    }
                  }}
                />
                <p className="text-center mt-6 text-sanctuary-cream/70 text-shadow">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setIsSignUp(true)}
                    className="text-sanctuary-gold hover:text-sanctuary-amber font-semibold transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sanctuary-cream/50 text-sm text-shadow">
              Your journey to peace begins here
            </p>
            {import.meta.env.DEV && (
              <div className="p-3 bg-black/30 backdrop-blur-sm rounded-xl text-xs text-sanctuary-cream/40 border border-white/10">
                Development Mode
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
