// =============================================================================
// COMPREHENSIVE COACHING SERVICE
// Integrates CBT, DBT, Mindfulness, 12-Step, and Trauma-Informed approaches
// with biblical wisdom and personalized scripture guidance
// =============================================================================

import OpenAI from 'openai';
import { logError, logInfo } from './logger';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import { decryptProfileData } from './profileEncryption';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'https://soulsanctuary.app',
    'X-Title': 'SoulSanctuary',
  },
});

const COACHING_MODEL = 'anthropic/claude-3.5-sonnet';

// =============================================================================
// THERAPEUTIC FRAMEWORKS
// =============================================================================

export interface TherapeuticFramework {
  name: string;
  description: string;
  techniques: string[];
  biblicalIntegration: string;
  applicableConditions: string[];
}

export const THERAPEUTIC_FRAMEWORKS: Record<string, TherapeuticFramework> = {
  cbt: {
    name: 'Cognitive Behavioral Therapy (CBT)',
    description: 'Identifies and changes negative thought patterns and behaviors',
    techniques: [
      'Thought challenging and restructuring',
      'Behavioral activation',
      'Cognitive reframing',
      'Exposure therapy',
      'Activity scheduling',
    ],
    biblicalIntegration: 'Romans 12:2 - "Transforming the mind by renewing it". Taking thoughts captive (2 Cor 10:5).',
    applicableConditions: ['depression', 'anxiety', 'ptsd', 'ocd', 'phobias'],
  },
  dbt: {
    name: 'Dialectical Behavior Therapy (DBT)',
    description: 'Balances acceptance and change through mindfulness and skills training',
    techniques: [
      'Mindfulness skills (observe, describe, participate)',
      'Distress tolerance (TIPP, radical acceptance)',
      'Emotion regulation (check the facts, opposite action)',
      'Interpersonal effectiveness (DEAR MAN)',
    ],
    biblicalIntegration: 'Wise mind aligns with the "peace of God that transcends understanding" (Phil 4:7). Radical acceptance mirrors surrender to God\'s will.',
    applicableConditions: ['bpd', 'emotional_dysregulation', 'self_harm', 'suicidal_ideation'],
  },
  mindfulness: {
    name: 'Mindfulness-Based Therapy',
    description: 'Present-moment awareness and acceptance without judgment',
    techniques: [
      'Body scan meditation',
      'Breath awareness',
      'Loving-kindness meditation',
      'Urge surfing',
      'Grounding techniques (5-4-3-2-1)',
    ],
    biblicalIntegration: '"Be still and know that I am God" (Psalm 46:10). Present-moment awareness as form of prayer.',
    applicableConditions: ['anxiety', 'depression', 'addiction', 'chronic_pain'],
  },
  trauma_informed: {
    name: 'Trauma-Informed Care',
    description: 'Recognizes trauma impact and emphasizes safety, trust, and empowerment',
    techniques: [
      'Grounding and stabilization',
      'Window of tolerance awareness',
      'Somatic experiencing basics',
      'Safe place visualization',
      'Trauma narrative processing (when ready)',
    ],
    biblicalIntegration: 'Psalm 147:3 - "He heals the brokenhearted". God as refuge and fortress (Psalm 91).',
    applicableConditions: ['ptsd', 'complex_ptsd', 'childhood_trauma', 'abuse'],
  },
  twelve_step: {
    name: '12-Step Integration',
    description: 'Spiritual program for recovery from addiction',
    techniques: [
      'Admitting powerlessness',
      'Surrender to Higher Power',
      'Moral inventory',
      'Amends making',
      'Continued spiritual growth',
    ],
    biblicalIntegration: 'Step 2 (Higher Power) aligns with surrender to God. Step 4 (inventory) with Psalm 139:23-24.',
    applicableConditions: ['addiction', 'alcoholism', 'codependency'],
  },
  act: {
    name: 'Acceptance and Commitment Therapy (ACT)',
    description: 'Accepts difficult thoughts while committing to value-based action',
    techniques: [
      'Cognitive defusion',
      'Acceptance of internal experiences',
      'Values clarification',
      'Committed action',
      'Self-as-context',
    ],
    biblicalIntegration: 'Accepting suffering as part of the Christian walk (1 Peter 4:12-13). Living by values (Colossians 3:23).',
    applicableConditions: ['anxiety', 'depression', 'chronic_pain', 'ocd'],
  },
};

// =============================================================================
// BIBLICAL RESOURCE LIBRARY
// =============================================================================

export interface BiblicalResource {
  reference: string;
  text: string;
  theme: string;
  therapeuticApplication: string;
  context: string;
}

export const BIBLICAL_RESOURCES: BiblicalResource[] = [
  // Anxiety & Fear
  {
    reference: 'Philippians 4:6-7',
    text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    theme: 'anxiety',
    therapeuticApplication: 'Prayer and gratitude as anxiety management. The concept of a "peace that guards" like a soldier protects a city.',
    context: 'Paul writing from prison, teaching joy and peace despite circumstances',
  },
  {
    reference: 'Matthew 6:25-34',
    text: 'Therefore I tell you, do not worry about your life... Can any one of you by worrying add a single hour to your life?',
    theme: 'anxiety',
    therapeuticApplication: 'Cognitive reframing of worry. Focus on present moment (one day at a time).',
    context: 'Sermon on the Mount - Jesus teaching about trust in God\'s provision',
  },
  // Depression & Despair
  {
    reference: 'Psalm 42:11',
    text: 'Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.',
    theme: 'depression',
    therapeuticApplication: 'Self-dialogue technique. Speaking truth to downcast emotions. Hope as action.',
    context: 'Psalmist expressing deep longing for God while in distress',
  },
  {
    reference: 'Isaiah 41:10',
    text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    theme: 'depression',
    therapeuticApplication: 'Affirmation of presence and support. Countering isolation thoughts.',
    context: 'God\'s promise to Israel in exile',
  },
  // Trauma & Healing
  {
    reference: 'Psalm 147:3',
    text: 'He heals the brokenhearted and binds up their wounds.',
    theme: 'trauma',
    therapeuticApplication: 'Validation of pain. Hope for healing. God as healer.',
    context: 'Psalm praising God for His care and restoration',
  },
  {
    reference: 'Psalm 91:1-2',
    text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."',
    theme: 'trauma',
    therapeuticApplication: 'Safe place visualization. Imagining God as fortress/shelter.',
    context: 'Assurance of God\'s protection',
  },
  // Addiction & Recovery
  {
    reference: '1 Corinthians 10:13',
    text: 'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it.',
    theme: 'addiction',
    therapeuticApplication: 'Normalization of struggle. Hope for escape routes. God\'s faithfulness.',
    context: 'Paul teaching about temptation and God\'s provision',
  },
  {
    reference: 'James 5:16',
    text: 'Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.',
    theme: 'addiction',
    therapeuticApplication: 'Power of community and confession. Breaking isolation.',
    context: 'James teaching on prayer and community',
  },
  // Identity & Self-Worth
  {
    reference: 'Ephesians 2:10',
    text: 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.',
    theme: 'identity',
    therapeuticApplication: 'Positive self-concept. Purpose and meaning. Countering worthlessness.',
    context: 'Paul on salvation by grace and our new identity',
  },
  {
    reference: 'Psalm 139:13-14',
    text: 'For you created my inmost being; you knit me together in my mother\'s womb. I praise you because I am fearfully and wonderfully made.',
    theme: 'identity',
    therapeuticApplication: 'Self-compassion. Body acceptance. Divine craftsmanship.',
    context: 'David\'s reflection on God\'s intimate knowledge of him',
  },
];

// =============================================================================
// COACHING PLAN GENERATION
// =============================================================================

export interface CoachingPlan {
  id: string;
  userId: string;
  version: number;
  primaryFocus: string[];
  therapeuticMethods: string[];
  milestones: CoachingMilestone[];
  spiritualPractices: string[];
  scriptureFocus: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface CoachingMilestone {
  id: string;
  category: string;
  title: string;
  description: string;
  therapeuticMethod: string;
  scriptureSupport: string[];
  exercises: Exercise[];
  targetWeek: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Exercise {
  name: string;
  type: 'worksheet' | 'meditation' | 'journal' | 'practical';
  description: string;
  duration: number; // minutes
  biblicalConnection?: string;
}

/**
 * Generate a personalized coaching plan based on user's comprehensive profile
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
 */
async function gatherUserData(userId: string) {
  try {
    // Import tables here to avoid circular dependencies
    const { userPsychologicalProfile, userSpiritualProfile, userBehavioralPatterns, userSubstanceProfile, userInteractionMemory, conversationInsights } = await import('../db/userProfileSchema');
    
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
    const { coachingPlans, coachingMilestones } = await import('../db/userProfileSchema');
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

// =============================================================================
// COACH MODE RESPONSE GENERATION
// =============================================================================

export interface CoachContext {
  userId: string;
  message: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
}

/**
 * Generate a coaching response that integrates user's profile and therapeutic methods
 */
export async function generateCoachResponse(context: CoachContext): Promise<{
  response: string;
  suggestedScripture?: string;
  recommendedExercise?: string;
  technique?: string;
}> {
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
    const { coachingPlans } = await import('../db/userProfileSchema');
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

// =============================================================================
// CURRICULUM GENERATION
// =============================================================================

/**
 * Generate personalized curriculum content based on user's needs
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
