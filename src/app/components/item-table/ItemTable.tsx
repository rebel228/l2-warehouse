'use client';
import { itemsMocks, mockItem } from '@/lib/mock';
import { Edit, Trash2, Users, RotateCcw, MoveRight } from 'lucide-react';
import { MenuAction } from '@/lib/types/context-menu';
import { ItemRow } from './ItemRow';

const headers = ['Name', 'Grade', 'Type', 'Status', 'Owner', 'Assigned', 'Holder'];

const buildMenu = (item: mockItem): MenuAction[] => [
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

const ItemTable = () => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="grid grid-cols-[1fr_0.5fr_1fr_1fr_0.7fr_1fr_1fr] gap-0 border-b bg-muted/50 px-2 py-2 font-medium">
        {headers.map((h) => (
          <div key={h} className="truncate">
            {h}
          </div>
        ))}
      </div>
      {itemsMocks.map((item) => (
        <ItemRow key={item.id} item={item} actions={buildMenu(item)} />
      ))}
    </div>
  );
};

export default ItemTable;
