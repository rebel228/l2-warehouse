'use client';

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ItemWithRelations } from '@/app/actions/items';
import { getUsers } from '@/app/actions/users';
import { searchCharacters } from '@/app/actions/characters';
import {
  useUpdateItemOwner,
  useUpdateItemAssigned,
  useUpdateItemHolder,
} from '@/lib/hooks/useItems';

interface ItemActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemWithRelations | null;
  actionType: 'owner' | 'assigned' | 'holder';
  onSuccess?: () => void;
}

export function ItemActionDialog({
  open,
  onOpenChange,
  item,
  actionType,
  onSuccess,
}: ItemActionDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<{ id: number; label: string; extra?: string }[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const ownerMutation = useUpdateItemOwner();
  const assignedMutation = useUpdateItemAssigned();
  const holderMutation = useUpdateItemHolder();

  const isOwner = actionType === 'owner';
  const title = isOwner ? 'Change Owner' : actionType === 'assigned' ? 'Reassign' : 'Transfer';
  const placeholder = isOwner ? 'Search user...' : 'Search character...';

  const handleSearch = useDebouncedCallback(async (value: string) => {
    if (value.length < 1) {
      setOptions([]);
      return;
    }
    try {
      let results;
      if (isOwner) {
        const users = await getUsers(value);
        results = users.map((u) => ({ id: u.id, label: u.username, extra: u.email }));
      } else {
        const chars = await searchCharacters(value);
        results = chars.map((c) => ({ id: c.id, label: c.name, extra: c.class }));
      }
      setOptions(results);
    } catch (error) {
      console.error('Failed to search:', error);
      setOptions([]);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedId(null);
    setError('');
    handleSearch(value);
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setOptions([]);
    setSearchTerm(options.find((o) => o.id === id)?.label || '');
  };

  const resetState = () => {
    setSearchTerm('');
    setOptions([]);
    setSelectedId(null);
    setError('');
  };

  const handleConfirm = () => {
    if (selectedId === null) {
      setError('Please select a valid option');
      return;
    }
    if (!item) return;

    if (isOwner) {
      ownerMutation.mutate(
        { id: item.id, userId: selectedId },
        {
          onSuccess: (data) => {
            if (!data.success) {
              setError(data.message ?? 'Update failed');
              return;
            }

            onOpenChange(false);
            resetState();
            onSuccess?.();
          },
          onError: () => setError('Update failed'),
        }
      );
      return;
    }

    if (actionType === 'assigned') {
      assignedMutation.mutate(
        { id: item.id, characterId: selectedId },
        {
          onSuccess: (data) => {
            if (data.success) {
              onOpenChange(false);
              resetState();
              onSuccess?.();
            } else {
              setError(data.message ?? 'Update failed');
            }
          },
          onError: () => setError('Update failed'),
        }
      );
      return;
    }

    holderMutation.mutate(
      { id: item.id, characterId: selectedId },
      {
        onSuccess: (data) => {
          if (!data.success) {
            setError(data.message ?? 'Update failed');
            return;
          }

          onOpenChange(false);
          resetState();
          onSuccess?.();
        },
        onError: () => setError('Update failed'),
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Current</Label>
            <div className="text-sm text-muted-foreground mt-1">
              {isOwner
                ? item.ownerUser?.username || '—'
                : actionType === 'assigned'
                  ? `${item.assignedChar?.name || '—'}${item.assignedChar?.class ? ` (${item.assignedChar.class})` : ''}`
                  : `${item.holderChar?.name || '—'}${item.holderChar?.class ? ` (${item.holderChar.class})` : ''}`}
            </div>
          </div>
          <div>
            <Label>
              New {isOwner ? 'Owner' : actionType === 'assigned' ? 'Assigned To' : 'Holder'}
            </Label>
            <div className="relative mt-1">
              <Input placeholder={placeholder} value={searchTerm} onChange={handleSearchChange} />
              {options.length > 0 && (
                <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-md overflow-hidden">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted hover:text-muted-foreground"
                      onClick={() => handleSelect(opt.id)}
                    >
                      <span>{opt.label}</span>
                      {opt.extra && (
                        <span className="ml-2 text-xs text-muted-foreground">({opt.extra})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        </div>
        <DialogFooter className="mt-4 pt-4 border-t">
          <DialogClose
            render={
              <Button variant="outline" type="button">
                Cancel
              </Button>
            }
          ></DialogClose>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={
              ownerMutation.isPending || assignedMutation.isPending || holderMutation.isPending
            }
          >
            {ownerMutation.isPending || assignedMutation.isPending || holderMutation.isPending
              ? 'Saving...'
              : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
