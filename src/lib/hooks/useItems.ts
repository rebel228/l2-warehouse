import { useQuery } from '@tanstack/react-query';
import { getItems } from '@/app/actions/items';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: getItems,
  });
}
