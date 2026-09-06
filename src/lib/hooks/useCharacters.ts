import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CharacterWithRelations, deleteCharacter, getCharacters } from '@/app/actions/characters';

export function useCharacters(initialData?: CharacterWithRelations[]) {
  return useQuery({
    queryKey: ['characters'],
    queryFn: getCharacters,
    initialData,
    staleTime: 10 * 1000,
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
