'use server';

import { db } from '@/lib/db';
import { LogEntry } from '@/lib/types/logs';

export async function getLogs(): Promise<LogEntry[]> {
  const events = await db.query.itemEvents.findMany({
    with: {
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
}
