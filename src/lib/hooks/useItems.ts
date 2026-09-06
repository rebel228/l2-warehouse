import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteItem, getItems, ItemWithRelations } from '@/app/actions/items';

export function useItems(initialData?: ItemWithRelations[]) {
  return useQuery({
    queryKey: ['items'],
    queryFn: getItems,
    initialData,
    staleTime: 10 * 1000,
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
