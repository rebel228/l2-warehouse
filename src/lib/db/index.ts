import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { relations } from './schema';

const databaseUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('POSTGRES_URL or DATABASE_URL must be set to connect to Neon.');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle({ client: pool, relations });
