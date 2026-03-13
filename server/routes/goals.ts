import { Router } from 'express';
import { db } from '../db';
import { goals, milestones } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: any, res) => {
  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, req.auth.userId),
    with: { milestones: true },
  });
  res.json(userGoals);
});

router.post('/', async (req: any, res) => {
  const [goal] = await db.insert(goals).values({
    ...req.body,
    userId: req.auth.userId,
  }).returning();
  res.json(goal);
});

router.patch('/:id/progress', async (req: any, res) => {
  const [goal] = await db.update(goals)
    .set({ progress: req.body.progress })
    .where(eq(goals.id, req.params.id))
    .returning();
  res.json(goal);
});

router.post('/:id/milestones', async (req: any, res) => {
  const [milestone] = await db.insert(milestones).values({
    ...req.body,
    goalId: req.params.id,
  }).returning();
  res.json(milestone);
});

export default router;
