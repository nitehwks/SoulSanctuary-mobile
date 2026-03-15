import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'https://soulsanctuary.app',
    'X-Title': 'SoulSanctuary',
  },
});

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
const FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'openai/gpt-4o-mini';

// Check if API key is configured
const hasValidApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-');

interface MoodEntry {
  mood: number;
  emotions: string[];
  note?: string;
  timestamp: string;
}

interface Goal {
  title: string;
  description?: string;
  category: string;
  progress: number;
  status: string;
}

interface Memory {
  type: string;
  content: string;
  sentiment: number;
  timestamp: string;
}

/**
 * Helper to make API calls with timeout
 */
async function callAIWithTimeout(messages: any[], model: string = DEFAULT_MODEL, timeoutMs: number = 15000): Promise<string | null> {
  if (!hasValidApiKey) {
    console.warn('No valid OpenRouter API key configured');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 500,
    }, { signal: controller.signal });
    
    clearTimeout(timeoutId);
    return completion.choices[0].message.content || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('AI request timed out');
    } else if (error.status === 401) {
      console.error('AI API authentication failed - check your API key');
    } else {
      console.error('AI API error:', error.message);
    }
    return null;
  }
}

/**
 * Generate AI insight for mood entries
 */
export async function generateMoodInsight(moodEntries: MoodEntry[]): Promise<string> {
  if (!hasValidApiKey) {
    return 'Tracking your moods helps you understand your emotional patterns. Keep it up!';
  }

  try {
    const entriesText = moodEntries.map(e => 
      `Mood: ${e.mood}/5, Emotions: ${e.emotions.join(', ')}, Note: ${e.note || 'N/A'}, Date: ${e.timestamp}`
    ).join('\n');

    const content = await callAIWithTimeout([
      {
        role: 'system',
        content: 'You are a compassionate mental health AI. Provide brief, insightful observations about mood patterns. Be supportive but not clinical. Keep responses to 2-3 sentences.'
      },
      {
        role: 'user',
        content: `Analyze these mood entries and provide a gentle insight:\n${entriesText}`
      }
    ]);

    return content || 'We\'re here to support you. Consider talking to someone you trust about how you\'re feeling.';
  } catch (error) {
    console.error('Failed to generate mood insight:', error);
    return 'We\'re here to support you. Consider talking to someone you trust about how you\'re feeling.';
  }
}

/**
 * Generate AI coaching for a goal
 */
export async function generateGoalCoaching(goal: Goal): Promise<string> {
  if (!hasValidApiKey) {
    return `Great progress on "${goal.title}"! Every step forward matters.`;
  }

  try {
    const content = await callAIWithTimeout([
      {
        role: 'system',
        content: 'You are a motivational coach specializing in mental health and personal growth. Provide encouraging, actionable advice. Keep it under 2 sentences.'
      },
      {
        role: 'user',
        content: `Goal: ${goal.title}\nDescription: ${goal.description || 'N/A'}\nCategory: ${goal.category}\nProgress: ${goal.progress}%\nStatus: ${goal.status}`
      }
    ]);

    return content || 'Every step forward counts. You\'re doing great!';
  } catch (error) {
    console.error('Failed to generate goal coaching:', error);
    return 'Remember: progress, not perfection. Keep going!';
  }
}

/**
 * Detect if a message indicates a crisis situation
 */
export async function detectCrisis(message: string): Promise<{ isCrisis: boolean; severity: 'low' | 'medium' | 'high' | 'critical' }> {
  const crisisKeywords = {
    critical: ['suicide', 'kill myself', 'end my life', 'don\'t want to live', 'better off dead'],
    high: ['self harm', 'hurt myself', 'cutting', 'end it all', 'no point living'],
    medium: ['hopeless', 'can\'t go on', 'give up', 'worthless', 'numb', 'empty'],
  };

  const lowerMessage = message.toLowerCase();
  
  for (const keyword of crisisKeywords.critical) {
    if (lowerMessage.includes(keyword)) {
      return { isCrisis: true, severity: 'critical' };
    }
  }
  
  for (const keyword of crisisKeywords.high) {
    if (lowerMessage.includes(keyword)) {
      return { isCrisis: true, severity: 'high' };
    }
  }
  
  for (const keyword of crisisKeywords.medium) {
    if (lowerMessage.includes(keyword)) {
      return { isCrisis: true, severity: 'medium' };
    }
  }
  
  return { isCrisis: false, severity: 'low' };
}

/**
 * Generate insights from memory patterns
 */
export async function generateMemoryInsights(memories: Memory[]): Promise<string[]> {
  if (!hasValidApiKey || memories.length === 0) {
    return [
      'Your memories are valuable markers of your journey.',
      'Looking back can help us understand our patterns.',
      'Each memory contributes to your unique story.'
    ];
  }

  try {
    const memoriesText = memories.map(m => 
      `[${m.type}] ${m.content} (sentiment: ${m.sentiment})`
    ).join('\n');

    const content = await callAIWithTimeout([
      {
        role: 'system',
        content: 'Analyze these memories and identify patterns or insights. Return a JSON array of 3-5 insight strings. Be gentle and supportive.'
      },
      {
        role: 'user',
        content: `Memories:\n${memoriesText}`
      }
    ]);

    if (!content) throw new Error('No response from AI');
    
    const insights = JSON.parse(content);
    return Array.isArray(insights) ? insights.slice(0, 5) : ['Your memories tell a unique story.'];
  } catch (error) {
    console.error('Failed to generate memory insights:', error);
    return [
      'Your memories are valuable markers of your journey.',
      'Looking back can help us understand our patterns.',
      'Each memory contributes to your unique story.'
    ];
  }
}

/**
 * Generate weekly mental health summary
 */
export async function generateWeeklySummary(
  moods: MoodEntry[],
  goals: Goal[],
  memories: Memory[]
): Promise<{
  summary: string;
  highlights: string[];
  suggestions: string[];
}> {
  if (!hasValidApiKey) {
    return {
      summary: 'This week was part of your ongoing journey.',
      highlights: ['You took steps to care for your mental health'],
      suggestions: ['Keep tracking your moods', 'Celebrate small wins']
    };
  }

  try {
    const avgMood = moods.length > 0 ? moods.reduce((sum, m) => sum + m.mood, 0) / moods.length : 0;
    const completedGoals = goals.filter(g => g.status === 'completed').length;

    const content = await callAIWithTimeout([
      {
        role: 'system',
        content: 'Generate a compassionate weekly mental health summary. Return JSON: { summary: string, highlights: string[], suggestions: string[] }'
      },
      {
        role: 'user',
        content: `Weekly Stats:\n- Average mood: ${avgMood.toFixed(1)}/5\n- Mood entries: ${moods.length}\n- Goals completed: ${completedGoals}/${goals.length}\n- Memories recorded: ${memories.length}`
      }
    ]);

    if (!content) throw new Error('No response from AI');
    
    const result = JSON.parse(content);
    
    return {
      summary: result.summary || 'This week had its ups and downs, and that\'s okay.',
      highlights: result.highlights || ['You showed up for yourself this week'],
      suggestions: result.suggestions || ['Take time to rest and recharge']
    };
  } catch (error) {
    console.error('Failed to generate weekly summary:', error);
    return {
      summary: 'This week was part of your ongoing journey.',
      highlights: ['You took steps to care for your mental health'],
      suggestions: ['Keep tracking your moods', 'Celebrate small wins']
    };
  }
}

const systemPrompts = {
  spiritual: `You are a compassionate spiritual wellness companion rooted in Christian faith. 
You offer gentle guidance, scriptural encouragement when appropriate, and emotional support. 
You are warm, empathetic, and focused on holistic wellbeing—mind, body, and spirit.
Never provide medical or professional counseling advice. 
If someone is in crisis, always direct them to professional help (988 Suicide & Crisis Lifeline).
Keep responses concise (2-4 sentences) and deeply supportive.`,

  general: `You are a helpful, friendly AI assistant. You can engage in casual conversation, 
answer questions, provide general advice, tell jokes, help with relaxation techniques, 
and chat about almost any topic. Be warm, engaging, and natural in your responses.
Never provide medical, legal, or professional advice. 
If someone expresses crisis or self-harm thoughts, immediately direct them to professional help (988).
Keep responses concise (2-4 sentences) unless the user asks for more detail.`
};

// Fallback responses when AI is unavailable
const fallbackResponses = {
  spiritual: [
    "I'm here to listen and support you on your journey. Tell me more about what's on your heart.",
    "Thank you for sharing that with me. Remember, you are deeply valued and loved.",
    "I hear you. Would you like to explore what scripture says about finding peace in difficult times?",
    "Your feelings are valid. Let's work through this together with patience and compassion.",
    "I'm glad you reached out. Sometimes just sharing what's on our mind can bring relief.",
  ],
  general: [
    "I'm here to chat! Tell me more about what's on your mind.",
    "Thanks for sharing that. What else would you like to talk about?",
    "I appreciate you opening up. I'm here to listen and support you.",
    "That sounds interesting! Can you tell me more about it?",
    "I'm here for you. What's been the biggest thing on your mind lately?",
  ]
};

function getFallbackResponse(mode: 'spiritual' | 'general'): string {
  const responses = fallbackResponses[mode];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate chat response
 */
export async function generateChatResponse(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  mode: 'spiritual' | 'general' = 'spiritual'
): Promise<string> {
  // If no API key, return fallback response immediately
  console.log('[generateChatResponse] Starting, hasValidApiKey:', hasValidApiKey);
  if (!hasValidApiKey) {
    console.warn('[generateChatResponse] No OpenRouter API key - using fallback response');
    return getFallbackResponse(mode);
  }

  try {
    const content = await callAIWithTimeout([
      {
        role: 'system',
        content: systemPrompts[mode]
      },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ], DEFAULT_MODEL, 10000); // 10 second timeout

    return content || getFallbackResponse(mode);
  } catch (error) {
    console.error('Chat response error:', error);
    return getFallbackResponse(mode);
  }
}

/**
 * Generate personalized suggestions based on context
 */
export async function generateSuggestions(
  context: 'mood' | 'goal' | 'crisis' | 'general',
  data: any
): Promise<string[]> {
  const fallbackSuggestions: Record<string, string[]> = {
    mood: ['Practice deep breathing', 'Take a short walk', 'Write in a journal'],
    goal: ['Break it into smaller steps', 'Celebrate small wins', 'Set a specific time to work on it'],
    crisis: ['Focus on your breathing', 'Ground yourself with 5-4-3-2-1 technique', 'Reach out to a trusted friend'],
    general: ['Take a moment to rest', 'Practice gratitude', 'Do something kind for yourself']
  };

  if (!hasValidApiKey) {
    return fallbackSuggestions[context];
  }

  const prompts: Record<string, string> = {
    mood: 'Suggest 3 coping strategies for someone feeling this way. Return JSON array of strings.',
    goal: 'Suggest 3 actionable next steps for this goal. Return JSON array of strings.',
    crisis: 'Suggest 3 immediate grounding techniques. Return JSON array of strings.',
    general: 'Suggest 3 general wellness practices. Return JSON array of strings.'
  };

  try {
    const content = await callAIWithTimeout([
      {
        role: 'system',
        content: prompts[context] || prompts.general
      },
      {
        role: 'user',
        content: JSON.stringify(data)
      }
    ], FALLBACK_MODEL, 8000);

    if (!content) throw new Error('No response from AI');
    
    const suggestions = JSON.parse(content);
    return Array.isArray(suggestions) ? suggestions.slice(0, 3) : fallbackSuggestions[context];
  } catch (error) {
    console.error('Failed to generate suggestions:', error);
    return fallbackSuggestions[context];
  }
}
