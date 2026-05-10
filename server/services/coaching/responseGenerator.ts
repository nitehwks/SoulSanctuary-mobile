// =============================================================================
// COACH MODE RESPONSE GENERATION
// =============================================================================

import { openai, hasValidApiKey, COACHING_MODEL, THERAPEUTIC_FRAMEWORKS, CoachContext } from './frameworks';
import { logError, logInfo } from '../logger';
import { db } from '../../db';
import { eq } from 'drizzle-orm';
import { gatherUserData } from './planGenerator';

/**
 * Generate a coaching response that integrates user's profile and therapeutic methods
 * @param context - The coach context including user message and conversation history
 * @returns A coaching response with optional scripture, exercise, and technique recommendations
 */
export async function generateCoachResponse(context: CoachContext): Promise<{
  response: string;
  suggestedScripture?: string;
  recommendedExercise?: string;
  technique?: string;
}> {
  // Return fallback if no API key
  if (!hasValidApiKey) {
    logInfo('No OpenRouter API key - using fallback coach response');
    return {
      response: "I'm here to walk alongside you. While I'm unable to access my full coaching abilities right now, I want you to know that you are seen, valued, and never alone on this journey. What's on your heart today?",
      suggestedScripture: "Psalm 46:1 - God is our refuge and strength, an ever-present help in trouble.",
      recommendedExercise: "Take 5 deep breaths, breathing in peace and breathing out worry.",
      technique: "Grounding"
    };
  }

  try {
    // Gather user context
    const userData = await gatherUserData(context.userId);
    const activePlan = await getActivePlan(context.userId);
    
    // Build comprehensive prompt
    const prompt = buildCoachPrompt(context, userData, activePlan);
    
    const completion = await openai.chat.completions.create({
      model: COACHING_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a spiritual companion and mental health coach who knows this user deeply.
You have access to their psychological profile, spiritual journey, and personalized coaching plan.

THERAPEUTIC FRAMEWORKS TO DRAW FROM:
${activePlan?.therapeuticMethods.map((m: string) => THERAPEUTIC_FRAMEWORKS[m]?.description).join('\n')}

YOUR ROLE:
- Provide clinically-informed, spiritually-grounded guidance
- Reference specific therapeutic techniques when appropriate
- Offer relevant scripture that connects to their current need
- Suggest practical exercises from their coaching plan
- Speak with the wisdom of someone who truly knows them
- Never provide medical advice or diagnose

COMMUNICATION STYLE: ${userData.interaction?.communicationStyle || 'gentle'}
RESPONSE TO SCRIPTURE: ${userData.interaction?.responseToScripture || 'positive'}`
        },
        { role: 'user', content: prompt }
      ],
    });
    
    const response = completion.choices[0].message.content || 'I\'m here with you. Tell me more.';
    
    // Extract recommendations using AI again or regex
    const recommendations = await extractRecommendations(response, userData);
    
    return {
      response,
      suggestedScripture: recommendations.scripture,
      recommendedExercise: recommendations.exercise,
      technique: recommendations.technique,
    };
  } catch (error) {
    logError('Coach response generation failed', error as Error);
    return { response: 'I appreciate you sharing that with me. I\'m here to support you.' };
  }
}

function buildCoachPrompt(context: CoachContext, userData: any, plan: any): string {
  return `USER MESSAGE: "${context.message}"

USER PROFILE CONTEXT:
- Current emotional state: Recent themes include ${userData.psychological.emotionalThemes?.slice(-3).join(', ')}
- Spiritual state: ${userData.spiritual?.faithJourneyStage}, prayer life: ${userData.spiritual?.prayerLife}
- Effective approaches: ${userData.interaction?.effectiveInterventions?.slice(-3).join(', ')}
- Sensitive topics to approach carefully: ${userData.interaction?.sensitiveTopics?.join(', ') || 'none identified'}

ACTIVE COACHING PLAN:
- Primary focus: ${plan?.primaryFocus.join(', ')}
- Methods: ${plan?.therapeuticMethods.join(', ')}
- Current milestone: ${plan?.milestones?.find((m: any) => m.status === 'in_progress')?.title || 'Building foundation'}

CURRENT CONVERSATION:
${context.conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Provide a response that:
1. Acknowledges their current emotional/spiritual state
2. Uses appropriate therapeutic technique
3. Offers relevant scripture if they respond well to it
4. Suggests a practical exercise from their plan if applicable
5. Speaks as someone who truly knows and cares for them`;
}

async function extractRecommendations(
  response: string, 
  _userData: any
): Promise<{ scripture?: string; exercise?: string; technique?: string }> {
  // Simple extraction - in production, use more sophisticated parsing
  const scriptureMatch = response.match(/([1-3]?\s?[A-Za-z]+\s\d+:\d+[-\d]*)/);
  
  return {
    scripture: scriptureMatch ? scriptureMatch[1] : undefined,
    exercise: undefined, // Would extract from response
    technique: undefined, // Would extract from response
  };
}

async function getActivePlan(userId: string): Promise<any> {
  try {
    const { coachingPlans } = await import('../../db/userProfileSchema');
    const plan = await db.select().from(coachingPlans)
      .where(eq(coachingPlans.userId, userId))
      .limit(1)
      .then(r => r[0]);
    
    if (plan) {
      return JSON.parse(plan.encryptedPlanData);
    }
  } catch (error) {
    logError('Failed to get active plan', error as Error);
  }
  
  return null;
}
