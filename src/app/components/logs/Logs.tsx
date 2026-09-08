'use client';

import { useLogs } from '@/lib/hooks/useLogs';
import { LogEntry } from '@/lib/types/logs';
import { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
} from '../ui/pagination';

export default function Logs() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useLogs(page);

  if (isLoading) return <div>Loading logs...</div>;
  if (error) return <div>Error loading logs</div>;

  const logs = data?.logs ?? [];
  const totalPages = data?.totalPages ?? 0;

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

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

    if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];

    if (page >= totalPages - 3) {
      return [
        1,
        'ellipsis',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
  };
  if (logs.length === 0) {
    return (
      <div className="w-full">
        <div className="text-muted-foreground text-center py-10">No logs yet</div>
      </div>
    );
  }
  return (
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
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();

                  if (page > 1) {
                    setPage(page - 1);
                  }
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>

            {getPageNumbers().map((pageNumber, index) => {
              if (pageNumber === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === page}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();

                  if (page < totalPages) {
                    setPage(page + 1);
                  }
                }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
