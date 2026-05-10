import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { memories, users } from '../db/schema';
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
    
    const userMemories = await db.query.memories.findMany({
      where: eq(memories.userId, user.id),
      orderBy: (memories, { desc }) => [desc(memories.timestamp)],
    });
    res.json(userMemories);
  } catch (error) {
    logError('Get memories error', error as Error);
    res.status(500).json({ error: 'Failed to fetch memories' });
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
    
    const [memory] = await db.insert(memories).values({
      ...req.body,
      userId: user.id,
    }).returning();
    res.json(memory);
  } catch (error) {
    logError('Create memory error', error as Error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

export default router;
