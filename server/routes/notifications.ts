import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { notifications, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { logError } from '../services/logger';

const router = Router();

/**
 * GET /api/notifications
 * Get user's notifications
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, user.id),
      orderBy: desc(notifications.createdAt),
      limit: 50,
    });

    res.json(userNotifications);
  } catch (error) {
    logError('Get notifications error', error as Error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * POST /api/notifications
 * Create a new notification (internal use)
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { title, body, type, data } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [notification] = await db.insert(notifications).values({
      userId: user.id,
      title,
      body,
      type: type || 'general',
      data: data || {},
      read: false,
    }).returning();

    res.json(notification);
  } catch (error) {
    logError('Create notification error', error as Error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', async (req: AuthenticatedRequest, res) => {
  try {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, req.params.id));

    res.json({ success: true });
  } catch (error) {
    logError('Mark notification read error', error as Error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post('/read-all', async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, user.id));

    res.json({ success: true });
  } catch (error) {
    logError('Mark all read error', error as Error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    await db.delete(notifications)
      .where(eq(notifications.id, req.params.id));

    res.json({ success: true });
  } catch (error) {
    logError('Delete notification error', error as Error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
