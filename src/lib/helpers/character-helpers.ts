import { CharacterWithRelations } from '@/app/actions/characters';
import { ItemGroup } from '../types/dashboard';

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
