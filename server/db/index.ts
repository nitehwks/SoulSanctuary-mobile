import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as userProfileSchema from './userProfileSchema';
import * as subscriptionsSchema from './subscriptions';
import { logInfo } from '../services/logger';

// Merge schemas
const fullSchema = { ...schema, ...userProfileSchema, ...subscriptionsSchema };

// Use PostgreSQL for production
const sql = neon(process.env.DATABASE_URL!) as NeonQueryFunction<boolean, boolean>;
export const db = drizzle(sql, { schema: fullSchema });

logInfo('Connected to PostgreSQL database');
