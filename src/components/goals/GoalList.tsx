import { useEffect } from 'react';
import { Card } from '../ui/Card';
import { useGoals } from '../../hooks/useGoals';
import { Target, CheckCircle2, Circle } from 'lucide-react';

export function GoalList() {
  const { goals, fetchGoals } = useGoals();
  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="space-y-4">
      {goals.map(goal => (
        <Card key={goal.id}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                goal.category === 'mental' ? 'bg-purple-500/20' :
                goal.category === 'physical' ? 'bg-green-500/20' :
                goal.category === 'social' ? 'bg-blue-500/20' :
                'bg-orange-500/20'
              }`}>
                <Target className="w-5 h-5 text-sanctuary-light" />
              </div>
              <div>
                <h3 className="font-bold text-sanctuary-light">{goal.title}</h3>
                <span className="text-xs text-sanctuary-light/50 uppercase">{goal.category}</span>
              </div>
            </div>
            <span className={`text-sm font-medium ${
              goal.status === 'completed' ? 'text-green-400' : 'text-sanctuary-glow'
            }`}>
              {goal.progress}%
            </span>
          </div>

          <div className="w-full bg-sanctuary-dark rounded-full h-2 mb-4">
            <div 
              className="bg-sanctuary-glow h-2 rounded-full transition-all duration-500"
              style={{ width: `${goal.progress}%` }}
            />
          </div>

          <div className="space-y-2">
            {goal.milestones.map(milestone => (
              <div key={milestone.id} className="flex items-center gap-2 text-sm">
                {milestone.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Circle className="w-4 h-4 text-sanctuary-light/30" />
                )}
                <span className={milestone.completed ? 'text-sanctuary-light' : 'text-sanctuary-light/50'}>
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>

          {goal.aiCoaching && (
            <div className="mt-4 p-3 bg-sanctuary-accent/20 rounded-lg border border-sanctuary-accent/30">
              <p className="text-sm text-sanctuary-light/80 italic">"{goal.aiCoaching}"</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
