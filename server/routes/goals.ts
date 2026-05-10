import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { goals, milestones, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logError } from '../services/logger';

const router = Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userGoals = await db.query.goals.findMany({
      where: eq(goals.userId, user.id),
      with: { milestones: true },
    });
    res.json(userGoals);
  } catch (error) {
    logError('Get goals error', error as Error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [goal] = await db.insert(goals).values({
      ...req.body,
      userId: user.id,
    }).returning();
    res.json(goal);
  } catch (error) {
    logError('Create goal error', error as Error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

router.patch('/:id/progress', async (req: AuthenticatedRequest, res) => {
  try {
    const [goal] = await db.update(goals)
      .set({ progress: req.body.progress })
      .where(eq(goals.id, req.params.id))
      .returning();
    res.json(goal);
  } catch (error) {
    logError('Update goal progress error', error as Error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
});

router.post('/:id/milestones', async (req: AuthenticatedRequest, res) => {
  try {
    const [milestone] = await db.insert(milestones).values({
      ...req.body,
      goalId: req.params.id,
    }).returning();
    res.json(milestone);
  } catch (error) {
    logError('Create milestone error', error as Error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

export default router;
