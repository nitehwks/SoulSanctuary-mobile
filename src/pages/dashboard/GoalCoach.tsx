import { GoalList } from '../../components/goals/GoalList';
import { GoalCreator } from '../../components/goals/GoalCreator';
import { Card } from '../../components/ui/Card';
import { Target, Lightbulb } from 'lucide-react';

export default function GoalCoach() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-sanctuary-light flex items-center gap-3">
          <Target className="w-8 h-8 text-sanctuary-glow" />
          Goal Coach
        </h1>
      </div>

      <Card className="bg-gradient-to-r from-sanctuary-purple to-sanctuary-accent/50 border-sanctuary-glow/20">
        <div className="flex items-start gap-4">
          <Lightbulb className="w-6 h-6 text-yellow-400 mt-1" />
          <div>
            <h3 className="font-bold text-sanctuary-light mb-2">SMART Goals</h3>
            <p className="text-sanctuary-light/80 text-sm">
              Our AI helps you create Specific, Measurable, Achievable, Relevant, and Time-bound goals. 
              Each goal is broken down into manageable milestones with personalized coaching.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GoalCreator />
        </div>
        <div className="lg:col-span-2">
          <GoalList />
        </div>
      </div>
    </div>
  );
}
