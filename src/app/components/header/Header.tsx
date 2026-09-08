'use client';

import { Button } from '@/app/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ItemDialogForm } from '../items/ItemDialogForm';
import { useState } from 'react';
import { CharacterDialogForm } from '../characters/CharacterDialogForm';

const navLinks = [
  { label: 'Items', href: '/dashboard/items' },
  { label: 'Characters', href: '/dashboard/characters' },
  { label: 'Logs', href: '/dashboard/logs' },
];

const Header = () => {
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">L2 Warehouse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-muted/50 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsItemDialogOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCharacterDialogOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Character</span>
          </Button>
        </div>
      </div>
      <ItemDialogForm open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen} />
      <CharacterDialogForm open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen} />
    </header>
  );
};

export default Header;
