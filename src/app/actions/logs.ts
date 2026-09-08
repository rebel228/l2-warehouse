'use server';

import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { db } from '@/lib/db';
import { itemEvents } from '@/lib/db/schema';
import { LogEntry } from '@/lib/types/logs';
import { count } from 'drizzle-orm';

export async function getLogs(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{
  logs: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const safePage = Math.max(1, Math.floor(page));
  const offset = (safePage - 1) * pageSize;

  const [events, totalResult] = await Promise.all([
    db.query.itemEvents.findMany({
      with: {
        changedByUser: {
          columns: {
            username: true,
          },
        },
      },
      orderBy: (itemEvents, { desc }) => [desc(itemEvents.createdAt), desc(itemEvents.id)],
      limit: pageSize,
      offset,
    }),

    db
      .select({
        count: count(),
      })
      .from(itemEvents),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const logs: LogEntry[] = events.map((event) => {
    let from: string | null = null;
    let to: string | null = null;

    switch (event.type) {
      case 'owner_change':
        from = event.fromOwnerName;
        to = event.toOwnerName;
        break;

      case 'reassignment':
        from = event.fromAssignedName;
        to = event.toAssignedName;
        break;

      case 'transfer':
        from = event.fromHolderName;
        to = event.toHolderName;
        break;
    }

    return {
      id: event.id,
      type: event.type,
      from,
      to,
      changedBy: event.changedByUser?.username ?? 'Unknown',
      timestamp: event.createdAt,
      snapshot: event.snapshot,
    };
  });

  return {
    logs,
    total,
    page: safePage,
    pageSize: pageSize,
    totalPages,
  };
}
