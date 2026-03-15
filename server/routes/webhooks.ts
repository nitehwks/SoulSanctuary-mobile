import { Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Webhook } from 'svix';

const router = Router();

/**
 * POST /api/webhooks/clerk
 * Handle Clerk webhook events
 */
router.post('/clerk', async (req, res) => {
  try {
    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    const headers = req.headers;
    
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
    let event;
    
    try {
      event = wh.verify(payload, {
        'svix-id': headers['svix-id'] as string,
        'svix-timestamp': headers['svix-timestamp'] as string,
        'svix-signature': headers['svix-signature'] as string,
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { type, data } = event as any;

    console.log(`Received Clerk webhook: ${type}`);

    switch (type) {
      case 'user.created': {
        // Create user in our database
        const [user] = await db.insert(users).values({
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
          preferences: {},
        }).returning();
        
        console.log(`Created user in database: ${user.id}`);
        break;
      }

      case 'user.updated': {
        // Update user in our database
        const user = await db.query.users.findFirst({
          where: eq(users.clerkId, data.id),
        });

        if (user) {
          await db.update(users)
            .set({
              email: data.email_addresses[0]?.email_address || user.email,
              name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || user.name,
            })
            .where(eq(users.id, user.id));
          
          console.log(`Updated user in database: ${user.id}`);
        }
        break;
      }

      case 'user.deleted': {
        // Note: We don't actually delete user data for compliance/legal reasons
        // Instead, we could anonymize or mark as deleted
        const user = await db.query.users.findFirst({
          where: eq(users.clerkId, data.id),
        });

        if (user) {
          // Option 1: Soft delete (mark as deleted)
          // await db.update(users)
          //   .set({ deletedAt: new Date() })
          //   .where(eq(users.id, user.id));

          // Option 2: Hard delete (remove all data)
          // This requires cascading deletes for moods, goals, etc.
          // await db.delete(users).where(eq(users.id, user.id));

          console.log(`User deletion requested: ${user.id} - handle according to data retention policy`);
        }
        break;
      }

      case 'session.created': {
        // Could log login events for security monitoring
        console.log(`User session created: ${data.user_id}`);
        break;
      }

      case 'session.revoked':
      case 'session.removed': {
        // Could handle logout events
        console.log(`User session ended: ${data.user_id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router;
