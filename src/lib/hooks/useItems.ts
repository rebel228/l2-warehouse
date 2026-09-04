import { useQuery } from '@tanstack/react-query';
import { getItems, ItemWithRelations } from '@/app/actions/items';

export function useItems(initialData?: ItemWithRelations[]) {
  return useQuery({
    queryKey: ['items'],
    queryFn: getItems,
    initialData,
    staleTime: 10 * 1000,
  });
}
