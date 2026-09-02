'use client';
import { mockItem, typeIcon } from '@/lib/mock';
import { ContextMenuWrapper } from '../shared/ContextMenu';
import { useState } from 'react';
import { ItemRowProps } from '@/lib/types/context-menu';

export function ItemRow({ item, actions }: ItemRowProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) setIsSelected(false);
  };

  return (
    <ContextMenuWrapper key={item.id} actions={actions}>
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
  );
}
