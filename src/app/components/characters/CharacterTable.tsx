'use client';

import { useCharacters } from '@/lib/hooks/useCharacters';
import { CharacterTableProps } from '@/lib/types/dashboard';
import CharacterCard from './CharacterCard';
import { CharacterWithRelations } from '@/app/actions/characters';
import { useState } from 'react';
import { CharacterDialogForm } from './CharacterDialogForm';

export default function CharactersTable({ initialData }: CharacterTableProps) {
  const { data: characters, isLoading, error } = useCharacters(initialData);

  const [editingCharacter, setEditingCharacter] = useState<CharacterWithRelations | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingCharacter(null);
    }
    setIsEditDialogOpen(open);
  };

  const handleEdit = (character: CharacterWithRelations) => {
    setEditingCharacter(character);
    setIsEditDialogOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading characters</div>;
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Characters</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {characters?.map((char) => (
          <CharacterCard key={char.id} character={char} onEdit={handleEdit} />
        ))}
      </div>
      <CharacterDialogForm
        key={editingCharacter?.id ?? 'new'}
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        characterToEdit={editingCharacter}
      />
    </div>
  );
}
