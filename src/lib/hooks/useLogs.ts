import { getLogs } from '@/app/actions/logs';
import { useQuery } from '@tanstack/react-query';

export function useLogs() {
  return useQuery({
    queryKey: ['logs'],
    queryFn: getLogs,
    staleTime: 30 * 1000,
  });
}
