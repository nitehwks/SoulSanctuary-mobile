import { useState } from 'react';

const MOOD_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function MoodSlider({ value, onChange }: MoodSliderProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between text-sm text-sanctuary-light/70">
        {MOOD_LABELS.map((label, i) => (
          <span key={i} className={value === i + 1 ? 'text-sanctuary-glow font-semibold' : ''}>
            {label}
          </span>
        ))}
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseMove={(e) => setHovered(Number((e.target as HTMLInputElement).value))}
        onMouseLeave={() => setHovered(null)}
        className="w-full h-3 bg-sanctuary-dark rounded-lg appearance-none cursor-pointer accent-sanctuary-glow"
      />
      <div className="text-center text-lg font-medium text-sanctuary-light">
        {hovered ? MOOD_LABELS[hovered - 1] : MOOD_LABELS[value - 1]}
      </div>
    </div>
  );
}
