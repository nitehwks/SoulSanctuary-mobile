import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import { Shield } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sanctuary-dark">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sanctuary-glow/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-sanctuary-glow" />
          </div>
          <h1 className="text-3xl font-bold text-sanctuary-light mb-2">SoulSanctuary</h1>
          <p className="text-sanctuary-light/70">Your AI-powered mental health companion</p>
        </div>

        {isSignUp ? (
          <>
            <SignUp routing="path" path="/sign-up" />
            <p className="text-center mt-4 text-sanctuary-light/70">
              Already have an account?{' '}
              <button 
                onClick={() => setIsSignUp(false)}
                className="text-sanctuary-glow hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <SignIn routing="path" path="/sign-in" />
            <p className="text-center mt-4 text-sanctuary-light/70">
              Don't have an account?{' '}
              <button 
                onClick={() => setIsSignUp(true)}
                className="text-sanctuary-glow hover:underline"
              >
                Sign up
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
