import { ReactNode } from 'react';

export type MenuItemVariant = 'default' | 'destructive';

export interface MenuItem {
  type?: 'item' | 'separator';
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export interface MenuItem {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface ContextMenuWrapperProps {
  children: React.ReactNode;
  items: MenuItem[];
}
