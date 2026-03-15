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
 * Generate AI insight for mood entries
 */
export async function generateMoodInsight(moodEntries: MoodEntry[]): Promise<string> {
  try {
    const entriesText = moodEntries.map(e => 
      `Mood: ${e.mood}/5, Emotions: ${e.emotions.join(', ')}, Note: ${e.note || 'N/A'}, Date: ${e.timestamp}`
    ).join('\n');

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate mental health AI. Provide brief, insightful observations about mood patterns. Be supportive but not clinical. Keep responses to 2-3 sentences.'
        },
        {
          role: 'user',
          content: `Analyze these mood entries and provide a gentle insight:\n${entriesText}`
        }
      ],
    });

    return completion.choices[0].message.content || 'Keep tracking your moods to see patterns emerge.';
  } catch (error) {
    console.error('Failed to generate mood insight:', error);
    return 'We\'re here to support you. Consider talking to someone you trust about how you\'re feeling.';
  }
}

/**
 * Generate AI coaching for a goal
 */
export async function generateGoalCoaching(goal: Goal): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a motivational coach specializing in mental health and personal growth. Provide encouraging, actionable advice. Keep it under 2 sentences.'
        },
        {
          role: 'user',
          content: `Goal: ${goal.title}\nDescription: ${goal.description || 'N/A'}\nCategory: ${goal.category}\nProgress: ${goal.progress}%\nStatus: ${goal.status}`
        }
      ],
    });

    return completion.choices[0].message.content || 'Every step forward counts. You\'re doing great!';
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
    low: ['sad', 'depressed', 'anxious', 'stressed', 'overwhelmed']
  };

  const lowerMessage = message.toLowerCase();

  // Quick keyword check first
  for (const [severity, keywords] of Object.entries(crisisKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isCrisis: true, severity: severity as any };
    }
  }

  // Use AI for more nuanced detection
  try {
    const completion = await openai.chat.completions.create({
      model: FALLBACK_MODEL, // Use faster model for detection
      messages: [
        {
          role: 'system',
          content: 'Analyze if this message indicates a mental health crisis. Respond with ONLY a JSON object: {"isCrisis": boolean, "severity": "low" | "medium" | "high" | "critical"}'
        },
        {
          role: 'user',
          content: message
        }
      ],
    });

    const response = completion.choices[0].message.content || '{}';
    const result = JSON.parse(response);
    return {
      isCrisis: result.isCrisis || false,
      severity: result.severity || 'low'
    };
  } catch (error) {
    console.error('Crisis detection error:', error);
    return { isCrisis: false, severity: 'low' };
  }
}

/**
 * Generate insights from memory patterns
 */
export async function generateMemoryInsights(memories: Memory[]): Promise<string[]> {
  try {
    const memoriesText = memories.map(m => 
      `${m.type}: ${m.content} (sentiment: ${m.sentiment}, date: ${m.timestamp})`
    ).join('\n');

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Analyze these memories and identify patterns or insights. Return a JSON array of 3-5 insight strings. Be gentle and supportive.'
        },
        {
          role: 'user',
          content: `Memories:\n${memoriesText}`
        }
      ],
    });

    const response = completion.choices[0].message.content || '[]';
    const insights = JSON.parse(response);
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
  try {
    const avgMood = moods.reduce((sum, m) => sum + m.mood, 0) / moods.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Generate a compassionate weekly mental health summary. Return JSON: { summary: string, highlights: string[], suggestions: string[] }'
        },
        {
          role: 'user',
          content: `Weekly Stats:\n- Average mood: ${avgMood.toFixed(1)}/5\n- Mood entries: ${moods.length}\n- Goals completed: ${completedGoals}/${goals.length}\n- Memories recorded: ${memories.length}`
        }
      ],
    });

    const response = completion.choices[0].message.content || '{}';
    const result = JSON.parse(response);
    
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

/**
 * Generate chat response
 */
export async function generateChatResponse(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  mode: 'spiritual' | 'general' = 'spiritual'
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompts[mode]
        },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
    });

    return completion.choices[0].message.content || 'I\'m here to listen. Tell me more about how you\'re feeling.';
  } catch (error) {
    console.error('Chat response error:', error);
    return 'I appreciate you sharing that with me. How else can I support you today?';
  }
}

/**
 * Generate personalized suggestions based on context
 */
export async function generateSuggestions(
  context: 'mood' | 'goal' | 'crisis' | 'general',
  data: any
): Promise<string[]> {
  const prompts: Record<string, string> = {
    mood: 'Suggest 3 coping strategies for someone feeling this way. Return JSON array of strings.',
    goal: 'Suggest 3 actionable next steps for this goal. Return JSON array of strings.',
    crisis: 'Suggest 3 immediate grounding techniques. Return JSON array of strings.',
    general: 'Suggest 3 general wellness practices. Return JSON array of strings.'
  };

  try {
    const completion = await openai.chat.completions.create({
      model: FALLBACK_MODEL,
      messages: [
        {
          role: 'system',
          content: prompts[context] || prompts.general
        },
        {
          role: 'user',
          content: JSON.stringify(data)
        }
      ],
    });

    const response = completion.choices[0].message.content || '[]';
    const suggestions = JSON.parse(response);
    return Array.isArray(suggestions) ? suggestions : ['Take a deep breath', 'Go for a walk', 'Reach out to a friend'];
  } catch (error) {
    console.error('Failed to generate suggestions:', error);
    return ['Practice deep breathing', 'Take a walk', 'Journal your thoughts'];
  }
}
