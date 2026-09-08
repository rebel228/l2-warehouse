'use client';

import { CharacterCardProps } from '@/lib/types/dashboard';
import { Edit, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import { Button } from '../ui/button';
import { buildItemList } from '@/lib/helpers/character-helpers';
import CharacterItemRow from './CharacterItemRow';
import { useDeleteCharacter } from '@/lib/hooks/useCharacters';
import { useState } from 'react';
import { CharacterWithRelations } from '@/app/actions/characters';
import { ConfirmDialog } from '../shared/AlertDialog';
import { toast } from 'sonner';

export default function CharacterCard({ character, onEdit }: CharacterCardProps) {
  const itemList = buildItemList(character);
  const deleteMutation = useDeleteCharacter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<CharacterWithRelations | null>(null);

  const getDeleteDescription = (character: CharacterWithRelations): string => {
    const assignedCount = character.assignedItems?.length ?? 0;
    const heldCount = character.heldItems?.length ?? 0;

    return assignedCount > 0 || heldCount > 0
      ? `${assignedCount > 0 ? `All ${assignedCount} assigned item(s) will be unassigned.` : ''}${
          assignedCount > 0 && heldCount > 0 ? ' ' : ''
        }${heldCount > 0 ? `All ${heldCount} currently possessed item(s) will be moved to the bank.` : ''}`
      : `Are you sure you want to delete "${character.name}"? This action cannot be undone.`;
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(character);
  };

  const handleDeleteClick = (char: CharacterWithRelations) => {
    setCharacterToDelete(char);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;
    const data = await deleteMutation.mutateAsync(characterToDelete.id);

    if (!data.success) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);

    setDeleteDialogOpen(false);
    setCharacterToDelete(null);
  };

  return (
    <div className="w-80 flex-shrink-0">
      <Accordion className="w-full bg-card border shadow-sm hover:shadow-md transition-shadow">
        <AccordionItem value={character.id} className="border-0">
          <AccordionTrigger className="flex flex-col w-full px-2 py-2 gap-1 hover:bg-muted/30 rounded-t-lg hover:no-underline [&[data-state=open]]:text-foreground">
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-base">
                  {character.name}{' '}
                  <span className="font-normal text-muted-foreground text-sm">
                    ({character.class})
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Owner:{character.user.username}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-1 pb-3 pt-1">
            <div className="flex justify-end items-center w-full border-b border-border/50">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(character)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
            {itemList.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-2">No items</div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {itemList.map(({ item, type }) => {
                  return <CharacterItemRow key={item.id} item={item} variant={type} />;
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Character"
        description={getDeleteDescription(character)}
        isPending={deleteMutation.isPending}
        pendingText="Deleting..."
      />
    </div>
  );
}
