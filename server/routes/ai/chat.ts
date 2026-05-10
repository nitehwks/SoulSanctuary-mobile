import { Router, Request, Response } from 'express';
import { validateBody } from '../../validation/middleware';
import { chatSchema, crisisAssessmentSchema } from '../../validation/schemas';
import { 
  generateChatResponse,
  generateSuggestions,
  detectCrisis
} from '../../services/ai';
import { logError } from '../../services/logger';
import { limitAIUsage, loadSubscription, incrementAIUsage } from '../../middleware/premium';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

const router = Router();

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

export default router;
