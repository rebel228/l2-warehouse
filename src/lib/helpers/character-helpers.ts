import { mockCharacter } from '../mock';
import { ItemGroup } from '../types/dashboard';

export const buildItemList = (character: mockCharacter): ItemGroup[] => {
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
