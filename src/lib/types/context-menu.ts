import { ReactNode } from 'react';
import { mockItem } from '../mock';

export type MenuItemVariant = 'default' | 'destructive';

export interface ItemRowProps {
  item: mockItem;
  actions: MenuAction[];
}

export interface MenuAction {
  type?: 'item' | 'separator';
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

export interface ContextMenuWrapperProps {
  children: React.ReactNode;
  actions: MenuAction[];
}
