import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Field, FieldGroup } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useDebouncedCallback } from 'use-debounce';
import { useActionState, useEffect, useState } from 'react';
import { CharacterFormDialogProps } from '@/lib/types/DialogWindow';
import { addCharacter, State } from '@/app/actions/characters';
import { getUsers } from '@/app/actions/users';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { CHARACTER_CLASSES } from '@/lib/constants/charecterClasses';

export function CharacterDialogForm({ open, onOpenChange }: CharacterFormDialogProps) {
  const initialState: State = { message: null, errors: {}, success: false };
  const [state, formAction] = useActionState(addCharacter, initialState);
  const [searchTerm, setSearchTerm] = useState('');
  const [userList, setUserList] = useState<{ id: number; username: string; email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  const handleSearch = useDebouncedCallback(async (value: string) => {
    if (value.length >= 1) {
      const result = await getUsers(value);
      setUserList(result);
    } else {
      setUserList([]);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const handleUserSelect = (user: { id: number; username: string }) => {
    handleSearch.cancel();
    setSearchTerm(user.username);
    setSelectedUserId(String(user.id));
    setUserList([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Character</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            formData.append('userId', selectedUserId);
            formAction(formData);
          }}
          className="flex flex-col"
        >
          <FieldGroup className="gap-2">
            <Field>
              <Label htmlFor="name">Character Name</Label>
              <div className="flex flex-col">
                <Input id="name" name="name" aria-describedby="character-error" />
                <div
                  id="character-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[1.5rem]"
                >
                  {state.errors?.name &&
                    state.errors.name.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </Field>
            <Field>
              <Label htmlFor="class">Class</Label>
              <div className="flex flex-col">
                <Select name="class" aria-describedby="class-error">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CHARACTER_CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div
                  id="class-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[1.5rem]"
                >
                  {state.errors?.class &&
                    state.errors.class.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </Field>
            <Field>
              <Label htmlFor="owner">Owner</Label>
              <div className="flex flex-col">
                <div className="relative">
                  <Input
                    id="owner"
                    aria-describedby="owner-error"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {userList.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-md overflow-hidden">
                      {userList.map((user) => (
                        <div
                          key={user.id}
                          className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted hover:text-muted-foreground"
                          onClick={() => handleUserSelect(user)}
                        >
                          {user.username} ({user.email})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  id="owner-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[2rem]"
                >
                  {state.errors?.userId &&
                    state.errors.userId.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4 pt-4 border-t">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Create Character</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
