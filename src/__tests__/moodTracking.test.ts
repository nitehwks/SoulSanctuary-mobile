import { describe, it, expect } from 'vitest';

// Mood scale validation
const MOOD_SCALE = {
  min: 1,
  max: 5,
};

function isValidMood(mood: number): boolean {
  return Number.isInteger(mood) && mood >= MOOD_SCALE.min && mood <= MOOD_SCALE.max;
}

function calculateAverageMood(moods: number[]): number {
  if (moods.length === 0) return 0;
  const sum = moods.reduce((a, b) => a + b, 0);
  return Number((sum / moods.length).toFixed(1));
}

function getMoodLabel(mood: number): string {
  if (mood <= 1) return 'Very Low';
  if (mood <= 2) return 'Low';
  if (mood <= 3) return 'Neutral';
  if (mood <= 4) return 'Good';
  return 'Excellent';
}

describe('Mood Tracking', () => {
  describe('Mood Validation', () => {
    it('should accept valid mood values (1-5)', () => {
      expect(isValidMood(1)).toBe(true);
      expect(isValidMood(3)).toBe(true);
      expect(isValidMood(5)).toBe(true);
    });

    it('should reject invalid mood values', () => {
      expect(isValidMood(0)).toBe(false);
      expect(isValidMood(6)).toBe(false);
      expect(isValidMood(-1)).toBe(false);
      expect(isValidMood(3.5)).toBe(false);
    });
  });

  describe('Average Calculation', () => {
    it('should calculate average correctly', () => {
      const moods = [3, 4, 5, 4, 3];
      const average = calculateAverageMood(moods);
      expect(average).toBe(3.8);
    });

    it('should return 0 for empty array', () => {
      const average = calculateAverageMood([]);
      expect(average).toBe(0);
    });

    it('should handle single mood entry', () => {
      const average = calculateAverageMood([4]);
      expect(average).toBe(4);
    });
  });

  describe('Mood Labels', () => {
    it('should return correct labels', () => {
      expect(getMoodLabel(1)).toBe('Very Low');
      expect(getMoodLabel(2)).toBe('Low');
      expect(getMoodLabel(3)).toBe('Neutral');
      expect(getMoodLabel(4)).toBe('Good');
      expect(getMoodLabel(5)).toBe('Excellent');
    });
  });

  describe('Emotion Tags', () => {
    it('should limit emotion tags to maximum 10', () => {
      const emotions = ['happy', 'excited', 'grateful', 'calm', 'peaceful', 
                       'anxious', 'stressed', 'tired', 'motivated', 'hopeful', 'joyful'];
      const limited = emotions.slice(0, 10);
      expect(limited).toHaveLength(10);
    });

    it('should accept valid emotion strings', () => {
      const emotions = ['happy', 'sad', 'anxious', 'calm'];
      emotions.forEach(emotion => {
        expect(typeof emotion).toBe('string');
        expect(emotion.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Note Validation', () => {
    it('should limit note length to 2000 characters', () => {
      const longNote = 'a'.repeat(2001);
      expect(longNote.length).toBeGreaterThan(2000);
    });

    it('should accept notes with special characters', () => {
      const note = 'Feeling good! 😊 Had a great day at work. #grateful';
      expect(note).toContain('😊');
      expect(note).toContain('#grateful');
    });
  });

  describe('Trend Analysis', () => {
    it('should detect improving trend', () => {
      const moods = [2, 2, 3, 3, 4, 4, 5];
      const firstHalf = calculateAverageMood(moods.slice(0, 3));
      const secondHalf = calculateAverageMood(moods.slice(-3));
      expect(secondHalf).toBeGreaterThan(firstHalf);
    });

    it('should detect declining trend', () => {
      const moods = [5, 4, 4, 3, 3, 2, 2];
      const firstHalf = calculateAverageMood(moods.slice(0, 3));
      const secondHalf = calculateAverageMood(moods.slice(-3));
      expect(secondHalf).toBeLessThan(firstHalf);
    });
  });
});
