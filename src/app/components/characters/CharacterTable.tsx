'use client';

import { useCharacters } from '@/lib/hooks/useCharacters';
import { CharacterTableProps } from '@/lib/types/dashboard';
import CharacterCard from './CharacterCard';

export default function CharactersTable({ initialData }: CharacterTableProps) {
  const { data: characters, isLoading, error } = useCharacters(initialData);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading items</div>;
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Characters</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {characters?.map((char) => (
          <CharacterCard key={char.id} character={char} />
        ))}
      </div>
    </div>
  );
}
