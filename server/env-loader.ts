// This file must be imported FIRST before any other imports
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  console.error('Make sure .env.local or .env file exists with DATABASE_URL');
  process.exit(1);
}

console.log('✅ Environment loaded');
