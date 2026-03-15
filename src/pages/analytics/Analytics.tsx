import { Card } from '../../components/ui/Card';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Activity, Target, Flame } from 'lucide-react';

interface SummaryData {
  averageMood: number;
  totalMoodEntries: number;
  goalsCompleted: number;
  totalGoals: number;
  journalEntries: number;
  streakDays: number;
  weeklyTrend: number;
  topEmotions: { emotion: string; count: number }[];
}

interface EmotionData {
  emotion: string;
  count: number;
}

const EMOTION_COLORS = ['#e94560', '#0f3460', '#533483', '#e94560', '#16213e'];

export default function Analytics() {
  const [moodData, setMoodData] = useState<any[]>([]);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moods, emotions, summaryData] = await Promise.all([
          apiFetch('/analytics/moods'),
          apiFetch('/analytics/emotions'),
          apiFetch('/analytics/summary'),
        ]);
        
        setMoodData(moods);
        setEmotionData(emotions);
        setSummary(summaryData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-sanctuary-light flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-sanctuary-glow" />
          Wellness Analytics
        </h1>
        <div className="text-center py-12 text-sanctuary-light/50">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sanctuary-light flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-sanctuary-glow" />
        Wellness Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-sanctuary-glow" />
            <span className="text-sanctuary-light/70 text-sm">Average Mood</span>
          </div>
          <p className="text-3xl font-bold text-sanctuary-glow">
            {summary?.averageMood.toFixed(1) || '0'}/5
          </p>
          <p className="text-xs text-sanctuary-light/50 mt-1">
            {summary?.totalMoodEntries || 0} entries
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-sanctuary-light/70 text-sm">Goals</span>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {summary?.goalsCompleted || 0}/{summary?.totalGoals || 0}
          </p>
          <p className="text-xs text-sanctuary-light/50 mt-1">
            completed
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-sanctuary-light/70 text-sm">Journal</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">
            {summary?.journalEntries || 0}
          </p>
          <p className="text-xs text-sanctuary-light/50 mt-1">
            entries this month
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-sanctuary-light/70 text-sm">Streak</span>
          </div>
          <p className="text-3xl font-bold text-orange-400">
            {summary?.streakDays || 0}
          </p>
          <p className="text-xs text-sanctuary-light/50 mt-1">
            days
          </p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood Trends */}
        <Card className="h-80">
          <h3 className="text-lg font-bold text-sanctuary-light mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Mood Trends (30 Days)
          </h3>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
                <XAxis 
                  dataKey="date" 
                  stroke="#eaeaea"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[1, 5]} stroke="#eaeaea" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16213e', border: '1px solid #0f3460' }}
                  itemStyle={{ color: '#eaeaea' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
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
          ) : (
            <div className="h-full flex items-center justify-center text-sanctuary-light/50">
              No mood data yet. Start tracking your moods!
            </div>
          )}
        </Card>

        {/* Emotion Distribution */}
        <Card className="h-80">
          <h3 className="text-lg font-bold text-sanctuary-light mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Top Emotions
          </h3>
          {emotionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ emotion, count }) => `${emotion}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="emotion"
                >
                  {emotionData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16213e', border: '1px solid #0f3460' }}
                  itemStyle={{ color: '#eaeaea' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sanctuary-light/50">
              No emotion data yet. Tag your moods with emotions!
            </div>
          )}
        </Card>
      </div>

      {/* Weekly Trend */}
      {summary && (
        <Card className="p-4">
          <h3 className="text-lg font-bold text-sanctuary-light mb-3">Weekly Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-sanctuary-light/70">This Week</p>
              <p className={`text-2xl font-bold ${
                (summary.weeklyTrend || 0) >= 3 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {summary.weeklyTrend?.toFixed(1) || '0'}/5
              </p>
            </div>
            <div>
              <p className="text-sm text-sanctuary-light/70">This Month</p>
              <p className={`text-2xl font-bold ${
                (summary.averageMood || 0) >= 3 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {summary.averageMood.toFixed(1)}/5
              </p>
            </div>
            <div>
              <p className="text-sm text-sanctuary-light/70">Top Emotion</p>
              <p className="text-2xl font-bold text-sanctuary-glow">
                {summary.topEmotions[0]?.emotion || 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
