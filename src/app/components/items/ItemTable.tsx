'use client';
import { ItemRow } from './ItemRow';
import { ITEM_GRID_COLS } from '@/lib/constants/grid';
import { buildMenu } from '@/lib/helpers/item-helpers';
import { useDeleteItem, useItems } from '@/lib/hooks/useItems';
import { ItemTableProps } from '@/lib/types/dashboard';
import { useState } from 'react';
import { ConfirmDialog } from '../shared/AlertDialog';
import { ItemWithRelations } from '@/app/actions/items';
import { ItemDialogForm } from './ItemDialogForm';
import { ItemActionDialog } from './ItemActionDialog';
import { toast } from 'sonner';

const headers = ['Name', 'Grade', 'Type', 'Status', 'Owner', 'Assigned', 'Holder'];

export default function ItemTable({ initialItems }: ItemTableProps) {
  const { data: items, isLoading, error } = useItems(initialItems);
  const deleteMutation = useDeleteItem();

  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionItem, setActionItem] = useState<ItemWithRelations | null>(null);
  const [actionType, setActionType] = useState<'owner' | 'assigned' | 'holder'>('owner');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ItemWithRelations | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAction = (item: ItemWithRelations, type: 'owner' | 'assigned' | 'holder') => {
    setActionItem(item);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingItem(null);
    }
    setIsEditDialogOpen(open);
  };

  const handleEdit = (item: ItemWithRelations) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete === null) return;
    const data = await deleteMutation.mutateAsync(itemToDelete);

    if (!data.success) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
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
          <ItemRow
            key={item.id}
            item={item}
            actions={buildMenu(item, handleDelete, handleEdit, handleAction)}
          />
        ))}
      </div>
      <ItemDialogForm
        key={editingItem?.id ?? 'new'}
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        itemToEdit={editingItem}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${itemToDelete}"? This action cannot be undone.`}
        isPending={deleteMutation.isPending}
        pendingText="Deleting..."
      />
      <ItemActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        item={actionItem}
        actionType={actionType}
        onSuccess={() => {}}
      />
    </div>
  );
}
