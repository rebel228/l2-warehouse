export type EquipmentSlot =
  | 'weapon'
  | 'offhand'
  | 'helmet'
  | 'chest'
  | 'legs'
  | 'gloves'
  | 'boots'
  | 'necklace'
  | 'earring_left'
  | 'earring_right'
  | 'ring_left'
  | 'ring_right';

type EquipmentItem = {
  type: string;
  bodypart: string | null;
};

export function getOccupiedSlots(item: EquipmentItem, slot: EquipmentSlot): EquipmentSlot[] {
  if (item.type === 'Weapon' && item.bodypart === 'Two-handed') {
    return ['weapon', 'offhand'];
  }

  if (item.type === 'Armor' && item.bodypart === 'Full Armor') {
    return ['chest', 'legs'];
  }

  return [slot];
}
