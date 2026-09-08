import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addItem,
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

export function useAddItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addItem,

    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['items'],
        });
      }
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['items'],
        });
      }
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
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['items'],
        });
      }
    },
  });
}

export function useUpdateItemAssigned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, characterId }: { id: number; characterId: number | null }) =>
      updateItemAssigned(id, characterId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['items'],
        });
      }
    },
  });
}

export function useUpdateItemHolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, characterId }: { id: number; characterId: number | null }) =>
      updateItemHolder(id, characterId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['items'],
        });
      }
    },
  });
}
