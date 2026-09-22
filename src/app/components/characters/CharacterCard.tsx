'use client';

import Image from 'next/image';
import { CharacterCardProps } from '@/lib/types/dashboard';
import { Edit, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import { Button } from '../ui/button';
import { buildCharacterItemMenu, buildItemList } from '@/lib/helpers/character-helpers';
import CharacterItemRow from './CharacterItemRow';
import { useDeleteCharacter } from '@/lib/hooks/useCharacters';
import { useDeleteItem, useEquipItem, useUnequipItem } from '@/lib/hooks/useItems';
import { useState } from 'react';
import { CharacterWithRelations } from '@/app/actions/characters';
import { ItemWithRelations } from '@/app/actions/items';
import { ConfirmDialog } from '../shared/AlertDialog';
import { ItemDialogForm } from '../items/ItemDialogForm';
import { ItemActionDialog } from '../items/ItemActionDialog';
import { toast } from 'sonner';
import { ContextMenuWrapper } from '../shared/ContextMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type EquipmentSlot = {
  key: string;
  label: string;
  rowClass: string;
  colClass: string;
};

const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  { key: 'helmet', label: 'Helmet', rowClass: 'row-start-1', colClass: 'col-start-2' },
  { key: 'necklace', label: 'Necklace', rowClass: 'row-start-1', colClass: 'col-start-5' },
  { key: 'weapon', label: 'Weapon', rowClass: 'row-start-2', colClass: 'col-start-1' },
  { key: 'chest', label: 'Chest', rowClass: 'row-start-2', colClass: 'col-start-2' },
  { key: 'offhand', label: 'Offhand', rowClass: 'row-start-2', colClass: 'col-start-3' },
  { key: 'earring_left', label: 'Earring', rowClass: 'row-start-2', colClass: 'col-start-4' },
  { key: 'earring_righ', label: 'Earring', rowClass: 'row-start-2', colClass: 'col-start-5' },
  { key: 'gloves', label: 'Gloves', rowClass: 'row-start-3', colClass: 'col-start-1' },
  { key: 'legs', label: 'Legs', rowClass: 'row-start-3', colClass: 'col-start-2' },
  { key: 'boots', label: 'Boots', rowClass: 'row-start-3', colClass: 'col-start-3' },
  { key: 'ring_left', label: 'Ring', rowClass: 'row-start-3', colClass: 'col-start-4' },
  { key: 'ring_right', label: 'Ring', rowClass: 'row-start-3', colClass: 'col-start-5' },
];

export default function CharacterCard({ character, onEdit }: CharacterCardProps) {
  const itemList = buildItemList(character);
  const deleteMutation = useDeleteCharacter();

  const [isEquipmentSelected, setIsEquipmentSelected] = useState(false);

  const deleteItemMutation = useDeleteItem();
  const equipItemMutation = useEquipItem();
  const unequipItemMutation = useUnequipItem();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<CharacterWithRelations | null>(null);

  const [itemDeleteDialogOpen, setItemDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);

  const [editingItem, setEditingItem] = useState<ItemWithRelations | null>(null);
  const [isItemEditDialogOpen, setIsItemEditDialogOpen] = useState(false);

  const [itemActionDialogOpen, setItemActionDialogOpen] = useState(false);
  const [itemActionTarget, setItemActionTarget] = useState<ItemWithRelations | null>(null);
  const [itemActionType, setItemActionType] = useState<'owner' | 'assigned' | 'holder'>('owner');

  const getDeleteDescription = (character: CharacterWithRelations): string => {
    const assignedCount = character.assignedItems?.length ?? 0;
    const heldCount = character.heldItems?.length ?? 0;

    return assignedCount > 0 || heldCount > 0
      ? `${assignedCount > 0 ? `All ${assignedCount} assigned item(s) will be unassigned.` : ''}${
          assignedCount > 0 && heldCount > 0 ? ' ' : ''
        }${heldCount > 0 ? `All ${heldCount} currently possessed item(s) will be moved to the bank.` : ''}`
      : `Are you sure you want to delete "${character.name}"? This action cannot be undone.`;
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(character);
  };

  const handleDeleteClick = (char: CharacterWithRelations) => {
    setCharacterToDelete(char);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;
    const data = await deleteMutation.mutateAsync(characterToDelete.id);

    if (!data.success) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);

    setDeleteDialogOpen(false);
    setCharacterToDelete(null);
  };

  const handleItemEdit = (item: ItemWithRelations) => {
    setEditingItem(item);
    setIsItemEditDialogOpen(true);
  };

  const handleItemEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingItem(null);
    }
    setIsItemEditDialogOpen(open);
  };

  const handleItemDelete = (id: number) => {
    setItemToDeleteId(id);
    setItemDeleteDialogOpen(true);
  };

  const handleConfirmItemDelete = async () => {
    if (itemToDeleteId === null) return;
    const data = await deleteItemMutation.mutateAsync(itemToDeleteId);

    if (!data.success) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);
    setItemDeleteDialogOpen(false);
    setItemToDeleteId(null);
  };

  const handleItemAction = (item: ItemWithRelations, type: 'owner' | 'assigned' | 'holder') => {
    setItemActionTarget(item);
    setItemActionType(type);
    setItemActionDialogOpen(true);
  };

  const handleEquip = async (item: ItemWithRelations) => {
    const data = await equipItemMutation.mutateAsync({
      itemId: item.id,
      characterId: character.id,
    });

    if (!data.success) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);
  };

  const handleUnequip = async (item: ItemWithRelations) => {
    const data = await unequipItemMutation.mutateAsync({
      itemId: item.id,
      characterId: character.id,
    });

    if (!data.success) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);
  };

  const handleEquipmentOpenChange = (open: boolean) => {
    if (!open) setIsEquipmentSelected(false);
  };

  const getEquipmentItem = (slotKey: string, items: typeof character.heldItems) => {
    const item = items.find((item) => item.slot === slotKey);

    if (item) {
      return {
        item,
        dimmed: false,
      };
    }

    const twoHandedWeapon = items.find(
      (item) => item.slot === 'weapon' && item.bodypart === 'Two-handed'
    );

    if (twoHandedWeapon && slotKey === 'offhand') {
      return {
        item: twoHandedWeapon,
        dimmed: true,
      };
    }

    const fullArmor = items.find((item) => item.slot === 'chest' && item.bodypart === 'Full Armor');

    if (fullArmor && slotKey === 'legs') {
      return {
        item: fullArmor,
        dimmed: true,
      };
    }

    return null;
  };

  return (
    <div className="w-80 flex-shrink-0">
      <Accordion className="w-full bg-card border shadow-sm hover:shadow-md transition-shadow">
        <AccordionItem value={character.id} className="border-0">
          <AccordionTrigger className="flex flex-col w-full px-2 py-2 gap-1 hover:bg-muted/30 rounded-t-lg hover:no-underline [&[data-state=open]]:text-foreground">
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-base">
                  {character.name}{' '}
                  <span className="font-normal text-muted-foreground text-sm">
                    ({character.class})
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Owner:{character.user.username}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-1 pb-3 pt-1">
            <div className="flex justify-end items-center w-full border-b border-zinc-700/60 pb-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(character)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>

            <div className="border-b border-zinc-700/60 px-1 pb-3 pt-3">
              <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Equipment
              </h4>
              <div className="grid grid-cols-5 grid-rows-3 gap-1.5 rounded-md bg-zinc-900/40 p-1.5">
                {EQUIPMENT_SLOTS.map((slot) => {
                  const equipment = getEquipmentItem(slot.key, character.heldItems);
                  const content = (
                    <Tooltip>
                      {equipment ? (
                        <TooltipTrigger>
                          {equipment.item.imageUrl ? (
                            <Image
                              src={equipment.item.imageUrl}
                              alt={equipment.item.name}
                              width={40}
                              height={40}
                              className={`h-full w-full object-contain p-1 ${
                                equipment.dimmed ? 'opacity-40' : ''
                              }`}
                            />
                          ) : (
                            <span className={`text-xs ${equipment.dimmed ? 'opacity-40' : ''}`}>
                              {equipment.item.name}
                            </span>
                          )}
                        </TooltipTrigger>
                      ) : (
                        <span className="text-center text-[8px] font-medium uppercase leading-tight tracking-wide text-zinc-500">
                          {slot.label}
                        </span>
                      )}

                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {equipment?.item.name}
                            {equipment?.item.enchantLevel ? ` +${equipment.item.enchantLevel}` : ''}
                          </div>
                          <div>Owner: {equipment?.item.ownerUser?.username ?? '—'}</div>
                          <div>Assigned: {equipment?.item.assignedChar?.name ?? '—'}</div>
                          <div>Holder: {equipment?.item.holderChar?.name ?? '—'}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                  if (!equipment) {
                    return (
                      <div
                        key={slot.key}
                        className={`${slot.rowClass} ${slot.colClass} flex aspect-square items-center justify-center rounded-md border border-zinc-700/70 bg-zinc-900/70`}
                      >
                        {content}
                      </div>
                    );
                  }
                  return (
                    <ContextMenuWrapper
                      key={slot.key}
                      className={`${slot.rowClass} ${slot.colClass} flex aspect-square items-center justify-center rounded-md border border-zinc-700/70 bg-zinc-900/70`}
                      actions={
                        equipment
                          ? buildCharacterItemMenu(
                              equipment.item,
                              character.id,
                              handleItemDelete,
                              handleItemEdit,
                              handleItemAction,
                              handleEquip,
                              handleUnequip
                            )
                          : []
                      }
                      onOpenChange={handleEquipmentOpenChange}
                    >
                      {content}
                    </ContextMenuWrapper>
                  );
                })}
              </div>
            </div>

            <div className="px-1 pt-3">
              {itemList.length === 0 ? (
                <div className="text-sm text-zinc-400 text-center py-2">No items</div>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {itemList.map(({ item, type }) => {
                    const actions = buildCharacterItemMenu(
                      item,
                      character.id,
                      handleItemDelete,
                      handleItemEdit,
                      handleItemAction,
                      handleEquip,
                      handleUnequip
                    );

                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger render={<div className="w-full" />}>
                          <CharacterItemRow item={item} variant={type} actions={actions} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            {item.name}
                            {item.enchantLevel ? ` +${item.enchantLevel}` : ''}
                            <div>Owner: {item.ownerUser?.username ?? '—'}</div>
                            <div>Assigned: {item.assignedChar?.name ?? '—'}</div>
                            <div>Holder: {item.holderChar?.name ?? '—'}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Character"
        description={getDeleteDescription(character)}
        isPending={deleteMutation.isPending}
        pendingText="Deleting..."
      />
      <ItemDialogForm
        key={editingItem?.id ?? 'new'}
        open={isItemEditDialogOpen}
        onOpenChange={handleItemEditDialogOpenChange}
        itemToEdit={editingItem}
      />
      <ItemActionDialog
        open={itemActionDialogOpen}
        onOpenChange={setItemActionDialogOpen}
        item={itemActionTarget}
        actionType={itemActionType}
      />
      <ConfirmDialog
        open={itemDeleteDialogOpen}
        onOpenChange={setItemDeleteDialogOpen}
        onConfirm={handleConfirmItemDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        isPending={deleteItemMutation.isPending}
        pendingText="Deleting..."
      />
    </div>
  );
}
