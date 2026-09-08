'use server';

import { db } from '@/lib/db';
import { LogEntry } from '@/lib/types/logs';

export async function getLogs(): Promise<LogEntry[]> {
  const events = await db.query.itemEvents.findMany({
    with: {
      fromOwner: {
        columns: {
          username: true,
        },
      },
      toOwner: {
        columns: {
          username: true,
        },
      },
      fromAssigned: {
        columns: {
          name: true,
        },
      },
      toAssigned: {
        columns: {
          name: true,
        },
      },
      fromHolder: {
        columns: {
          name: true,
        },
      },
      toHolder: {
        columns: {
          name: true,
        },
      },
      changedByUser: {
        columns: {
          username: true,
        },
      },
    },
    orderBy: (itemEvents, { desc }) => [desc(itemEvents.createdAt), desc(itemEvents.id)],
  });

  return events.map((event) => {
    let from: string | null = null;
    let to: string | null = null;

    switch (event.type) {
      case 'owner_change':
        from = event.fromOwner?.username ?? null;
        to = event.toOwner?.username ?? null;
        break;

      case 'reassignment':
        from = event.fromAssigned?.name ?? null;
        to = event.toAssigned?.name ?? null;
        break;

      case 'transfer':
        from = event.fromHolder?.name ?? null;
        to = event.toHolder?.name ?? null;
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
}
