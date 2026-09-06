'use client';
import { ItemRow } from './ItemRow';
import { ITEM_GRID_COLS } from '@/lib/constants/grid';
import { buildMenu } from '@/lib/helpers/item-helpers';
import { useDeleteItem, useItems } from '@/lib/hooks/useItems';
import { ItemTableProps } from '@/lib/types/dashboard';

const headers = ['Name', 'Grade', 'Type', 'Status', 'Owner', 'Assigned', 'Holder'];

export default function ItemTable({ initialItems }: ItemTableProps) {
  const { data: items, isLoading, error } = useItems(initialItems);
  const deleteMutation = useDeleteItem();

  const handleDelete = (id: number) => {
    if (confirm('Are you sure?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading items</div>;
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Items</h1>
      <div className="w-full overflow-x-auto">
        <div className={`grid ${ITEM_GRID_COLS} gap-0 border-b bg-muted/50 px-2 py-2 font-medium`}>
          {headers.map((h) => (
            <div key={h} className="truncate">
              {h}
            </div>
          ))}
        </div>
        {items?.map((item) => (
          <ItemRow key={item.id} item={item} actions={buildMenu(item, handleDelete)} />
        ))}
      </div>
    </div>
  );
}
