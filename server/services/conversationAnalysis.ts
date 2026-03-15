// =============================================================================
// CONVERSATION ANALYSIS SERVICE
// Analyzes user conversations to extract psychological, spiritual, and behavioral insights
// This is the "learning" engine that builds the user's profile over time
// =============================================================================

import OpenAI from 'openai';
import { logError, logInfo } from './logger';
import { encryptProfileData, decryptProfileData } from './profileEncryption';
import { db } from '../db';
import { 
  userPsychologicalProfile, 
  userSpiritualProfile, 
  userBehavioralPatterns,
  userSubstanceProfile,
  userRelationships,
  conversationInsights,
  userInteractionMemory
} from '../db/userProfileSchema';
import { eq } from 'drizzle-orm';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'https://soulsanctuary.app',
    'X-Title': 'SoulSanctuary',
  },
});

const ANALYSIS_MODEL = 'anthropic/claude-3.5-sonnet';

// =============================================================================
// TYPES
// =============================================================================

export interface ConversationContext {
  messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[];
  userId: string;
  sessionId?: string;
}

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
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Analyze a conversation and extract comprehensive insights
 * This is called after each significant conversation to update the user's profile
 */
export async function analyzeConversation(context: ConversationContext): Promise<ExtractedInsights> {
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

// =============================================================================
// PROFILE UPDATE FUNCTIONS
// =============================================================================

async function updateUserProfile(
  userId: string, 
  insights: ExtractedInsights,
  existingProfile: any
): Promise<void> {
  try {
    // Update psychological profile
    await updatePsychologicalProfile(userId, insights, existingProfile.psychological);
    
    // Update spiritual profile
    await updateSpiritualProfile(userId, insights, existingProfile.spiritual);
    
    // Update behavioral patterns
    await updateBehavioralPatterns(userId, insights, existingProfile.behavioral);
    
    // Update substance profile if indicators present
    if (insights.substanceIndicators.mentionsSubstances) {
      await updateSubstanceProfile(userId, insights, existingProfile.substance);
    }
    
    // Update relationship profile
    if (insights.relationshipDynamics.mentionsRelationships) {
      await updateRelationshipProfile(userId, insights, existingProfile.relationships);
    }
    
    // Update interaction memory
    await updateInteractionMemory(userId, insights);
    
  } catch (error) {
    logError('Failed to update user profile', error as Error);
  }
}

async function updatePsychologicalProfile(
  userId: string,
  insights: ExtractedInsights,
  existing: any
): Promise<void> {
  try {
    const profile = existing ? decryptProfileData<any>(userId, existing.encryptedProfileData) : {};
    
    // Merge new insights with existing data
    const updated = {
      ...profile,
      lastAssessment: new Date().toISOString(),
      anxietyHistory: [...(profile.anxietyHistory || []), insights.psychologicalIndicators.anxietyLevel].filter(Boolean).slice(-20),
      depressionHistory: [...(profile.depressionHistory || []), insights.psychologicalIndicators.depressionLevel].filter(Boolean).slice(-20),
      emotionalThemes: mergeThemes(profile.emotionalThemes || [], insights.emotionalThemes),
      traumaAcknowledged: profile.traumaAcknowledged || insights.psychologicalIndicators.traumaIndicators,
      therapyPreferences: insights.userPreferences.communicationStyle === 'clinical' 
        ? 'prefers_evidence_based' 
        : profile.therapyPreferences,
    };
    
    const encrypted = encryptProfileData(userId, updated);
    const conversationsAnalyzed = (existing?.conversationsAnalyzed || 0) + 1;
    
    if (existing) {
      await db.update(userPsychologicalProfile).set({
        encryptedProfileData: encrypted,
        anxietyLevel: insights.psychologicalIndicators.anxietyLevel || existing?.anxietyLevel,
        depressionLevel: insights.psychologicalIndicators.depressionLevel || existing?.depressionLevel,
        traumaIndicators: insights.psychologicalIndicators.traumaIndicators || existing?.traumaIndicators,
        lastAnalysisAt: new Date(),
        conversationsAnalyzed,
        updatedAt: new Date(),
      }).where(eq(userPsychologicalProfile.id, existing.id));
    } else {
      await db.insert(userPsychologicalProfile).values({
        userId,
        encryptedProfileData: encrypted,
        anxietyLevel: insights.psychologicalIndicators.anxietyLevel,
        depressionLevel: insights.psychologicalIndicators.depressionLevel,
        traumaIndicators: insights.psychologicalIndicators.traumaIndicators,
        conversationsAnalyzed: 1,
      });
    }
  } catch (error) {
    logError('Failed to update psychological profile', error as Error);
  }
}

async function updateSpiritualProfile(
  userId: string,
  insights: ExtractedInsights,
  existing: any
): Promise<void> {
  try {
    const profile = existing ? decryptProfileData<any>(userId, existing.encryptedProfileData) : {};
    
    const updated = {
      ...profile,
      spiritualThemes: mergeThemes(profile.spiritualThemes || [], insights.spiritualThemes),
      faithStruggles: [...(profile.faithStruggles || []), ...(insights.spiritualState.faithStruggle ? [new Date().toISOString()] : [])].slice(-10),
      scriptureComfort: insights.spiritualState.comfortFromScripture,
      prayerLife: insights.spiritualState.prayerLife || profile.prayerLife,
      seekingGod: insights.spiritualState.seekingConnection,
      spiritualJourneyNotes: [...(profile.spiritualJourneyNotes || []), {
        date: new Date().toISOString(),
        theme: insights.spiritualThemes[0] || 'general',
        state: insights.spiritualState,
      }].slice(-50),
    };
    
    const encrypted = encryptProfileData(userId, updated);
    const comfortScriptures = deriveComfortScriptures(insights.spiritualThemes);
    
    if (existing) {
      await db.update(userSpiritualProfile).set({
        encryptedProfileData: encrypted,
        faithJourneyStage: deriveFaithStage(updated),
        comfortScriptures: [...(existing.comfortScriptures || []), ...comfortScriptures].slice(-20),
        struggleAreas: [...(existing.struggleAreas || []), ...insights.spiritualThemes].slice(-20),
        updatedAt: new Date(),
      }).where(eq(userSpiritualProfile.id, existing.id));
    } else {
      await db.insert(userSpiritualProfile).values({
        userId,
        encryptedProfileData: encrypted,
        faithJourneyStage: deriveFaithStage(updated),
        comfortScriptures,
        struggleAreas: insights.spiritualThemes,
      });
    }
  } catch (error) {
    logError('Failed to update spiritual profile', error as Error);
  }
}

async function updateBehavioralPatterns(
  userId: string,
  insights: ExtractedInsights,
  existing: any
): Promise<void> {
  try {
    const profile = existing ? decryptProfileData<any>(userId, existing.encryptedPatternsData) : {};
    
    const updated = {
      ...profile,
      behavioralThemes: mergeThemes(profile.behavioralThemes || [], insights.behavioralThemes),
      identifiedTriggers: mergeThemes(profile.identifiedTriggers || [], extractTriggers(insights)),
      copingStrategies: insights.userPreferences.communicationStyle === 'clinical' 
        ? [...(profile.copingStrategies || []), 'responds_to_structure']
        : profile.copingStrategies,
      isolationPatterns: insights.relationshipDynamics.isolationIndicators 
        ? [...(profile.isolationPatterns || []), new Date().toISOString()].slice(-10)
        : profile.isolationPatterns,
    };
    
    const encrypted = encryptProfileData(userId, updated);
    
    if (existing) {
      await db.update(userBehavioralPatterns).set({
        encryptedPatternsData: encrypted,
        identifiedTriggers: updated.identifiedTriggers.slice(-10),
        crisisRisk: insights.psychologicalIndicators.crisisRisk || existing?.crisisRisk,
        lastPatternAnalysis: new Date(),
        updatedAt: new Date(),
      }).where(eq(userBehavioralPatterns.id, existing.id));
    } else {
      await db.insert(userBehavioralPatterns).values({
        userId,
        encryptedPatternsData: encrypted,
        identifiedTriggers: updated.identifiedTriggers.slice(-10),
        crisisRisk: insights.psychologicalIndicators.crisisRisk,
      });
    }
  } catch (error) {
    logError('Failed to update behavioral patterns', error as Error);
  }
}

async function updateSubstanceProfile(
  userId: string,
  insights: ExtractedInsights,
  existing: any
): Promise<void> {
  try {
    const profile = existing ? decryptProfileData<any>(userId, existing.encryptedProfileData) : {};
    
    const updated = {
      ...profile,
      substanceMentions: [...(profile.substanceMentions || []), new Date().toISOString()].slice(-20),
      recoveryLanguageUsed: insights.substanceIndicators.recoveryLanguage,
      relapseRiskHistory: [...(profile.relapseRiskHistory || []), insights.substanceIndicators.relapseRisk].filter(Boolean).slice(-10),
    };
    
    const encrypted = encryptProfileData(userId, updated);
    
    if (existing) {
      await db.update(userSubstanceProfile).set({
        encryptedProfileData: encrypted,
        hasSubstanceHistory: true,
        relapseRiskLevel: mapRiskLevel(insights.substanceIndicators.relapseRisk),
        updatedAt: new Date(),
      }).where(eq(userSubstanceProfile.id, existing.id));
    } else {
      await db.insert(userSubstanceProfile).values({
        userId,
        encryptedProfileData: encrypted,
        hasSubstanceHistory: true,
        relapseRiskLevel: mapRiskLevel(insights.substanceIndicators.relapseRisk),
      });
    }
  } catch (error) {
    logError('Failed to update substance profile', error as Error);
  }
}

async function updateRelationshipProfile(
  userId: string,
  insights: ExtractedInsights,
  _existingRelationships: any[]
): Promise<void> {
  try {
    // This would create or update relationship records
    // Simplified for now - would need more sophisticated relationship extraction
    if (insights.relationshipDynamics.mentionsRelationships) {
      const relationshipData = {
        type: 'unknown', // Would be determined by AI analysis
        quality: insights.relationshipDynamics.relationshipQuality === 'positive' ? 8 : 4,
        isSupportive: insights.relationshipDynamics.relationshipQuality === 'positive',
        notes: 'Extracted from conversation analysis',
      };
      
      const encrypted = encryptProfileData(userId, relationshipData);
      
      await db.insert(userRelationships).values({
        userId,
        encryptedRelationshipData: encrypted,
        relationshipType: relationshipData.type,
        relationshipQuality: relationshipData.quality,
        isSupportive: relationshipData.isSupportive,
      });
    }
  } catch (error) {
    logError('Failed to update relationship profile', error as Error);
  }
}

async function updateInteractionMemory(
  userId: string,
  insights: ExtractedInsights
): Promise<void> {
  try {
    // Check if record exists
    const existing = await db.select().from(userInteractionMemory)
      .where(eq(userInteractionMemory.userId, userId))
      .limit(1)
      .then(r => r[0]);
    
    const memory = existing ? decryptProfileData<any>(userId, existing.encryptedMemoryData) : {};
    
    const updated = {
      ...memory,
      communicationStyle: insights.userPreferences.communicationStyle,
      responseToScripture: insights.userPreferences.respondsToScripture,
      engagementLevel: insights.userPreferences.engagementLevel,
      effectiveInterventions: [...(memory.effectiveInterventions || []), insights.recommendedApproach].slice(-20),
      lastInteractionStyle: insights.userPreferences.communicationStyle,
    };
    
    const encrypted = encryptProfileData(userId, updated);
    
    if (existing) {
      await db.update(userInteractionMemory).set({
        encryptedMemoryData: encrypted,
        preferredCommunicationStyle: insights.userPreferences.communicationStyle,
        responseToScripture: insights.userPreferences.respondsToScripture,
        lastUpdated: new Date(),
      }).where(eq(userInteractionMemory.id, existing.id));
    } else {
      await db.insert(userInteractionMemory).values({
        userId,
        encryptedMemoryData: encrypted,
        preferredCommunicationStyle: insights.userPreferences.communicationStyle,
        responseToScripture: insights.userPreferences.respondsToScripture,
      });
    }
  } catch (error) {
    logError('Failed to update interaction memory', error as Error);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildAnalysisPrompt(context: ConversationContext, existingProfile: any): string {
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

async function getExistingProfile(userId: string): Promise<any> {
  try {
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

function mergeThemes(existing: string[], newThemes: string[]): string[] {
  const combined = [...existing, ...newThemes];
  // Remove duplicates (case insensitive) and keep most recent
  return Array.from(new Set(combined.map(t => t.toLowerCase()))).slice(-30);
}

function extractTriggers(insights: ExtractedInsights): string[] {
  const triggers: string[] = [];
  if ((insights.psychologicalIndicators.anxietyLevel || 0) > 5) triggers.push('anxiety');
  if (insights.relationshipDynamics.isolationIndicators) triggers.push('isolation');
  if (insights.spiritualState.faithStruggle) triggers.push('spiritual_doubt');
  return triggers;
}

function deriveComfortScriptures(themes: string[]): string[] {
  const scriptureMap: Record<string, string[]> = {
    'anxiety': ['Philippians 4:6-7', 'Matthew 6:34', '1 Peter 5:7'],
    'depression': ['Psalm 34:18', 'Isaiah 41:10', 'Psalm 42:11'],
    'fear': ['Isaiah 41:13', '2 Timothy 1:7', 'Psalm 27:1'],
    'grief': ['Psalm 34:18', 'Matthew 5:4', 'Revelation 21:4'],
    'anger': ['Ephesians 4:26-27', 'Proverbs 15:1', 'James 1:19-20'],
    'loneliness': ['Deuteronomy 31:8', 'Hebrews 13:5', 'Psalm 68:6'],
    'hope': ['Jeremiah 29:11', 'Romans 15:13', 'Isaiah 40:31'],
    'forgiveness': ['Ephesians 4:32', 'Colossians 3:13', 'Matthew 6:14-15'],
  };
  
  const scriptures: string[] = [];
  themes.forEach(theme => {
    const lowerTheme = theme.toLowerCase();
    Object.entries(scriptureMap).forEach(([key, verses]) => {
      if (lowerTheme.includes(key)) {
        scriptures.push(...verses);
      }
    });
  });
  
  return Array.from(new Set(scriptures));
}

function deriveFaithStage(profile: any): string {
  const notes = profile.spiritualJourneyNotes || [];
  const recentNotes = notes.slice(-10);
  
  if (recentNotes.every((n: any) => n.state?.seekingConnection)) return 'seeker';
  if (recentNotes.some((n: any) => n.state?.prayerLife === 'active')) return 'growing';
  if (recentNotes.length > 5 && !recentNotes.some((n: any) => n.state?.faithStruggle)) return 'mature';
  return 'growing';
}

function mapRiskLevel(risk?: number): string {
  if (!risk) return 'low';
  if (risk >= 8) return 'critical';
  if (risk >= 6) return 'high';
  if (risk >= 4) return 'moderate';
  return 'low';
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
