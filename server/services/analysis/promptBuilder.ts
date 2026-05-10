// =============================================================================
// ANALYSIS PROMPT BUILDER
// =============================================================================

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'https://soulsanctuary.app',
    'X-Title': 'SoulSanctuary',
  },
});

/** Check if API key is configured */
export const hasValidApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-');

/** Model used for conversation analysis */
export const ANALYSIS_MODEL = 'anthropic/claude-3.5-sonnet';

export { openai };

// =============================================================================
// TYPES
// =============================================================================

/** Context for a conversation to be analyzed */
export interface ConversationContext {
  messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[];
  userId: string;
  sessionId?: string;
}

/** Insights extracted from a conversation */
export interface ExtractedInsights {
  emotionalThemes: string[];
  spiritualThemes: string[];
  behavioralThemes: string[];
  psychologicalIndicators: {
    anxietyLevel?: number;
    depressionLevel?: number;
    traumaIndicators?: boolean;
    crisisRisk?: number;
  };
  substanceIndicators: {
    mentionsSubstances: boolean;
    recoveryLanguage: boolean;
    relapseRisk?: number;
  };
  relationshipDynamics: {
    mentionsRelationships: boolean;
    relationshipQuality?: 'positive' | 'negative' | 'conflicted';
    isolationIndicators: boolean;
  };
  spiritualState: {
    faithStruggle: boolean;
    seekingConnection: boolean;
    comfortFromScripture: boolean;
    prayerLife?: 'active' | 'struggling' | 'absent';
  };
  userPreferences: {
    communicationStyle: 'direct' | 'gentle' | 'clinical' | 'scripture_focused';
    respondsToScripture: 'positive' | 'neutral' | 'resistant';
    engagementLevel: 'high' | 'medium' | 'low';
  };
  breakthroughMoments: string[];
  recommendedApproach: string;
}

// =============================================================================
// PROMPT BUILDERS
// =============================================================================

/**
 * Build the analysis prompt for conversation analysis
 * @param context - The conversation context to analyze
 * @param existingProfile - The user's existing profile data
 * @returns A formatted prompt string for the AI
 */
export function buildAnalysisPrompt(context: ConversationContext, existingProfile: any): string {
  const conversationText = context.messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');
  
  return `Analyze the following conversation between a user and their AI spiritual companion.

CONVERSATION:
${conversationText}

${existingProfile.psychological ? 'The user has an existing psychological profile that should inform this analysis.' : ''}

Please extract and return a JSON object with the following structure:
{
  "emotionalThemes": ["array of emotional themes present"],
  "spiritualThemes": ["array of spiritual themes"],
  "behavioralThemes": ["array of behavioral patterns observed"],
  "psychologicalIndicators": {
    "anxietyLevel": 0-10 or null,
    "depressionLevel": 0-10 or null,
    "traumaIndicators": boolean,
    "crisisRisk": 0-10 or null
  },
  "substanceIndicators": {
    "mentionsSubstances": boolean,
    "recoveryLanguage": boolean,
    "relapseRisk": 0-10 or null
  },
  "relationshipDynamics": {
    "mentionsRelationships": boolean,
    "relationshipQuality": "positive", "negative", "conflicted", or null,
    "isolationIndicators": boolean
  },
  "spiritualState": {
    "faithStruggle": boolean,
    "seekingConnection": boolean,
    "comfortFromScripture": boolean,
    "prayerLife": "active", "struggling", "absent", or null
  },
  "userPreferences": {
    "communicationStyle": "direct", "gentle", "clinical", or "scripture_focused",
    "respondsToScripture": "positive", "neutral", or "resistant",
    "engagementLevel": "high", "medium", or "low"
  },
  "breakthroughMoments": ["array of significant moments"],
  "recommendedApproach": "string describing recommended therapeutic approach"
}

Be thorough and specific. Consider DSM-5 criteria for mental health assessments. Identify biblical themes when present.`;
}
