import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'undefined';

if (!connectionString || connectionString === 'undefined') {
  console.warn('DATABASE_URL is not set. Database operations will fail.');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
