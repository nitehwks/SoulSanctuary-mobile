import { Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { validateBody } from '../validation/middleware';
import { crisisAlertSchema, crisisInterventionSchema, crisisAnalyzeSchema } from '../validation/schemas';
import { 
  analyzeMoodForCrisis, 
  notifyEmergencyContacts, 
  logCrisisEvent,
  getCrisisResources,
  handleCrisisIntervention,
  resolveCrisisEvent,
  getCrisisHistory
} from '../services/crisis';
import { logAudit, logError } from '../services/logger';

const router = Router();

/**
 * POST /api/crisis/alert
 * Log a crisis event and trigger notifications
 */
router.post('/alert', validateBody(crisisAlertSchema), async (req: any, res) => {
  try {
    const { severity, context } = req.body;
    
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log crisis event
    await logCrisisEvent(
      user.id,
      severity,
      context?.note || 'Unknown',
      'auto_triggered',
      []
    );
    
    // Notify emergency contacts for high severity
    if (severity === 'high' || severity === 'critical') {
      await notifyEmergencyContacts(user.id, severity).catch(err => {
        logError('Failed to notify emergency contacts', err, { userId: user.id });
      });
    }
    
    logAudit('CRISIS_ALERT', user.id, { severity });

    res.json({ 
      status: 'logged', 
      resources: getCrisisResources(),
      message: 'Crisis event logged. Support resources provided.'
    });
  } catch (error) {
    logError('Crisis alert error', error as Error);
    res.status(500).json({ error: 'Failed to process crisis alert' });
  }
});

/**
 * POST /api/crisis/intervention
 * Handle immediate crisis intervention
 */
router.post('/intervention', validateBody(crisisInterventionSchema), async (req: any, res) => {
  try {
    const { context } = req.body;
    
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Handle crisis intervention
    const intervention = await handleCrisisIntervention(user.id, context);
    
    logAudit('CRISIS_INTERVENTION', user.id, { context });

    res.json(intervention);
  } catch (error) {
    logError('Crisis intervention error', error as Error);
    res.status(500).json({ 
      error: 'Failed to process crisis intervention',
      resources: getCrisisResources()
    });
  }
});

/**
 * POST /api/crisis/analyze
 * Analyze mood data for crisis indicators
 */
router.post('/analyze', validateBody(crisisAnalyzeSchema), async (req: any, res) => {
  try {
    const { moodData } = req.body;
    
    const analysis = await analyzeMoodForCrisis(moodData);
    
    if (analysis) {
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, req.auth.userId),
      });
      
      if (user) {
        await logCrisisEvent(
          user.id,
          analysis.severity,
          analysis.trigger,
          'auto_detected',
          []
        );
        
        if (analysis.severity === 'high' || analysis.severity === 'critical') {
          await notifyEmergencyContacts(user.id, analysis.severity).catch(console.error);
        }

        logAudit('CRISIS_DETECTED', user.id, { severity: analysis.severity });
      }
    }
    
    res.json({
      isCrisis: !!analysis,
      ...analysis
    });
  } catch (error) {
    logError('Crisis analysis error', error as Error);
    res.status(500).json({ error: 'Failed to analyze crisis indicators' });
  }
});

/**
 * GET /api/crisis/history
 * Get user's crisis event history
 */
router.get('/history', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const events = await getCrisisHistory(user.id);
    res.json(events);
  } catch (error) {
    logError('Crisis history error', error as Error);
    res.status(500).json({ error: 'Failed to fetch crisis history' });
  }
});

/**
 * GET /api/crisis/resources
 * Get available crisis resources
 */
router.get('/resources', (_req, res) => {
  res.json({
    resources: getCrisisResources()
  });
});

/**
 * PATCH /api/crisis/:id/resolve
 * Mark a crisis event as resolved
 */
router.patch('/:id/resolve', async (req: any, res) => {
  try {
    await resolveCrisisEvent(req.params.id);

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });
    
    if (user) {
      logAudit('CRISIS_RESOLVED', user.id, { crisisId: req.params.id });
    }

    res.json({ status: 'resolved' });
  } catch (error) {
    logError('Resolve crisis error', error as Error);
    res.status(500).json({ error: 'Failed to resolve crisis event' });
  }
});

export default router;
