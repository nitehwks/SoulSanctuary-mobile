// =============================================================================
// CURRICULUM GENERATION
// =============================================================================

import { openai, COACHING_MODEL } from './frameworks';
import { gatherUserData } from './planGenerator';

/**
 * Generate personalized curriculum content based on user's needs
 * @param userId - The user's unique identifier
 * @param topic - The curriculum topic to generate content for
 * @returns Generated curriculum content with exercises and scriptures
 */
export async function generateCurriculumContent(
  userId: string,
  topic: string
): Promise<{
  content: string;
  exercises: any[];
  scriptures: string[];
}> {
  const userData = await gatherUserData(userId);
  
  const prompt = `Create a personalized lesson on "${topic}" for a user with the following profile:

- Therapeutic needs: ${userData.psychological.emotionalThemes?.slice(-5).join(', ')}
- Faith journey: ${userData.spiritual?.faithJourneyStage}
- Communication style: ${userData.interaction?.communicationStyle}
- Responds to scripture: ${userData.interaction?.responseToScripture}

Create content that:
1. Integrates CBT/DBT/Mindfulness principles with biblical wisdom
2. Includes 2-3 practical exercises
3. References 2-3 relevant scriptures
4. Is written in an ${userData.interaction?.communicationStyle || 'gentle'} tone

Return JSON with content, exercises array, and scriptures array.`;

  const completion = await openai.chat.completions.create({
    model: COACHING_MODEL,
    messages: [
      { role: 'system', content: 'You are creating premium curriculum content that integrates clinical therapy with spiritual formation.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
  });
  
  return JSON.parse(completion.choices[0].message.content || '{}');
}
