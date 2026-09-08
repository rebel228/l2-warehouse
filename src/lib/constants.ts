export const ITEM_GRID_COLS = 'grid-cols-[1fr_0.5fr_1fr_1fr_0.7fr_1fr_1fr]';
export const GRADES = ['NG', 'D', 'C', 'B', 'A', 'S'] as const;
export const ITEM_TYPES = ['Weapon', 'Armor', 'Accessory'] as const;
export const DEFAULT_PAGE_SIZE = 20;
export const CHARACTER_CLASSES = [
  'Gladiator',
  'Warlord',
  'Paladin',
  'Dark Avenger',
  'Hawkeye',
  'Treasure Hunter',
  'Sorcerer',
  'Necromancer',
  'Warlock',
  'Bishop',
  'Prophet',
  'Temple Knight',
  'Sword Singer',
  'Plains Walker',
  'Silver Ranger',
  'Spell Singer',
  'Elemental Summoner',
  'Elven Elder',
  'Shillien Knight',
  'Blade Dancer',
  'Abyss Walker',
  'Phantom Ranger',
  'Spellhowler',
  'Phantom Summoner',
  'Shillien Elder',
  'Destroyer',
  'Tyrant',
  'Overlord',
  'Warcryer',
  'Bounty Hunter',
  'Warsmith',
] as const;

export type CharacterClass = (typeof CHARACTER_CLASSES)[number];
