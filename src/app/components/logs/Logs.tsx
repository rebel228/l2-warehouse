'use client';

import { useLogs } from '@/lib/hooks/useLogs';
import { LogEntry } from '@/lib/types/logs';

export default function Logs() {
  const { data: logs, isLoading, error } = useLogs();

  if (isLoading) return <div>Loading logs...</div>;
  if (error) return <div>Error loading logs</div>;

  const getActionText = (log: LogEntry) => {
    switch (log.type) {
      case 'item_created':
        return 'Item created';

      case 'item_deleted':
        return 'Item deleted';

      case 'owner_change':
        return `Owner changed from ${log.from || '—'} to ${log.to || '—'}`;

      case 'reassignment':
        return `Reassigned from ${log.from || '—'} to ${log.to || '—'}`;

      case 'transfer':
        return `Transferred from ${log.from || 'bank'} to ${log.to || 'bank'}`;
    }
  };

  return (
    <div className="w-full">
      {logs?.length === 0 ? (
        <div className="text-muted-foreground text-center py-10">No logs yet</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Time</th>
                <th className="text-left px-4 py-2 font-medium">Item</th>
                <th className="text-left px-4 py-2 font-medium">Action</th>
                <th className="text-left px-4 py-2 font-medium">Changed By</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map((log) => {
                return (
                  <tr key={`${log.type}-${log.id}`} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2 text-sm">
                      {new Date(log.timestamp).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {log.snapshot.name}
                      {log.snapshot.enchantLevel !== 0 && ` +${log.snapshot.enchantLevel}`}
                    </td>
                    <td className="px-4 py-2 text-sm">{getActionText(log)}</td>
                    <td className="px-4 py-2 text-sm">{'Unknown'}</td>
                    {/* Change changyBy later, after authorization */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
