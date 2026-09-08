import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addCharacter,
  CharacterWithRelations,
  deleteCharacter,
  getCharacters,
  updateCharacter,
} from '@/app/actions/characters';

export function useCharacters(initialData?: CharacterWithRelations[]) {
  return useQuery({
    queryKey: ['characters'],
    queryFn: getCharacters,
    initialData,
    staleTime: 10 * 1000,
  });
}

export function useAddCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCharacter,

    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['characters'],
        });
      }
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      updateCharacter(id, formData),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['characters'] });
      }
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}
