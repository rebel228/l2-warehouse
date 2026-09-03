'use client';

import { mockCharacter, mockItem } from '@/lib/mock';
import { MenuAction } from '@/lib/types/context-menu';
import { CharacterCardProps } from '@/lib/types/dashboard';
import { Edit, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import { ContextMenuWrapper } from '@/app/components/shared/ContextMenu';
import CharacterItemRow from './CharacterItemRow';
import { Button } from '../ui/button';

const characterActions = (character: mockCharacter): MenuAction[] => [
  {
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: () => console.log('edit', character),
  },
  {
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: () => console.log('delete', character),
    variant: 'destructive',
  },
];

type ItemGroup = {
  item: mockItem;
  type: 'assigned_in_place' | 'assigned_missing' | 'held_foreign';
};

const buildItemList = (character: mockCharacter): ItemGroup[] => {
  const assigned = character.assignedItems || [];
  const held = character.holdsItems || [];

  const assignedItems: ItemGroup[] = assigned.map((item) => {
    const isInPlace = held.some((h) => h.id === item.id);
    return {
      item,
      type: isInPlace ? 'assigned_in_place' : 'assigned_missing',
    };
  });

  const heldForeign: ItemGroup[] = held
    .filter((item) => !assigned.some((a) => a.id === item.id))
    .map((item) => ({
      item,
      type: 'held_foreign',
    }));

  return [...assignedItems, ...heldForeign];
};

export default function CharacterCard({ character }: CharacterCardProps) {
  const itemList = buildItemList(character);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('edit', character);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('delete', character);
  };

  return (
    <ContextMenuWrapper actions={characterActions(character)}>
      <div className="w-80 flex-shrink-0 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
        <Accordion className="w-full">
          <AccordionItem value="items" className="border-0">
            <AccordionTrigger className="flex flex-col w-full px-2 py-2 gap-1 hover:bg-muted/30 rounded-t-lg hover:no-underline [&[data-state=open]]:text-foreground">
              <div className="flex justify-between items-start w-full">
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-base">
                    {character.characterName}{' '}
                    <span className="font-normal text-muted-foreground text-sm">
                      ({character.class})
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Owner: {character.user} · Clan: {character.clan}
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
                    onClick={handleDelete}
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
      </div>
    </ContextMenuWrapper>
  );
}
