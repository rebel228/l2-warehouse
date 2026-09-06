import { CharacterWithRelations } from '@/app/actions/characters';
import { ItemType, itemVariant } from '../types/dashboard';

export type ItemGroup = {
  item: ItemType;
  type: itemVariant;
};

export const buildItemList = (character: CharacterWithRelations): ItemGroup[] => {
  const assigned = character.assignedItems ?? [];
  const held = character.heldItems ?? [];

  const assignedGroups: ItemGroup[] = assigned.map((item) => {
    const isInPlace = held.some((h) => h.id === item.id);
    return {
      item,
      type: isInPlace ? 'assigned_in_place' : 'assigned_missing',
    };
  });

  const heldForeignGroups: ItemGroup[] = held
    .filter((item) => !assigned.some((a) => a.id === item.id))
    .map((item) => ({
      item,
      type: 'held_foreign',
    }));

  return [...assignedGroups, ...heldForeignGroups];
};

export function getDeleteDescription(character: CharacterWithRelations): string {
  const assignedCount = character.assignedItems?.length ?? 0;
  const heldCount = character.heldItems?.length ?? 0;

  return assignedCount > 0 || heldCount > 0
    ? `${assignedCount > 0 ? `All ${assignedCount} assigned item(s) will be unassigned.` : ''}${
        assignedCount > 0 && heldCount > 0 ? ' ' : ''
      }${heldCount > 0 ? `All ${heldCount} currently possesed item(s) will be moved to the bank.` : ''}`
    : `Are you sure you want to delete "${character.name}"? This action cannot be undone.`;
}
