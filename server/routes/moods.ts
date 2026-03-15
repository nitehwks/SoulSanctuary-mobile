import { Router } from 'express';
import { db } from '../db';
import { moods, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateBody } from '../validation/middleware';
import { createMoodSchema, updateMoodSchema } from '../validation/schemas';
import { writeRateLimiter } from '../middleware/rateLimit';
import { logAudit, logError } from '../services/logger';

const router = Router();

/**
 * GET /api/moods
 * Get user's mood history
 */
router.get('/', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userMoods = await db.query.moods.findMany({
      where: eq(moods.userId, user.id),
      orderBy: desc(moods.timestamp),
      limit: 50,
    });

    res.json(userMoods);
  } catch (error) {
    logError('Get moods error', error as Error);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

/**
 * POST /api/moods
 * Create new mood entry
 */
router.post(
  '/',
  writeRateLimiter,
  validateBody(createMoodSchema),
  async (req: any, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, req.auth.userId),
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const [mood] = await db.insert(moods).values({
        ...req.body,
        userId: user.id,
      }).returning();

      // Log audit
      logAudit('MOOD_CREATED', user.id, {
        moodId: mood.id,
        mood: req.body.mood,
      });

      res.status(201).json(mood);
    } catch (error) {
      logError('Create mood error', error as Error);
      res.status(500).json({ error: 'Failed to create mood entry' });
    }
  }
);

/**
 * PATCH /api/moods/:id
 * Update mood entry
 */
router.patch(
  '/:id',
  writeRateLimiter,
  validateBody(updateMoodSchema),
  async (req: any, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, req.auth.userId),
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const [mood] = await db.update(moods)
        .set({
          ...req.body,
          timestamp: new Date(),
        })
        .where(eq(moods.id, req.params.id))
        .returning();

      if (!mood) {
        return res.status(404).json({ error: 'Mood entry not found' });
      }

      logAudit('MOOD_UPDATED', user.id, {
        moodId: mood.id,
      });

      res.json(mood);
    } catch (error) {
      logError('Update mood error', error as Error);
      res.status(500).json({ error: 'Failed to update mood entry' });
    }
  }
);

/**
 * DELETE /api/moods/:id
 * Delete mood entry
 */
router.delete('/:id', writeRateLimiter, async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.delete(moods)
      .where(eq(moods.id, req.params.id));

    logAudit('MOOD_DELETED', user.id, {
      moodId: req.params.id,
    });

    res.status(204).send();
  } catch (error) {
    logError('Delete mood error', error as Error);
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
});

export default router;
