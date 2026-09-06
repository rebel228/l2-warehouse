import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { relations } from './schema';

if (process.env.NODE_ENV === 'development') {
  config({ path: '.env.local' });
}

console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);

const databaseUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('POSTGRES_URL or DATABASE_URL must be set to connect to Neon.');
}

const sql = neon(databaseUrl);

export const db = drizzle({ client: sql, relations });
