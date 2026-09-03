import { mockCharacter, mockItem } from '../mock';
import { MenuAction } from './context-menu';

export interface ItemRowProps {
  item: mockItem;
  actions: MenuAction[];
}

export interface CharacterCardProps {
  character: mockCharacter;
  actions?: MenuAction[];
}

export type itemVariant = 'assigned_in_place' | 'assigned_missing' | 'held_foreign';

export interface CharacterItemRowProps {
  item: mockItem;
  variant: itemVariant;
}

export type ItemGroup = {
  item: mockItem;
  type: 'assigned_in_place' | 'assigned_missing' | 'held_foreign';
};
