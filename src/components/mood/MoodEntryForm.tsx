import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MoodSlider } from '../ui/MoodSlider';
import { useMood } from '../../hooks/useMood';
import { useSanctuary } from '../../context/SanctuaryContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

const EMOTIONS = ['Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Tired', 'Hopeful', 'Lonely'];

export function MoodEntryForm() {
  const [mood, setMood] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { submitMood, loading, error } = useMood();
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
    setShowSuccess(false);
    
    try {
      await submitMood({
        mood,
        emotions: selectedEmotions,
        note,
        userId: '', // Set by backend from auth
      });
      
      // Show success message
      setShowSuccess(true);
      
      // Clear form
      setNote('');
      setSelectedEmotions([]);
      setMood(3);
      
      // Refresh data in context
      await refreshData();
      
      // Hide success after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit mood:', err);
      // Error is handled by the hook and displayed below
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-sanctuary-light mb-6">How are you feeling?</h2>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span>Mood logged successfully!</span>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
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
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Log Mood'
          )}
        </Button>
      </form>
    </Card>
  );
}
