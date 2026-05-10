import { Router, Request, Response } from 'express';
import { analyzeConversation } from '../../services/analysis';
import {
  generateCoachingPlan,
  generateCoachResponse,
  generateCurriculumContent,
} from '../../services/coaching';
import { detectCrisis } from '../../services/ai';
import { logError } from '../../services/logger';
import { db } from '../../db';
import { eq } from 'drizzle-orm';
import { requireFeature, loadSubscription } from '../../middleware/premium';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

const router = Router();

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

    const { coachingPlans, coachingMilestones } = await import('../../db/userProfileSchema');
    
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

export default router;
