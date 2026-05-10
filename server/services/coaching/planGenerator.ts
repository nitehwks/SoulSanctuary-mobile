// =============================================================================
// COACHING PLAN GENERATION
// =============================================================================

import { openai, COACHING_MODEL, CoachingPlan, CoachingMilestone } from './frameworks';
import { logError, logInfo } from '../logger';
import { db } from '../../db';
import { eq, desc } from 'drizzle-orm';
import { decryptProfileData } from '../profileEncryption';

/**
 * Generate a personalized coaching plan based on user's comprehensive profile
 * @param userId - The user's unique identifier
 * @returns A fully generated coaching plan
 */
export async function generateCoachingPlan(userId: string): Promise<CoachingPlan> {
  try {
    logInfo(`Generating coaching plan for user ${userId}`);
    
    // Gather all user data
    const userData = await gatherUserData(userId);
    
    // Analyze and determine best approach
    const analysis = await analyzeForCoaching(userData);
    
    // Generate plan with AI assistance
    const plan = await createPlanWithAI(userId, userData, analysis);
    
    // Save plan to database
    await saveCoachingPlan(userId, plan);
    
    return plan;
  } catch (error) {
    logError('Failed to generate coaching plan', error as Error);
    throw new Error('Unable to generate coaching plan at this time');
  }
}

/**
 * Gather all relevant user data for plan generation
 * @param userId - The user's unique identifier
 * @returns Aggregated user profile data
 */
export async function gatherUserData(userId: string) {
  try {
    // Import tables here to avoid circular dependencies
    const { userPsychologicalProfile, userSpiritualProfile, userBehavioralPatterns, userSubstanceProfile, userInteractionMemory, conversationInsights } = await import('../../db/userProfileSchema');
    
    const [psychProfile, spiritualProfile, behavioralPatterns, substanceProfile, interactionMemory, recentInsights] = await Promise.all([
      db.select().from(userPsychologicalProfile).where(eq(userPsychologicalProfile.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(userSpiritualProfile).where(eq(userSpiritualProfile.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(userBehavioralPatterns).where(eq(userBehavioralPatterns.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(userSubstanceProfile).where(eq(userSubstanceProfile.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(userInteractionMemory).where(eq(userInteractionMemory.userId, userId)).limit(1).then(r => r[0]),
      db.select().from(conversationInsights).where(eq(conversationInsights.userId, userId)).orderBy(desc(conversationInsights.analyzedAt)).limit(10),
    ]);
    
    return {
      psychological: psychProfile ? decryptProfileData<any>(userId, psychProfile.encryptedProfileData) : {},
      spiritual: spiritualProfile ? decryptProfileData<any>(userId, spiritualProfile.encryptedProfileData) : {},
      behavioral: behavioralPatterns ? decryptProfileData<any>(userId, behavioralPatterns.encryptedPatternsData) : {},
      substance: substanceProfile ? decryptProfileData<any>(userId, substanceProfile.encryptedProfileData) : {},
      interaction: interactionMemory ? decryptProfileData<any>(userId, interactionMemory.encryptedMemoryData) : {},
      recentInsights,
      riskLevel: calculateRiskLevel(psychProfile, behavioralPatterns),
    };
  } catch (error) {
    logError('Failed to gather user data', error as Error);
    // Return empty data on error
    return {
      psychological: {},
      spiritual: {},
      behavioral: {},
      substance: {},
      interaction: {},
      recentInsights: [],
      riskLevel: 'low',
    };
  }
}

function calculateRiskLevel(psych: any, behavioral: any): string {
  let score = 0;
  if (psych?.crisisRisk > 7) score += 3;
  if (psych?.depressionLevel > 7) score += 2;
  if (psych?.anxietyLevel > 8) score += 1;
  if (behavioral?.crisisRisk > 7) score += 2;
  
  if (score >= 5) return 'critical';
  if (score >= 3) return 'high';
  if (score >= 1) return 'moderate';
  return 'low';
}

/**
 * Analyze user data to determine therapeutic approach
 * @param userData - Aggregated user profile data
 * @returns Recommended methods and primary focus areas
 */
async function analyzeForCoaching(userData: any) {
  const methods: string[] = [];
  const primaryFocus: string[] = [];
  
  // Determine therapeutic methods based on presentation
  if (userData.psychological.traumaAcknowledged) {
    methods.push('trauma_informed');
    primaryFocus.push('trauma_recovery');
  }
  
  if (userData.substance?.hasSubstanceHistory) {
    methods.push('twelve_step');
    methods.push('mindfulness');
    primaryFocus.push('addiction_recovery');
  }
  
  if (userData.psychological.anxietyHistory?.some((a: number) => a > 6)) {
    methods.push('cbt');
    methods.push('mindfulness');
    primaryFocus.push('anxiety_management');
  }
  
  if (userData.psychological.depressionHistory?.some((d: number) => d > 6)) {
    methods.push('cbt');
    methods.push('act');
    primaryFocus.push('depression_recovery');
  }
  
  if (userData.psychological.emotionalThemes?.includes('emotional_dysregulation')) {
    methods.push('dbt');
    primaryFocus.push('emotional_regulation');
  }
  
  // Always include spiritual integration
  if (!methods.includes('mindfulness')) {
    methods.push('mindfulness');
  }
  
  // Add spiritual growth as secondary
  if (!primaryFocus.includes('spiritual_growth')) {
    primaryFocus.push('spiritual_growth');
  }
  
  return { methods, primaryFocus };
}

/**
 * Create the actual plan using AI
 * @param userId - The user's unique identifier
 * @param userData - Aggregated user profile data
 * @param analysis - Recommended therapeutic methods and focus areas
 * @returns A coaching plan generated with AI assistance
 */
async function createPlanWithAI(
  userId: string, 
  userData: any, 
  analysis: { methods: string[]; primaryFocus: string[] }
): Promise<CoachingPlan> {
  
  const prompt = `Create a comprehensive, personalized coaching plan for a user with the following profile:

THERAPEUTIC METHODS TO USE: ${analysis.methods.join(', ')}
PRIMARY FOCUS AREAS: ${analysis.primaryFocus.join(', ')}

USER PROFILE SUMMARY:
- Anxiety History: ${JSON.stringify(userData.psychological.anxietyHistory?.slice(-5) || [])}
- Depression History: ${JSON.stringify(userData.psychological.depressionHistory?.slice(-5) || [])}
- Trauma Acknowledged: ${userData.psychological.traumaAcknowledged}
- Substance History: ${userData.substance?.hasSubstanceHistory}
- In Recovery: ${userData.substance?.inRecovery}
- Faith Journey Stage: ${userData.spiritual?.faithJourneyStage}
- Prayer Life: ${userData.spiritual?.prayerLife}
- Spiritual Struggles: ${JSON.stringify(userData.spiritual?.spiritualThemes?.slice(-5) || [])}
- Preferred Communication: ${userData.interaction?.communicationStyle}
- Responds to Scripture: ${userData.interaction?.responseToScripture}

RISK LEVEL: ${userData.riskLevel}

Create a 12-week coaching plan with:
1. Weekly milestones (category, therapeutic method, exercises)
2. Scripture support for each phase
3. Integration of the specified therapeutic methods
4. Spiritual practices that align with their faith journey

Respond in JSON format matching the CoachingPlan interface.`;

  const completion = await openai.chat.completions.create({
    model: COACHING_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a clinical psychologist and spiritual director creating a personalized treatment plan. 
Integrate evidence-based therapeutic methods (CBT, DBT, ACT, Trauma-Informed, 12-Step) with biblical wisdom.
Each milestone should have specific, actionable exercises with scripture support.
Consider the user's risk level and tailor intensity appropriately.`
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
  });
  
  const aiPlan = JSON.parse(completion.choices[0].message.content || '{}');
  
  return {
    id: crypto.randomUUID(),
    userId,
    version: 1,
    primaryFocus: analysis.primaryFocus,
    therapeuticMethods: analysis.methods,
    milestones: aiPlan.milestones || generateDefaultMilestones(analysis),
    spiritualPractices: aiPlan.spiritualPractices || ['daily_devotional', 'prayer', 'gratitude'],
    scriptureFocus: aiPlan.scriptureFocus || deriveScriptureFocus(analysis.primaryFocus),
    riskLevel: userData.riskLevel,
  };
}

function generateDefaultMilestones(analysis: { methods: string[]; primaryFocus: string[] }): CoachingMilestone[] {
  // Generate basic milestones if AI fails
  return [
    {
      id: crypto.randomUUID(),
      category: 'foundation',
      title: 'Building Safety and Trust',
      description: 'Establishing a foundation of safety and beginning to build trust with the process',
      therapeuticMethod: analysis.methods[0] || 'mindfulness',
      scriptureSupport: ['Psalm 91:1-2'],
      exercises: [
        { name: 'Safe Place Visualization', type: 'meditation', description: 'Guided imagery of a safe place with God', duration: 15 }
      ],
      targetWeek: 1,
      status: 'pending',
    },
  ];
}

function deriveScriptureFocus(primaryFocus: string[]): string[] {
  const scriptureMap: Record<string, string[]> = {
    'anxiety_management': ['Philippians 4:6-7', 'Matthew 6:25-34', '1 Peter 5:7'],
    'depression_recovery': ['Psalm 42:11', 'Isaiah 41:10', 'Psalm 34:18'],
    'trauma_recovery': ['Psalm 147:3', 'Psalm 91:1-2', 'Isaiah 61:1-3'],
    'addiction_recovery': ['1 Corinthians 10:13', 'James 5:16', 'Galatians 5:1'],
    'emotional_regulation': ['Proverbs 25:28', 'Galatians 5:22-23', 'James 1:19-20'],
    'spiritual_growth': ['Romans 12:2', 'Ephesians 4:22-24', 'Colossians 3:1-17'],
  };
  
  const scriptures: string[] = [];
  primaryFocus.forEach(focus => {
    if (scriptureMap[focus]) {
      scriptures.push(...scriptureMap[focus]);
    }
  });
  
  return scriptures.length > 0 ? scriptures : ['Psalm 23', 'Philippians 4:6-7', 'Isaiah 41:10'];
}

async function saveCoachingPlan(userId: string, plan: CoachingPlan): Promise<void> {
  try {
    const { coachingPlans, coachingMilestones } = await import('../../db/userProfileSchema');
    const encrypted = JSON.stringify(plan); // In production, encrypt this
    
    // Check if plan exists
    const existingPlan = await db.select().from(coachingPlans)
      .where(eq(coachingPlans.userId, userId))
      .limit(1)
      .then(r => r[0]);
    
    if (existingPlan) {
      // Update existing
      await db.update(coachingPlans).set({
        encryptedPlanData: encrypted,
        planVersion: plan.version,
        primaryFocus: plan.primaryFocus,
        therapeuticMethods: plan.therapeuticMethods,
        goalsTotal: plan.milestones.length,
        updatedAt: new Date(),
      }).where(eq(coachingPlans.id, existingPlan.id));
    } else {
      // Insert new
      await db.insert(coachingPlans).values({
        id: plan.id,
        userId,
        encryptedPlanData: encrypted,
        planVersion: plan.version,
        primaryFocus: plan.primaryFocus,
        therapeuticMethods: plan.therapeuticMethods,
        overallProgress: 0,
        goalsTotal: plan.milestones.length,
      });
    }
    
    // Save milestones
    for (const milestone of plan.milestones) {
      await db.insert(coachingMilestones).values({
        planId: plan.id,
        encryptedMilestoneData: JSON.stringify(milestone),
        category: milestone.category,
        therapeuticMethod: milestone.therapeuticMethod,
        status: 'pending',
        order: milestone.targetWeek,
        targetDate: new Date(Date.now() + milestone.targetWeek * 7 * 24 * 60 * 60 * 1000),
        relatedScriptures: milestone.scriptureSupport,
      });
    }
  } catch (error) {
    logError('Failed to save coaching plan', error as Error);
    throw error;
  }
}
