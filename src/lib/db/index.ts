import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { schema, relations } from './schema';

config({ path: '.env.local' });

export const db = drizzle(process.env.DATABASE_URL!, { relations });
