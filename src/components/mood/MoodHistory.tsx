import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { apiFetch } from '../../utils/api';
import type { MoodEntry } from '../../types';
import { format } from 'date-fns';

export function MoodHistory() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    apiFetch('/moods').then(setEntries);
  }, []);

  const getMoodColor = (mood: number) => {
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-400', 'text-green-400'];
    return colors[mood - 1] || 'text-gray-400';
  };

  return (
    <Card className="mt-6">
      <h3 className="text-xl font-bold text-sanctuary-light mb-4">Recent Moods</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-start gap-4 p-3 bg-sanctuary-dark/30 rounded-xl">
            <div className={`text-2xl font-bold ${getMoodColor(entry.mood)}`}>
              {entry.mood}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {entry.emotions.map(e => (
                  <span key={e} className="text-xs px-2 py-1 bg-sanctuary-accent/50 rounded-full text-sanctuary-light/80">
                    {e}
                  </span>
                ))}
              </div>
              {entry.note && (
                <p className="text-sm text-sanctuary-light/70 line-clamp-2">{entry.note}</p>
              )}
              <span className="text-xs text-sanctuary-light/50 mt-1 block">
                {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
