import { Shield } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sanctuary-dark">
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-16 h-16 bg-sanctuary-glow/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-sanctuary-glow" />
        </div>
        <p className="text-sanctuary-light/70 text-sm">Loading...</p>
      </div>
    </div>
  );
}
