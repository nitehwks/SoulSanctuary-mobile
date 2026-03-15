import { Router, Request, Response } from 'express';
import { validateBody } from '../validation/middleware';
import { 
  moodInsightSchema, 
  goalCoachingSchema, 
  memoryInsightSchema,
  weeklySummarySchema,
  crisisAssessmentSchema,
  chatSchema,
  suggestionsSchema
} from '../validation/schemas';
import { 
  generateMoodInsight, 
  generateGoalCoaching, 
  generateMemoryInsights,
  generateWeeklySummary,
  generateChatResponse,
  generateSuggestions,
  detectCrisis
} from '../services/ai';
import { analyzeConversation } from '../services/conversationAnalysis';
import {
  generateCoachingPlan,
  generateCoachResponse,
  generateCurriculumContent,
} from '../services/comprehensiveCoaching';
import { logError } from '../services/logger';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import { requireFeature, limitAIUsage, loadSubscription, incrementAIUsage } from '../middleware/premium';

// Extend Express Request type
interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

const router = Router();

/**
 * POST /api/ai/mood-insight
 * Generate AI insight for mood entries
 * FREE TIER: Available to all users
 */
router.post('/mood-insight', loadSubscription, validateBody(moodInsightSchema), async (req, res) => {
  try {
    const { entries } = req.body;

    const [insight, suggestions] = await Promise.all([
      generateMoodInsight(entries),
      generateSuggestions('mood', { entries })
    ]);

    res.json({
      insight,
      suggestions
    });
  } catch (error) {
    logError('Mood insight error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate mood insight',
      insight: 'We\'re here to support you.',
      suggestions: ['Practice deep breathing', 'Take a walk']
    });
  }
});

/**
 * POST /api/ai/goal-coach
 * Generate AI coaching for a goal
 * FREE TIER: Available to all users
 */
router.post('/goal-coach', loadSubscription, validateBody(goalCoachingSchema), async (req, res) => {
  try {
    const { goal } = req.body;

    const [insight, suggestions] = await Promise.all([
      generateGoalCoaching(goal),
      generateSuggestions('goal', { goal })
    ]);

    res.json({
      insight,
      suggestions
    });
  } catch (error) {
    logError('Goal coach error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate goal coaching',
      insight: 'Keep going!',
      suggestions: ['Break it into smaller steps']
    });
  }
});

/**
 * POST /api/ai/memory-insight
 * Generate insights from memory patterns
 * PREMIUM: Requires premium subscription
 */
router.post('/memory-insight', loadSubscription, requireFeature('memoryInsights'), validateBody(memoryInsightSchema), async (req, res) => {
  try {
    const { memories } = req.body;

    const insights = await generateMemoryInsights(memories);

    res.json({ insights });
  } catch (error) {
    logError('Memory insight error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate memory insights',
      insights: ['Your memories tell a story.']
    });
  }
});

/**
 * POST /api/ai/weekly-summary
 * Generate weekly mental health summary
 * PREMIUM: Requires premium subscription
 */
router.post('/weekly-summary', loadSubscription, requireFeature('weeklySummary'), validateBody(weeklySummarySchema), async (req, res) => {
  try {
    const { moods, goals, memories } = req.body;

    const summary = await generateWeeklySummary(
      moods || [],
      goals || [],
      memories || []
    );

    res.json(summary);
  } catch (error) {
    logError('Weekly summary error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate weekly summary',
      summary: 'This week was part of your journey.',
      highlights: ['You showed up for yourself'],
      suggestions: ['Keep tracking your moods']
    });
  }
});

/**
 * POST /api/ai/crisis-assessment
 * Assess if user message indicates crisis
 * FREE TIER: Available to all users (critical safety feature)
 */
router.post('/crisis-assessment', loadSubscription, validateBody(crisisAssessmentSchema), async (req, res) => {
  try {
    const { message } = req.body;

    const assessment = await detectCrisis(message);

    let suggestions: string[] = [];
    if (assessment.isCrisis) {
      suggestions = await generateSuggestions('crisis', { message, severity: assessment.severity });
    }

    res.json({
      ...assessment,
      suggestions: assessment.isCrisis ? suggestions : []
    });
  } catch (error) {
    logError('Crisis assessment error', error as Error);
    res.status(500).json({ 
      error: 'Failed to assess crisis',
      isCrisis: false,
      severity: 'low',
      suggestions: []
    });
  }
});

/**
 * POST /api/ai/chat
 * AI chat endpoint
 * FREE TIER: Available to all users (with usage limits)
 * PREMIUM: Unlimited usage
 */
router.post('/chat', loadSubscription, limitAIUsage, validateBody(chatSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, history, mode = 'spiritual' } = req.body;
    const userId = req.auth?.userId;

    // First check for crisis indicators
    const crisisCheck = await detectCrisis(message);

    if (crisisCheck.isCrisis && (crisisCheck.severity === 'high' || crisisCheck.severity === 'critical')) {
      return res.json({
        response: 'I\'m really concerned. Please reach out to the 988 Suicide & Crisis Lifeline at 988 or text HOME to 741741.',
        isCrisis: true,
        severity: crisisCheck.severity,
        resources: [
          { name: '988 Suicide & Crisis Lifeline', contact: '988' },
          { name: 'Crisis Text Line', contact: 'Text HOME to 741741' }
        ]
      });
    }

    const response = await generateChatResponse(message, history || [], mode);
    
    // Track AI usage for free tier users
    if (userId && !req.subscription?.features.unlimitedAI) {
      await incrementAIUsage(userId);
    }

    res.json({ 
      response,
      isCrisis: false
    });
  } catch (error) {
    logError('Chat error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      response: 'I appreciate you sharing that with me.'
    });
  }
});

/**
 * POST /api/ai/suggestions
 * Generate contextual suggestions
 * FREE TIER: Available to all users
 */
router.post('/suggestions', loadSubscription, validateBody(suggestionsSchema), async (req, res) => {
  try {
    const { context, data } = req.body;

    const suggestions = await generateSuggestions(context, data || {});

    res.json({ suggestions });
  } catch (error) {
    logError('Suggestions error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate suggestions',
      suggestions: ['Practice deep breathing']
    });
  }
});

// =============================================================================
// COMPREHENSIVE COACHING ROUTES
// =============================================================================

/**
 * POST /api/ai/analyze-conversation
 * Analyze a conversation and update user profile
 * PREMIUM: Requires premium subscription
 */
router.post('/analyze-conversation', loadSubscription, requireFeature('advancedCoaching'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messages, sessionId } = req.body;
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const insights = await analyzeConversation({
      messages,
      userId,
      sessionId,
    });

    res.json({ 
      success: true, 
      insights,
      profileUpdated: true 
    });
  } catch (error) {
    logError('Conversation analysis error', error as Error);
    res.status(500).json({ 
      error: 'Failed to analyze conversation',
      success: false 
    });
  }
});

/**
 * POST /api/ai/coach-response
 * Generate a comprehensive coaching response using full user profile
 * PREMIUM: Requires premium subscription
 */
router.post('/coach-response', loadSubscription, requireFeature('comprehensivePlan'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, history } = req.body;
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check for crisis first
    const crisisCheck = await detectCrisis(message);
    if (crisisCheck.isCrisis && (crisisCheck.severity === 'high' || crisisCheck.severity === 'critical')) {
      return res.json({
        response: 'I\'m really concerned. Please reach out to the 988 Suicide & Crisis Lifeline at 988 or text HOME to 741741.',
        isCrisis: true,
        severity: crisisCheck.severity,
        resources: [
          { name: '988 Suicide & Crisis Lifeline', contact: '988' },
          { name: 'Crisis Text Line', contact: 'Text HOME to 741741' }
        ]
      });
    }

    // Generate comprehensive coach response
    const result = await generateCoachResponse({
      userId,
      message,
      conversationHistory: history || [],
    });

    res.json({
      ...result,
      isCrisis: false,
    });
  } catch (error) {
    logError('Coach response error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate coach response',
      response: 'I\'m here with you. Tell me more about what you\'re experiencing.'
    });
  }
});

/**
 * POST /api/ai/coaching-plan
 * Generate a new personalized coaching plan
 * PREMIUM: Requires premium subscription
 */
router.post('/coaching-plan', loadSubscription, requireFeature('comprehensivePlan'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const plan = await generateCoachingPlan(userId);

    res.json({
      success: true,
      plan: {
        id: plan.id,
        primaryFocus: plan.primaryFocus,
        therapeuticMethods: plan.therapeuticMethods,
        scriptureFocus: plan.scriptureFocus,
        riskLevel: plan.riskLevel,
        milestonesCount: plan.milestones.length,
      }
    });
  } catch (error) {
    logError('Coaching plan generation error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate coaching plan',
      success: false 
    });
  }
});

/**
 * GET /api/ai/coaching-plan
 * Get current active coaching plan
 * PREMIUM: Requires premium subscription
 */
router.get('/coaching-plan', loadSubscription, requireFeature('comprehensivePlan'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { coachingPlans, coachingMilestones } = await import('../db/userProfileSchema');
    
    const plan = await db.select().from(coachingPlans)
      .where(eq(coachingPlans.userId, userId))
      .limit(1)
      .then(r => r[0]);

    if (!plan) {
      return res.json({ hasPlan: false });
    }

    // Get milestones
    const milestones = await db.select({
      id: coachingMilestones.id,
      category: coachingMilestones.category,
      status: coachingMilestones.status,
      progress: coachingMilestones.progress,
    }).from(coachingMilestones)
      .where(eq(coachingMilestones.planId, plan.id))
      .orderBy(coachingMilestones.order);

    res.json({
      hasPlan: true,
      plan: {
        id: plan.id,
        primaryFocus: plan.primaryFocus,
        therapeuticMethods: plan.therapeuticMethods,
        overallProgress: plan.overallProgress,
        milestones: milestones.map(m => ({
          id: m.id,
          category: m.category,
          status: m.status,
          progress: m.progress,
        })),
      }
    });
  } catch (error) {
    logError('Get coaching plan error', error as Error);
    res.status(500).json({ error: 'Failed to retrieve coaching plan' });
  }
});

/**
 * POST /api/ai/curriculum
 * Generate personalized curriculum content
 * PREMIUM: Requires premium subscription
 */
router.post('/curriculum', loadSubscription, requireFeature('curriculum'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { topic } = req.body;
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const content = await generateCurriculumContent(userId, topic);

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    logError('Curriculum generation error', error as Error);
    res.status(500).json({ 
      error: 'Failed to generate curriculum',
      success: false 
    });
  }
});

/**
 * GET /api/ai/user-insights
 * Get summary of AI insights about the user
 * PREMIUM: Requires premium subscription
 */
router.get('/user-insights', loadSubscription, requireFeature('advancedCoaching'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { conversationInsights } = await import('../db/userProfileSchema');
    
    // Get recent insights (non-sensitive summary)
    const insights = await db.select({
      emotionalThemes: conversationInsights.emotionalThemes,
      spiritualThemes: conversationInsights.spiritualThemes,
      depressionIndicators: conversationInsights.depressionIndicators,
      anxietyIndicators: conversationInsights.anxietyIndicators,
      analyzedAt: conversationInsights.analyzedAt,
    }).from(conversationInsights)
      .where(eq(conversationInsights.userId, userId))
      .orderBy(desc(conversationInsights.analyzedAt))
      .limit(5);

    const summary = {
      totalConversationsAnalyzed: insights.length,
      recentThemes: [...new Set(insights.flatMap((i: any) => i.emotionalThemes || []))].slice(0, 10),
      spiritualThemes: [...new Set(insights.flatMap((i: any) => i.spiritualThemes || []))].slice(0, 10),
      progressIndicators: {
        depressionImprovement: !insights.some((i: any) => i.depressionIndicators),
        anxietyManagement: !insights.some((i: any) => i.anxietyIndicators),
        spiritualGrowth: insights.some((i: any) => (i.spiritualThemes || []).includes('growth')),
      },
      lastAnalysis: insights[0]?.analyzedAt,
    };

    res.json({
      hasData: insights.length > 0,
      summary,
    });
  } catch (error) {
    logError('User insights error', error as Error);
    res.status(500).json({ error: 'Failed to retrieve insights' });
  }
});

export default router;
