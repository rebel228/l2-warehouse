import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteItem, getItems, ItemWithRelations, updateItem } from '@/app/actions/items';

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

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => updateItem(id, formData),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['items'] });
      }
    },
  });
}
