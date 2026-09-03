import { mockItem } from '@/lib/mock';
import { useState } from 'react';
import { ContextMenuWrapper } from '../shared/ContextMenu';
import { MenuAction } from '@/lib/types/context-menu';
import { Users, RotateCcw, MoveRight, Edit, Trash2 } from 'lucide-react';
import { CharacterItemRowProps, itemVariant } from '@/lib/types/dashboard';

const itemActions = (item: mockItem): MenuAction[] => [
  {
    label: 'Change Owner',
    icon: <Users className="h-4 w-4" />,
    onClick: () => console.log('change owner', item),
  },
  {
    label: 'Reassign',
    icon: <RotateCcw className="h-4 w-4" />,
    onClick: () => console.log('reassign', item),
  },
  {
    label: 'Transfer',
    icon: <MoveRight className="h-4 w-4" />,
    onClick: () => console.log('transfer', item),
  },
  { type: 'separator' },
  {
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: () => console.log('edit', item),
  },
  {
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: () => console.log('delete', item),
    variant: 'destructive',
  },
];

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

export default function CharacterItemRow({ item, variant }: CharacterItemRowProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) setIsSelected(false);
  };

  const styles = itemStyles[variant];
  const baseClasses =
    'flex items-center justify-between px-2 py-1 rounded cursor-context-menu text-sm transition-colors';

  return (
    <ContextMenuWrapper actions={itemActions(item)} onOpenChange={handleOpenChange}>
      <div
        className={`
          ${baseClasses} ${styles.hover}
          ${isSelected ? styles.selected : styles.default}
          ${isSelected ? 'hover:bg-inherit' : ''}
        `}
        onContextMenu={() => setIsSelected(true)}
      >
        <span className="font-medium">{item.name}</span>
        <span className="text-muted-foreground text-xs">
          {item.type} · {item.grade}
        </span>
      </div>
    </ContextMenuWrapper>
  );
}
