import { Request, Response, NextFunction } from 'express';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { logError } from '../services/logger';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Extended Express Request with auth and user data
 */
export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
  dbUser?: typeof users.$inferSelect;
}

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
      dbUser?: typeof users.$inferSelect;
    }
  }
}

/**
 * Verify Clerk JWT token and attach auth info to request
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await clerk.verifyToken(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.auth = {
      userId: session.sub,
      sessionId: session.sid as string,
    };
    
    next();
  } catch (error) {
    logError('Auth middleware error', error as Error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Lookup the database user record for the authenticated Clerk user.
 * Returns null if no auth or user not found.
 */
export async function getUserFromAuth(req: Request): Promise<typeof users.$inferSelect | null> {
  const clerkId = req.auth?.userId;
  if (!clerkId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  return user ?? null;
}

/**
 * Middleware that attaches the DB user to req.dbUser.
 * Use AFTER authMiddleware.
 */
export async function attachDbUser(req: Request, _res: Response, next: NextFunction) {
  try {
    req.dbUser = await getUserFromAuth(req) ?? undefined;
    next();
  } catch (error) {
    logError('Failed to attach DB user', error as Error);
    next();
  }
}
