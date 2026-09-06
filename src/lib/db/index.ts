import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { relations } from './schema';

config({ path: '.env.local' });

const databaseUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('POSTGRES_URL or DATABASE_URL must be set to connect to Neon.');
}

const sql = neon(databaseUrl);

export const db = drizzle({ client: sql, relations });
