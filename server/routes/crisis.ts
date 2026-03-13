import { Router } from 'express';
import { db } from '../db';
import { crisisEvents } from '../db/schema';

const router = Router();

router.post('/alert', async (req: any, res) => {
  const { severity, context } = req.body;
  
  // Log crisis event
  await db.insert(crisisEvents).values({
    userId: req.auth.userId,
    severity,
    trigger: context?.note || 'Unknown',
    response: 'auto_triggered',
    resourcesAccessed: [],
  });
  
  // In production: Send notifications to emergency contacts
  // await notifyEmergencyContacts(req.auth.userId, severity);
  
  res.json({ status: 'logged', resources: [] });
});

router.get('/history', async (req: any, res) => {
  const events = await db.query.crisisEvents.findMany({
    where: (events, { eq }) => eq(events.userId, req.auth.userId),
  });
  res.json(events);
});

export default router;
