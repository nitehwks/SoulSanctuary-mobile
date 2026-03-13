import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MoodSlider } from '../ui/MoodSlider';
import { useMood } from '../../hooks/useMood';
import { useSanctuary } from '../../context/SanctuaryContext';

const EMOTIONS = ['Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Tired', 'Hopeful', 'Lonely'];

export function MoodEntryForm() {
  const [mood, setMood] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const { submitMood, loading } = useMood();
  const { refreshData } = useSanctuary();

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMood({
      mood,
      emotions: selectedEmotions,
      note,
      userId: '', // Set by backend from auth
    });
    await refreshData();
    setNote('');
    setSelectedEmotions([]);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-sanctuary-light mb-6">How are you feeling?</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <MoodSlider value={mood} onChange={setMood} />
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-sanctuary-light/70">Emotions</label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map(emotion => (
              <button
                key={emotion}
                type="button"
                onClick={() => toggleEmotion(emotion)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedEmotions.includes(emotion)
                    ? 'bg-sanctuary-glow text-white'
                    : 'bg-sanctuary-dark/50 text-sanctuary-light/70 hover:bg-sanctuary-accent'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-sanctuary-light/70">Notes</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 sanctuary-input resize-none"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Log Mood'}
        </Button>
      </form>
    </Card>
  );
}
