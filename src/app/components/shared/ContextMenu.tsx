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

export function ContextMenuWrapper({ children, actions, onOpenChange }: ContextMenuWrapperProps) {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {actions.map((action, index) => {
          if (action.type === 'separator') {
            return <ContextMenuSeparator key={`sep-${index}`} />;
          }
          return (
            <ContextMenuItem
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={variantClasses[action.variant || 'default']}
            >
              {action.label}
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}
