'use client';

import { Button } from '@/app/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import Link from 'next/link';

const Header = () => {
  const handleAddItem = () => {
    console.log('Open Add Item modal');
  };

  const handleAddCharacter = () => {
    console.log('Open Add Character modal');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">L2 Warehouse</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleAddCharacter}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Character</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
