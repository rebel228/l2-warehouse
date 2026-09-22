import { Swords } from 'lucide-react';
import { CharacterWithRelations } from '@/app/actions/characters';
import { ItemWithRelations } from '@/app/actions/items';
import { buildMenu } from './item-helpers';
import { MenuAction } from '../types/context-menu';
import { ItemGroup } from '../types/dashboard';

export function buildItemList(character: CharacterWithRelations): ItemGroup[] {
  const assigned = character.assignedItems ?? [];
  const held = character.heldItems ?? [];

  const assignedGroups: ItemGroup[] = assigned
    .filter((item) => {
      const heldItem = held.find((h) => h.id === item.id);
      return !heldItem || heldItem.slot === null;
    })
    .map((item) => {
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
}

// Character-page-only menu: extends the shared item menu with an Equip/Unequip
// entry, but only when the item is both held AND assigned to this character
// (mirrors the access check in the equipItem server action).
// This intentionally lives here (not in item-helpers) so ItemTable/ItemRow
// never see this action.
export const buildCharacterItemMenu = (
  item: ItemWithRelations,
  characterId: number,
  onDelete: (id: number) => void,
  onEdit: (item: ItemWithRelations) => void,
  onAction: (item: ItemWithRelations, type: 'owner' | 'assigned' | 'holder') => void,
  onEquip: (item: ItemWithRelations) => void,
  onUnequip: (item: ItemWithRelations) => void
): MenuAction[] => {
  const baseActions = buildMenu(item, onDelete, onEdit, onAction);

  const canEquip = item.holderId === characterId && item.assignedId === characterId;

  if (!canEquip) {
    return baseActions;
  }

  const isEquipped = item.slot !== null;

  const equipAction: MenuAction = {
    label: isEquipped ? 'Unequip' : 'Equip',
    icon: <Swords className="h-4 w-4" />,
    onClick: () => (isEquipped ? onUnequip(item) : onEquip(item)),
  };

  return [equipAction, { type: 'separator' }, ...baseActions];
};
