import { Card } from '../ui/Card';
import { Phone, MessageCircle, Globe, HeartHandshake } from 'lucide-react';
import { getCrisisResources } from '../../utils/crisisDetection';

export function CrisisResources() {
  const resources = getCrisisResources();

  return (
    <div className="space-y-4">
      <Card className="border-red-500/30 bg-red-500/10">
        <div className="flex items-center gap-3 mb-4">
          <HeartHandshake className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Immediate Support</h2>
            <p className="text-red-200/70">You are not alone. Help is available 24/7.</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {resources.map(resource => (
          <Card key={resource.name} className="hover:border-sanctuary-glow/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sanctuary-glow/20 rounded-full">
                  <Phone className="w-6 h-6 text-sanctuary-glow" />
                </div>
                <div>
                  <h3 className="font-bold text-sanctuary-light">{resource.name}</h3>
                  <a href={`tel:${resource.phone}`} className="text-2xl font-bold text-sanctuary-glow hover:underline">
                    {resource.phone}
                  </a>
                </div>
              </div>
              <a 
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 hover:bg-sanctuary-accent/30 rounded-full transition-all"
              >
                <Globe className="w-5 h-5 text-sanctuary-light/70" />
              </a>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-start gap-4">
          <MessageCircle className="w-6 h-6 text-sanctuary-glow mt-1" />
          <div>
            <h3 className="font-bold text-sanctuary-light mb-2">Text Support</h3>
            <p className="text-sanctuary-light/70 mb-3">
              Text "HELLO" to 741741 to connect with a Crisis Counselor
            </p>
            <p className="text-sm text-sanctuary-light/50">
              Free, 24/7, confidential crisis support via text message
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
