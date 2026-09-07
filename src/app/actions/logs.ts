'use server';

import { db } from '@/lib/db';
import { LogEntry } from '@/lib/types/logs';

export async function getLogs(): Promise<LogEntry[]> {
  const transferLogs = await db.query.transfers.findMany({
    with: {
      item: {
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
    orderBy: (transfers, { desc }) => [desc(transfers.transferredAt)],
  });

  const reassignmentLogs = await db.query.reassignments.findMany({
    with: {
      item: {
        columns: {
          name: true,
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
      changedByUser: {
        columns: {
          username: true,
        },
      },
    },
    orderBy: (reassignments, { desc }) => [desc(reassignments.reassignedAt)],
  });

  const transferEntries: LogEntry[] = transferLogs.map((t) => ({
    id: t.id,
    type: 'transfer',
    itemName: t.item?.name ?? 'Unknown item',
    from: t.fromHolder?.name ?? null,
    to: t.toHolder?.name ?? null,
    changedBy: t.changedByUser?.username ?? 'Unknown',
    timestamp: t.transferredAt,
  }));

  const reassignmentEntries: LogEntry[] = reassignmentLogs.map((r) => ({
    id: r.id,
    type: 'reassignment',
    itemName: r.item?.name ?? 'Unknown item',
    from: r.fromAssigned?.name ?? null,
    to: r.toAssigned?.name ?? null,
    changedBy: r.changedByUser?.username ?? 'Unknown',
    timestamp: r.reassignedAt,
  }));

  const allLogs = [...transferEntries, ...reassignmentEntries];
  allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return allLogs;
}
