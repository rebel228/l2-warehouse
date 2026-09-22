import Image from 'next/image';
import { useState } from 'react';
import { ContextMenuWrapper } from '../shared/ContextMenu';
import { CharacterItemRowProps, itemVariant } from '@/lib/types/dashboard';
import { typeIcon } from '@/lib/constants';

const itemStyles: Record<itemVariant, { default: string; selected: string; hover: string }> = {
  assigned_in_place: {
    default: '',
    selected: 'bg-muted/90',
    hover: 'hover:bg-muted/70',
  },
  assigned_missing: {
    default: 'opacity-50 text-muted-foreground',
    selected: 'bg-muted/90 opacity-90',
    hover: 'hover:opacity-100 hover:bg-muted/50',
  },
  held_foreign: {
    default:
      'bg-yellow-100/50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30',
    selected:
      'bg-yellow-200/70 border border-yellow-300 dark:bg-yellow-800/30 dark:border-yellow-700/30',
    hover: 'hover:bg-yellow-200/70 dark:hover:bg-yellow-800/30',
  },
};

export default function CharacterItemRow({ item, variant, actions }: CharacterItemRowProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) setIsSelected(false);
  };

  const styles = itemStyles[variant];
  const baseClasses =
    'flex items-center gap-2 px-2 py-1 rounded cursor-context-menu text-sm transition-colors';

  return (
    <ContextMenuWrapper actions={actions} onOpenChange={handleOpenChange}>
      <div
        className={`
          ${baseClasses} ${styles.hover}
          ${isSelected ? styles.selected : styles.default}
          ${isSelected ? 'hover:bg-inherit' : ''}
        `}
        onContextMenu={() => setIsSelected(true)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={24}
              height={24}
              className="shrink-0 object-contain"
            />
          ) : (
            <span className="mr-1 shrink-0">{typeIcon[item.type] || '📦'}</span>
          )}
          <span className="truncate font-medium">
            {item.name}
            {item.enchantLevel > 0 && ` +${item.enchantLevel}`}
          </span>
        </div>
        <span className="ml-4 shrink-0 text-muted-foreground text-xs">
          {item.type} · {item.grade}
        </span>
      </div>
    </ContextMenuWrapper>
  );
}
