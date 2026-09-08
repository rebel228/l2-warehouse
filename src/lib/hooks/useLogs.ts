import { getLogs } from '@/app/actions/logs';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '../constants';

export function useLogs(page: number) {
  return useQuery({
    queryKey: ['logs', page],
    queryFn: () => getLogs(page, DEFAULT_PAGE_SIZE),
    staleTime: 30 * 1000,
  });
}
