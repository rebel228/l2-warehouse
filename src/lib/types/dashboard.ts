import { ItemWithRelations } from '@/app/actions/items';
import { MenuAction } from './context-menu';
import { CharacterWithRelations } from '@/app/actions/characters';

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
  onEdit: (character: CharacterWithRelations) => void;
}

export type itemVariant = 'assigned_in_place' | 'assigned_missing' | 'held_foreign';

export interface CharacterItemRowProps {
  item: ItemType;
  variant: itemVariant;
}

export type CharacterItem = NonNullable<CharacterWithRelations['assignedItems']>[number];

export type ItemVariant = 'assigned_in_place' | 'assigned_missing' | 'held_foreign';

export type ItemGroup = {
  item: CharacterItem;
  type: ItemVariant;
};
