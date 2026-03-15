import { Router } from 'express';
import { db } from '../db';
import { notifications, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/notifications
 * Get user's notifications
 */
router.get('/', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
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
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * POST /api/notifications
 * Create a new notification (internal use)
 */
router.post('/', async (req: any, res) => {
  try {
    const { title, body, type, data } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
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
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', async (req: any, res) => {
  try {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, req.params.id));

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post('/read-all', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, user.id));

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req: any, res) => {
  try {
    await db.delete(notifications)
      .where(eq(notifications.id, req.params.id));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
