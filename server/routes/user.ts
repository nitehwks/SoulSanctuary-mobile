import { Router } from 'express';
import { db } from '../db';
import { users, moods, goals, memories, crisisEvents, notifications, emergencyContacts, chatHistory, userSettings, milestones } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createClerkClient } from '@clerk/clerk-sdk-node';

const router = Router();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * POST /api/user/sync
 * Sync Clerk user with our database - creates user if not exists
 */
router.post('/sync', async (req: any, res) => {
  try {
    const { clerkId, email, name } = req.body;
    const authUserId = req.auth.userId;
    
    // Verify the Clerk ID matches the authenticated user
    if (clerkId !== authUserId) {
      return res.status(403).json({ error: 'User ID mismatch' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    let user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      // Create new user
      [user] = await db.insert(users).values({
        clerkId,
        email,
        name: name || null,
        preferences: {},
      }).returning();
      
      console.log(`New user created: ${user.id} (Clerk: ${clerkId})`);
    } else {
      // Update existing user with latest info
      [user] = await db.update(users)
        .set({
          email,
          name: name || user.name,
        })
        .where(eq(users.id, user.id))
        .returning();
      
      console.log(`User synced: ${user.id} (Clerk: ${clerkId})`);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/user/fcm-token
 * Register FCM token for push notifications
 */
router.post('/fcm-token', async (req: any, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token required' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.update(users)
      .set({ fcmToken })
      .where(eq(users.id, user.id));

    res.json({ success: true });
  } catch (error) {
    console.error('FCM token registration error:', error);
    res.status(500).json({ error: 'Failed to register FCM token' });
  }
});

/**
 * DELETE /api/user
 * Delete user account and all associated data
 */
router.delete('/', async (req: any, res) => {
  try {
    // Note: password verification handled by Clerk
    const clerkUserId = req.auth.userId;

    // Verify the user exists in our database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all user data from our database
    // Order matters due to foreign key constraints

    // 1. Delete milestones (linked to goals)
    const userGoals = await db.query.goals.findMany({
      where: eq(goals.userId, user.id),
    });
    
    for (const goal of userGoals) {
      await db.delete(milestones).where(eq(milestones.goalId, goal.id));
    }

    // 2. Delete goals
    await db.delete(goals).where(eq(goals.userId, user.id));

    // 3. Delete moods
    await db.delete(moods).where(eq(moods.userId, user.id));

    // 4. Delete memories
    await db.delete(memories).where(eq(memories.userId, user.id));

    // 5. Delete crisis events
    await db.delete(crisisEvents).where(eq(crisisEvents.userId, user.id));

    // 6. Delete notifications
    await db.delete(notifications).where(eq(notifications.userId, user.id));

    // 7. Delete emergency contacts
    await db.delete(emergencyContacts).where(eq(emergencyContacts.userId, user.id));

    // 8. Delete chat history
    await db.delete(chatHistory).where(eq(chatHistory.userId, user.id));

    // 9. Delete user settings
    await db.delete(userSettings).where(eq(userSettings.userId, user.id));

    // 10. Finally, delete the user
    await db.delete(users).where(eq(users.id, user.id));

    // Delete user from Clerk
    // Note: This requires the Clerk backend API
    try {
      await clerk.users.deleteUser(clerkUserId);
    } catch (clerkError) {
      console.error('Failed to delete user from Clerk:', clerkError);
      // Continue - user data is already deleted from our DB
    }

    console.log(`User ${user.id} (Clerk: ${clerkUserId}) deleted successfully`);

    res.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get('/profile', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PATCH /api/user/profile
 * Update user profile
 */
router.patch('/profile', async (req: any, res) => {
  try {
    const updates = req.body;
    
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [updatedUser] = await db.update(users)
      .set({
        name: updates.name,
        preferences: updates.preferences,
      })
      .where(eq(users.id, user.id))
      .returning();

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/user/settings
 * Get user settings
 */
router.get('/settings', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, user.id),
    });

    // Create default settings if none exist
    if (!settings) {
      [settings] = await db.insert(userSettings).values({
        userId: user.id,
      }).returning();
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PATCH /api/user/settings
 * Update user settings
 */
router.patch('/settings', async (req: any, res) => {
  try {
    const updates = req.body;
    
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, user.id),
    });

    // Create settings if they don't exist
    if (!settings) {
      [settings] = await db.insert(userSettings).values({
        userId: user.id,
        ...updates,
      }).returning();
    } else {
      [settings] = await db.update(userSettings)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.id, settings.id))
        .returning();
    }

    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
