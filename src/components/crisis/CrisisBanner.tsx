import { useSanctuary } from '../../context/SanctuaryContext';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export function CrisisBanner() {
  const { crisisMode, setCrisisMode } = useSanctuary();
  const [dismissed, setDismissed] = useState(false);

  if (!crisisMode || dismissed) return null;

  return (
    <div className="bg-red-600/90 text-white px-4 py-3 animate-pulse">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <p className="font-bold">Crisis Mode Active</p>
            <p className="text-sm opacity-90">Immediate support resources available</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="tel:988" 
            className="px-4 py-2 bg-white text-red-600 rounded-full font-bold hover:bg-opacity-90"
          >
            Call 988 Now
          </a>
          <button 
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
