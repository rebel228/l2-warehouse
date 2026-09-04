import { useQuery } from '@tanstack/react-query';
import { CharacterWithRelations, getCharacters } from '@/app/actions/characters';

export function useCharacters(initialData?: CharacterWithRelations[]) {
  return useQuery({
    queryKey: ['characters'],
    queryFn: getCharacters,
    initialData,
    staleTime: 10 * 1000,
  });
}
