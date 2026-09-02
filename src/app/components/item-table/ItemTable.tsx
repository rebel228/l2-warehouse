'use client';
import { itemsMocks, typeIcon, mockItem } from '@/lib/mock';
import { ContextMenuWrapper } from '../shared/ContextMenu';
import { Edit, Trash2, Users, RotateCcw, MoveRight } from 'lucide-react';
import { MenuItem } from '@/lib/types/context-menu';

const headers = ['Name', 'Grade', 'Type', 'Status', 'Owner', 'Assigned', 'Holder'];

const getItemMenuItems = (item: mockItem): MenuItem[] => [
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
        <ContextMenuWrapper key={item.id} items={getItemMenuItems(item)}>
          <div className="grid grid-cols-[1fr_0.5fr_1fr_1fr_0.7fr_1fr_1fr] gap-0 border-b px-2 py-2 hover:bg-muted/50 cursor-context-menu">
            <div className="font-medium truncate flex items-center gap-2">
              <span className="mr-1">{typeIcon[item.type]}</span>
              {item.name}
            </div>
            <div className="text-center font-mono font-semibold">{item.grade}</div>
            <div className="truncate">{item.type}</div>
            <div className="truncate">{item.status}</div>
            <div className="truncate">{item.owner}</div>
            <div className="truncate">{item.assigned}</div>
            <div className="truncate">{item.holder}</div>
          </div>
        </ContextMenuWrapper>
      ))}
    </div>
  );
};

export default ItemTable;
