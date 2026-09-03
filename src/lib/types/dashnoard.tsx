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
