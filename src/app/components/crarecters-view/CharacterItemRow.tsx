import { mockItem } from '@/lib/mock';
import { useState } from 'react';
import { ContextMenuWrapper } from '../shared/ContextMenu';
import { MenuAction } from '@/lib/types/context-menu';
import { Users, RotateCcw, MoveRight, Edit, Trash2 } from 'lucide-react';

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

export default function CharacterItemRow({ item }: { item: mockItem }) {
  const [isSelected, setIsSelected] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) setIsSelected(false);
  };

  return (
    <ContextMenuWrapper actions={itemActions(item)} onOpenChange={handleOpenChange}>
      <div
        className={`flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50 cursor-context-menu text-sm ${
          isSelected ? 'bg-muted/90' : ''
        }`}
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
