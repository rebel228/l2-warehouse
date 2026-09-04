'use client';
import { Edit, Trash2, Users, RotateCcw, MoveRight } from 'lucide-react';
import { MenuAction } from '@/lib/types/context-menu';
import { ItemRow } from './ItemRow';
import { ITEM_GRID_COLS } from '@/lib/constants/grid';
import { useItems } from '@/lib/hooks/useItems';
import { ItemWithRelations } from '@/app/actions/items';
import { ItemTableProps } from '@/lib/types/dashboard';

const headers = ['Name', 'Grade', 'Type', 'Status', 'Owner', 'Assigned', 'Holder'];

const buildMenu = (item: ItemWithRelations): MenuAction[] => [
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

export default function ItemTable({ initialItems }: ItemTableProps) {
  const { data: items, isLoading, error } = useItems(initialItems);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading items</div>;
  return (
    <div className="w-full overflow-x-auto">
      <div className={`grid ${ITEM_GRID_COLS} gap-0 border-b bg-muted/50 px-2 py-2 font-medium`}>
        {headers.map((h) => (
          <div key={h} className="truncate">
            {h}
          </div>
        ))}
      </div>
      {items?.map((item) => (
        <ItemRow key={item.id} item={item} actions={buildMenu(item)} />
      ))}
    </div>
  );
}
