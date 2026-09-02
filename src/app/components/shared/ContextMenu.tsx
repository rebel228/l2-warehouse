'use client';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/app/components/ui/context-menu';
import { ContextMenuWrapperProps, MenuItemVariant } from '@/lib/types/context-menu';

const variantClasses: Record<MenuItemVariant, string> = {
  default: '',
  destructive: 'text-destructive focus:bg-destructive/10',
};

export function ContextMenuWrapper({ children, items }: ContextMenuWrapperProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <ContextMenuSeparator key={`sep-${index}`} />;
          }
          return (
            <ContextMenuItem
              key={index}
              onClick={item.onClick}
              disabled={item.disabled}
              className={variantClasses[item.variant || 'default']}
            >
              {item.label}
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}
