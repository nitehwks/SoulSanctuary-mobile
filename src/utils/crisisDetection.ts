const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'want to die',
  'self-harm', 'cutting', 'hurt myself', 'overdose',
  'hopeless', 'worthless', 'can\'t go on', 'no point'
];

const SEVERITY_INDICATORS = {
  critical: ['suicide', 'kill myself', 'end it all', 'want to die'],
  high: ['self-harm', 'cutting', 'overdose', 'hurt myself'],
  medium: ['hopeless', 'worthless', 'can\'t go on']
};

export function analyzeCrisisRisk(text: string): {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
} {
  const lowerText = text.toLowerCase();
  const foundKeywords = CRISIS_KEYWORDS.filter(k => lowerText.includes(k));
  
  if (foundKeywords.length === 0) {
    return { isCrisis: false, severity: 'low', keywords: [] };
  }
  
  let severity: 'medium' | 'high' | 'critical' = 'medium';
  if (SEVERITY_INDICATORS.critical.some(k => lowerText.includes(k))) severity = 'critical';
  else if (SEVERITY_INDICATORS.high.some(k => lowerText.includes(k))) severity = 'high';
  
  return { isCrisis: true, severity, keywords: foundKeywords };
}

export function getCrisisResources(): { name: string; phone: string; url: string }[] {
  return [
    { name: 'Crisis Text Line', phone: '741741', url: 'https://crisistextline.org' },
    { name: 'National Suicide Prevention', phone: '988', url: 'https://988lifeline.org' },
    { name: 'SAMHSA Helpline', phone: '1-800-662-4357', url: 'https://samhsa.gov' }
  ];
}
