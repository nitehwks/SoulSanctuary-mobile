import { MoodEntryForm } from '../../components/mood/MoodEntryForm';
import { MoodHistory } from '../../components/mood/MoodHistory';
import { AIChat } from '../../components/ai/AIChat';
import { Card } from '../../components/ui/Card';
import { useSanctuary } from '../../context/SanctuaryContext';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

export default function Dashboard() {
  const { currentMood, activeGoals } = useSanctuary();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sanctuary-glow/20 rounded-full">
              <Sparkles className="w-6 h-6 text-sanctuary-glow" />
            </div>
            <div>
              <p className="text-sm text-sanctuary-light/70">Current Mood</p>
              <p className="text-2xl font-bold text-sanctuary-light">
                {currentMood ? currentMood.mood + '/5' : 'Not tracked'}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-sanctuary-light/70">Active Goals</p>
              <p className="text-2xl font-bold text-sanctuary-light">{activeGoals.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-sanctuary-light/70">Streak</p>
              <p className="text-2xl font-bold text-sanctuary-light">12 days</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <MoodEntryForm />
          <MoodHistory />
        </div>
        <AIChat />
      </div>
    </div>
  );
}
