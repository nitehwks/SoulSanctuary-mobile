// =============================================================================
// EXTRACT INSIGHTS FROM CONVERSATION
// Analyzes user conversations to extract psychological, spiritual, and behavioral insights
// =============================================================================

import { openai, hasValidApiKey, ANALYSIS_MODEL, ConversationContext, ExtractedInsights, buildAnalysisPrompt } from './promptBuilder';
import { logError, logInfo } from '../logger';
import { encryptProfileData } from '../profileEncryption';
import { db } from '../../db';
import { conversationInsights } from '../../db/userProfileSchema';
import { eq } from 'drizzle-orm';
import { updateUserProfile } from './profileUpdaters';

/**
 * Analyze a conversation and extract comprehensive insights.
 * This is called after each significant conversation to update the user's profile.
 * @param context - The conversation context to analyze
 * @returns Extracted insights from the conversation
 */
export async function analyzeConversation(context: ConversationContext): Promise<ExtractedInsights> {
  // Return default insights if no API key
  if (!hasValidApiKey) {
    logInfo('No OpenRouter API key - skipping conversation analysis');
    return getDefaultInsights();
  }

  try {
    logInfo(`Analyzing conversation for user ${context.userId}`);
    
    // Get user's existing profile for context
    const existingProfile = await getExistingProfile(context.userId);
    
    // Build analysis prompt
    const analysisPrompt = buildAnalysisPrompt(context, existingProfile);
    
    // Call AI for analysis
    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a clinical psychologist and spiritual counselor analyzing a conversation.
Your task is to extract insights about the user's mental health, spiritual state, relationships, and behavioral patterns.
Be thorough but respectful. Focus on patterns that could help provide better support.
Respond in JSON format only.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      response_format: { type: 'json_object' },
    });
    
    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Validate and structure the insights
    const insights: ExtractedInsights = {
      emotionalThemes: analysis.emotionalThemes || [],
      spiritualThemes: analysis.spiritualThemes || [],
      behavioralThemes: analysis.behavioralThemes || [],
      psychologicalIndicators: analysis.psychologicalIndicators || {},
      substanceIndicators: analysis.substanceIndicators || { mentionsSubstances: false, recoveryLanguage: false },
      relationshipDynamics: analysis.relationshipDynamics || { mentionsRelationships: false, isolationIndicators: false },
      spiritualState: analysis.spiritualState || { faithStruggle: false, seekingConnection: false, comfortFromScripture: false },
      userPreferences: analysis.userPreferences || { communicationStyle: 'gentle', respondsToScripture: 'neutral', engagementLevel: 'medium' },
      breakthroughMoments: analysis.breakthroughMoments || [],
      recommendedApproach: analysis.recommendedApproach || 'Continue gentle, supportive approach.',
    };
    
    // Save insights to database
    await saveConversationInsights(context.userId, context.sessionId, insights);
    
    // Update user profiles with new insights
    await updateUserProfile(context.userId, insights, existingProfile);
    
    return insights;
  } catch (error) {
    logError('Conversation analysis failed', error as Error);
    // Return default insights on error
    return getDefaultInsights();
  }
}

async function getExistingProfile(userId: string): Promise<any> {
  try {
    const { userPsychologicalProfile, userSpiritualProfile, userBehavioralPatterns, userSubstanceProfile, userRelationships } = await import('../../db/userProfileSchema');
    const [psychological, spiritual, behavioral, substance, relationships] = await Promise.all([
      db.select().from(userPsychologicalProfile).where(eq(userPsychologicalProfile.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(userSpiritualProfile).where(eq(userSpiritualProfile.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(userBehavioralPatterns).where(eq(userBehavioralPatterns.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(userSubstanceProfile).where(eq(userSubstanceProfile.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(userRelationships).where(eq(userRelationships.userId, userId)),
    ]);
    
    return { psychological, spiritual, behavioral, substance, relationships };
  } catch (error) {
    logError('Failed to get existing profile', error as Error);
    return { psychological: null, spiritual: null, behavioral: null, substance: null, relationships: [] };
  }
}

async function saveConversationInsights(
  userId: string,
  sessionId: string | undefined,
  insights: ExtractedInsights
): Promise<void> {
  try {
    const encrypted = encryptProfileData(userId, insights);
    
    await db.insert(conversationInsights).values({
      userId,
      chatSessionId: sessionId || null,
      encryptedInsights: encrypted,
      emotionalThemes: insights.emotionalThemes,
      spiritualThemes: insights.spiritualThemes,
      behavioralThemes: insights.behavioralThemes,
      overallSentiment: calculateSentiment(insights),
      depressionIndicators: false,
      anxietyIndicators: false,
      traumaIndicators: insights.psychologicalIndicators.traumaIndicators || false,
      crisisIndicators: (insights.psychologicalIndicators.crisisRisk || 0) > 7,
      substanceIndicators: insights.substanceIndicators.mentionsSubstances,
      breakthroughMoments: insights.breakthroughMoments,
    });
  } catch (error) {
    logError('Failed to save conversation insights', error as Error);
  }
}

function calculateSentiment(insights: ExtractedInsights): number {
  let score = 0;
  if (insights.spiritualState.comfortFromScripture) score += 0.3;
  if (insights.spiritualState.seekingConnection) score += 0.2;
  if (insights.relationshipDynamics.relationshipQuality === 'positive') score += 0.2;
  if (insights.psychologicalIndicators.depressionLevel && insights.psychologicalIndicators.depressionLevel > 5) score -= 0.3;
  if (insights.psychologicalIndicators.anxietyLevel && insights.psychologicalIndicators.anxietyLevel > 5) score -= 0.2;
  return Math.max(-1, Math.min(1, score));
}

function getDefaultInsights(): ExtractedInsights {
  return {
    emotionalThemes: [],
    spiritualThemes: [],
    behavioralThemes: [],
    psychologicalIndicators: {},
    substanceIndicators: { mentionsSubstances: false, recoveryLanguage: false },
    relationshipDynamics: { mentionsRelationships: false, isolationIndicators: false },
    spiritualState: { faithStruggle: false, seekingConnection: false, comfortFromScripture: false },
    userPreferences: { communicationStyle: 'gentle', respondsToScripture: 'neutral', engagementLevel: 'medium' },
    breakthroughMoments: [],
    recommendedApproach: 'Continue gentle, supportive approach.',
  };
}
