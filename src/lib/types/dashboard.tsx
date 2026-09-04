import { ItemWithRelations } from '@/app/actions/items';
import { mockCharacter, mockItem } from '../mock';
import { MenuAction } from './context-menu';
import { CharacterWithRelations, getCharacters } from '@/app/actions/characters';

export type ItemType = NonNullable<CharacterWithRelations['assignedItems']>[0];

export interface ItemTableProps {
  initialItems: ItemWithRelations[];
}
export interface ItemRowProps {
  item: ItemWithRelations;
  actions: MenuAction[];
}

export interface CharacterTableProps {
  initialData: CharacterWithRelations[];
}

export interface CharacterCardProps {
  character: CharacterWithRelations;
  actions?: MenuAction[];
}

export type itemVariant = 'assigned_in_place' | 'assigned_missing' | 'held_foreign';

export interface CharacterItemRowProps {
  item: ItemType;
  variant: itemVariant;
}

export type CharacterItem = NonNullable<
  Awaited<ReturnType<typeof getCharacters>>[number]['assignedItems']
>[0];

export type ItemGroup = {
  item: ItemWithRelations;
  type: 'assigned_in_place' | 'assigned_missing' | 'held_foreign';
};
