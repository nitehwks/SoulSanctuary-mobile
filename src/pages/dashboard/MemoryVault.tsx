import { MemoryGraph } from '../../components/memory/MemoryGraph';
import { Card } from '../../components/ui/Card';
import { Brain, Lock } from 'lucide-react';

export default function MemoryVault() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-sanctuary-light flex items-center gap-3">
          <Brain className="w-8 h-8 text-sanctuary-glow" />
          Memory Vault
        </h1>
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <Lock className="w-4 h-4" />
          <span>End-to-end encrypted</span>
        </div>
      </div>

      <Card className="border-sanctuary-glow/20">
        <p className="text-sanctuary-light/80">
          Your personal knowledge graph connects moods, goals, insights, and moments of gratitude. 
          AI-powered pattern recognition helps identify triggers and growth opportunities.
        </p>
      </Card>

      <MemoryGraph />
    </div>
  );
}
