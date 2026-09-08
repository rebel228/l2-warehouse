import { Edit, Trash2, Users, RotateCcw, MoveRight } from 'lucide-react';
import { ItemWithRelations } from '@/app/actions/items';
import { MenuAction } from '../types/context-menu';
import { Item, ItemEventSnapshot } from '../db/schema';

export function getItemStatus(
  assignedId: number | null | undefined,
  holderId: number | null | undefined
): 'in_bank' | 'assigned' | 'held' {
  const a = assignedId ?? null;
  const h = holderId ?? null;
  if (h === null) {
    if (a === null) return 'in_bank';
    return 'assigned';
  }

  if (a === null) return 'held';

  return a === h ? 'assigned' : 'held';
}

export const buildMenu = (
  item: ItemWithRelations,
  onDelete: (id: number) => void,
  onEdit: (item: ItemWithRelations) => void,
  onAction: (item: ItemWithRelations, type: 'owner' | 'assigned' | 'holder') => void
): MenuAction[] => [
  {
    label: 'Change Owner',
    icon: <Users className="h-4 w-4" />,
    onClick: () => onAction(item, 'owner'),
  },
  {
    label: 'Reassign',
    icon: <RotateCcw className="h-4 w-4" />,
    onClick: () => onAction(item, 'assigned'),
  },
  {
    label: 'Transfer',
    icon: <MoveRight className="h-4 w-4" />,
    onClick: () => onAction(item, 'holder'),
  },
  { type: 'separator' },
  {
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: () => onEdit(item),
  },
  {
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: () => onDelete(item.id),
    variant: 'destructive',
  },
];

export function createItemSnapshot(item: Item): ItemEventSnapshot {
  return {
    name: item.name,
    type: item.type,
    grade: item.grade,
    enchantLevel: item.enchantLevel,
    imageUrl: item.imageUrl,
    status: item.status,
    ownerUserId: item.ownerUserId,
    ownerClanId: item.ownerClanId,
    assignedId: item.assignedId,
    holderId: item.holderId,
  };
}
