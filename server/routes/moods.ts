import { Router } from 'express';
import { db } from '../db';
import { moods } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

const moodSchema = z.object({
  mood: z.number().min(1).max(5),
  emotions: z.array(z.string()),
  note: z.string().optional(),
  context: z.string().optional(),
});

router.get('/', async (req: any, res) => {
  const userMoods = await db.query.moods.findMany({
    where: eq(moods.userId, req.auth.userId),
    orderBy: desc(moods.timestamp),
    limit: 50,
  });
  res.json(userMoods);
});

router.post('/', async (req: any, res) => {
  const data = moodSchema.parse(req.body);
  
  const [mood] = await db.insert(moods).values({
    ...data,
    userId: req.auth.userId,
  }).returning();
  
  res.json(mood);
});

export default router;
