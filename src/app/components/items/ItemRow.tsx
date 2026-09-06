'use client';
import { ContextMenuWrapper } from '../shared/ContextMenu';
import { useState } from 'react';
import { ItemRowProps, typeIcon } from '@/lib/types/dashboard';
import { ITEM_GRID_COLS } from '@/lib/constants/grid';

export function ItemRow({ item, actions }: ItemRowProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) setIsSelected(false);
  };

  return (
    <ContextMenuWrapper actions={actions} onOpenChange={handleOpenChange}>
      <div
        className={`grid ${ITEM_GRID_COLS} gap-0 border-b px-2 py-2 hover:bg-muted/50 cursor-context-menu ${isSelected ? 'bg-muted/90' : ''}`}
        onContextMenu={() => setIsSelected(true)}
      >
        <div className="font-medium truncate flex items-center gap-2">
          <span className="mr-1">{typeIcon[item.type] || '📦'}</span>
          {item.name}
        </div>
        <div className="text-center font-mono font-semibold">{item.grade}</div>
        <div className="truncate">{item.type}</div>
        <div className="truncate">{item.status}</div>
        <div className="truncate">{item.ownerUser?.username}</div>
        <div className="truncate">{item.assignedChar?.name}</div>
        <div className="truncate">{item.holderChar?.name}</div>
      </div>
    </ContextMenuWrapper>
  );
}
