import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteItem,
  getItems,
  ItemWithRelations,
  updateItem,
  updateItemAssigned,
  updateItemHolder,
  updateItemOwner,
} from '@/app/actions/items';

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

export function useUpdateItemOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number | null }) =>
      updateItemOwner(id, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });
}

export function useUpdateItemAssigned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, characterId }: { id: number; characterId: number | null }) =>
      updateItemAssigned(id, characterId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });
}

export function useUpdateItemHolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, characterId }: { id: number; characterId: number | null }) =>
      updateItemHolder(id, characterId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });
}
