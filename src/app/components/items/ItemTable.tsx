'use client';
import { ItemRow } from './ItemRow';
import { ITEM_GRID_COLS } from '@/lib/constants/grid';
import { buildMenu } from '@/lib/helpers/item-helpers';
import { useDeleteItem, useItems } from '@/lib/hooks/useItems';
import { ItemTableProps } from '@/lib/types/dashboard';
import { useState } from 'react';
import { ConfirmDialog } from '../shared/AlertDialog';

const headers = ['Name', 'Grade', 'Type', 'Status', 'Owner', 'Assigned', 'Holder'];

export default function ItemTable({ initialItems }: ItemTableProps) {
  const { data: items, isLoading, error } = useItems(initialItems);
  const deleteMutation = useDeleteItem();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      deleteMutation.mutate(itemToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        },
      });
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
          <ItemRow key={item.id} item={item} actions={buildMenu(item, handleDeleteClick)} />
        ))}
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${itemToDelete}"? This action cannot be undone.`}
        isPending={deleteMutation.isPending}
        pendingText="Deleting..."
      />
    </div>
  );
}
