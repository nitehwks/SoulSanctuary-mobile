import { Router } from 'express';
import { db } from '../db';
import { memories, users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: any, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, req.auth.userId),
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const userMemories = await db.query.memories.findMany({
    where: eq(memories.userId, user.id),
    orderBy: (memories, { desc }) => [desc(memories.timestamp)],
  });
  res.json(userMemories);
});

router.post('/', async (req: any, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, req.auth.userId),
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const [memory] = await db.insert(memories).values({
    ...req.body,
    userId: user.id,
  }).returning();
  res.json(memory);
});

export default router;
