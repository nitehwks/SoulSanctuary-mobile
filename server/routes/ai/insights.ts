import { Router, Request, Response } from 'express';
import { validateBody } from '../../validation/middleware';
import { 
  moodInsightSchema, 
  goalCoachingSchema, 
  memoryInsightSchema,
  weeklySummarySchema,
  suggestionsSchema
} from '../../validation/schemas';
import { 
  generateMoodInsight, 
  generateGoalCoaching, 
  generateMemoryInsights,
  generateWeeklySummary,
  generateSuggestions
} from '../../services/ai';
import { logError } from '../../services/logger';
import { db } from '../../db';
import { eq, desc } from 'drizzle-orm';
import { requireFeature, loadSubscription } from '../../middleware/premium';

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

    const { conversationInsights } = await import('../../db/userProfileSchema');
    
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
