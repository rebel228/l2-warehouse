'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { ilike } from 'drizzle-orm';

export async function getUsers(search: string = '') {
  if (!search || search.length < 1) {
    return [];
  }

  const result = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
    })
    .from(users)
    .where(ilike(users.username, `%${search}%`))
    .limit(10);

  return result;
}
