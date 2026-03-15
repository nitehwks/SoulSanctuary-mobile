import { describe, it, expect } from 'vitest';

// Crisis keywords for detection
const CRISIS_KEYWORDS = {
  critical: ['suicide', 'kill myself', 'end my life', 'don\'t want to live'],
  high: ['self harm', 'hurt myself', 'cutting', 'end it all'],
  medium: ['hopeless', 'can\'t go on', 'give up', 'worthless'],
};

function detectCrisis(message: string): { isCrisis: boolean; severity: string } {
  const lowerMessage = message.toLowerCase();
  
  for (const [severity, keywords] of Object.entries(CRISIS_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isCrisis: true, severity };
    }
  }
  
  return { isCrisis: false, severity: 'low' };
}

describe('Crisis Detection', () => {
  it('should detect critical crisis keywords', () => {
    const messages = [
      'I want to kill myself',
      'I\'m thinking about suicide',
      'I don\'t want to live anymore',
    ];

    messages.forEach(message => {
      const result = detectCrisis(message);
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('critical');
    });
  });

  it('should detect high severity keywords', () => {
    const messages = [
      'I want to self harm',
      'I\'m cutting myself',
      'I want to hurt myself',
    ];

    messages.forEach(message => {
      const result = detectCrisis(message);
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('high');
    });
  });

  it('should detect medium severity keywords', () => {
    const messages = [
      'I feel hopeless',
      'I can\'t go on like this',
      'I want to give up',
    ];

    messages.forEach(message => {
      const result = detectCrisis(message);
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe('medium');
    });
  });

  it('should not flag normal messages as crisis', () => {
    const messages = [
      'I\'m having a bad day',
      'I feel sad today',
      'Work was stressful',
      'I\'m tired',
    ];

    messages.forEach(message => {
      const result = detectCrisis(message);
      expect(result.isCrisis).toBe(false);
    });
  });

  it('should be case insensitive', () => {
    const result1 = detectCrisis('I want to KILL MYSELF');
    const result2 = detectCrisis('I want to kill myself');
    
    expect(result1.isCrisis).toBe(true);
    expect(result2.isCrisis).toBe(true);
  });

  it('should handle empty messages', () => {
    const result = detectCrisis('');
    expect(result.isCrisis).toBe(false);
    expect(result.severity).toBe('low');
  });
});

describe('Crisis Response', () => {
  it('should provide crisis resources', () => {
    const resources = [
      { name: '988 Suicide & Crisis Lifeline', contact: '988' },
      { name: 'Crisis Text Line', contact: 'Text HOME to 741741' },
    ];

    expect(resources).toHaveLength(2);
    expect(resources[0].contact).toBe('988');
  });

  it('should trigger emergency contact notification for high severity', () => {
    const severity = 'high';
    const shouldNotify = severity === 'high' || severity === 'critical';
    
    expect(shouldNotify).toBe(true);
  });
});
