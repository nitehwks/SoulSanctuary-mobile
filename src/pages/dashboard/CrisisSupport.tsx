import { CrisisResources } from '../../components/crisis/CrisisResources';
import { Card } from '../../components/ui/Card';
import { HeartHandshake, AlertCircle } from 'lucide-react';

export default function CrisisSupport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HeartHandshake className="w-8 h-8 text-red-400" />
        <h1 className="text-3xl font-bold text-white">Crisis Support</h1>
      </div>

      <Card className="bg-red-500/10 border-red-500/30">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-400 mt-1" />
          <div>
            <h3 className="font-bold text-white mb-2">If you're in immediate danger</h3>
            <p className="text-red-100/80 mb-4">
              Call emergency services (911 in US) or go to your nearest emergency room.
            </p>
            <a 
              href="tel:911" 
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700"
            >
              Call 911
            </a>
          </div>
        </div>
      </Card>

      <CrisisResources />
    </div>
  );
}
