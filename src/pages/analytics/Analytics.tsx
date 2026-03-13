import { Card } from '../../components/ui/Card';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Activity } from 'lucide-react';

export default function Analytics() {
  const [moodData, setMoodData] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/analytics/moods').then(setMoodData);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sanctuary-light flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-sanctuary-glow" />
        Wellness Analytics
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-80">
          <h3 className="text-lg font-bold text-sanctuary-light mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Mood Trends
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
              <XAxis dataKey="date" stroke="#eaeaea" />
              <YAxis domain={[1, 5]} stroke="#eaeaea" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16213e', border: '1px solid #0f3460' }}
                itemStyle={{ color: '#eaeaea' }}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#e94560" 
                strokeWidth={2}
                dot={{ fill: '#e94560' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="h-80">
          <h3 className="text-lg font-bold text-sanctuary-light mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-sanctuary-dark/30 rounded-lg">
              <span className="text-sanctuary-light/70">Average Mood</span>
              <span className="text-2xl font-bold text-sanctuary-glow">3.4/5</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-sanctuary-dark/30 rounded-lg">
              <span className="text-sanctuary-light/70">Goals Completed</span>
              <span className="text-2xl font-bold text-green-400">7</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-sanctuary-dark/30 rounded-lg">
              <span className="text-sanctuary-light/70">Journal Entries</span>
              <span className="text-2xl font-bold text-blue-400">12</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
