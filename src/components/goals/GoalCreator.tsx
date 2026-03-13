import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useGoals } from '../../hooks/useGoals';
import { Plus } from 'lucide-react';

const CATEGORIES = ['mental', 'physical', 'social', 'career', 'personal'] as const;

export function GoalCreator() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('mental');
  const { createGoal } = useGoals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal({ title, description, category, progress: 0, status: 'active' });
    setIsOpen(false);
    setTitle('');
    setDescription('');
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="secondary" className="w-full">
        <Plus className="w-5 h-5 mr-2" />
        Create New Goal
      </Button>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-sanctuary-light mb-4">New Goal</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full sanctuary-input"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full sanctuary-input h-24 resize-none"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                category === cat
                  ? 'bg-sanctuary-glow text-white'
                  : 'bg-sanctuary-dark/50 text-sanctuary-light/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create
          </Button>
        </div>
      </form>
    </Card>
  );
}
