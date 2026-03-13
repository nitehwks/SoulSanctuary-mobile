import { MoodEntryForm } from '../../components/mood/MoodEntryForm';
import { MoodHistory } from '../../components/mood/MoodHistory';
import { Card } from '../../components/ui/Card';
import { useAI } from '../../hooks/useAI';
import { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';

export default function MoodTracker() {
  const { getMoodInsight, loading } = useAI();
  const [insight, setInsight] = useState<string>('');

  useEffect(() => {
    // Fetch AI insight on mount
    getMoodInsight([]).then(result => setInsight(result.insight));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sanctuary-light">Mood Tracker</h1>
      
      {insight && (
        <Card className="border-sanctuary-glow/30">
          <div className="flex items-start gap-4">
            <Brain className="w-6 h-6 text-sanctuary-glow mt-1" />
            <div>
              <h3 className="font-bold text-sanctuary-light mb-2">AI Insight</h3>
              <p className="text-sanctuary-light/80 italic">"{insight}"</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <MoodEntryForm />
        <MoodHistory />
      </div>
    </div>
  );
}
