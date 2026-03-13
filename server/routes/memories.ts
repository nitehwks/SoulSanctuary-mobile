import { Router } from 'express';
import { db } from '../db';
import { memories } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: any, res) => {
  const userMemories = await db.query.memories.findMany({
    where: eq(memories.userId, req.auth.userId),
    orderBy: (memories, { desc }) => [desc(memories.timestamp)],
  });
  res.json(userMemories);
});

router.post('/', async (req: any, res) => {
  const [memory] = await db.insert(memories).values({
    ...req.body,
    userId: req.auth.userId,
  }).returning();
  res.json(memory);
});

export default router;
