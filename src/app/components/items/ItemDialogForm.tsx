import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { GRADES, ITEM_TYPES } from '@/lib/constants/itemValues';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { addItem, State } from '@/app/actions/items';
import { useActionState, useEffect, useState } from 'react';
import { ItemDialogFormProps } from '@/lib/types/DialogWindow';
import { useDebouncedCallback } from 'use-debounce';
import { getUsers } from '@/app/actions/users';

export function ItemDialogForm({ open, onOpenChange }: ItemDialogFormProps) {
  const grades = GRADES.map((value) => ({ value, label: value }));
  const itemTypes = ITEM_TYPES.map((value) => ({ value, label: value }));
  const initialState: State = { message: null, errors: {}, success: false };
  const [state, formAction] = useActionState(addItem, initialState);
  const [searchTerm, setSearchTerm] = useState('');
  const [userList, setUserList] = useState<{ id: number; username: string; email: string }[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

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
    setSelectedOwnerId(String(user.id));
    setUserList([]);
  };

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            if (selectedOwnerId) {
              formData.append('ownerUserId', selectedOwnerId);
            }
            formAction(formData);
          }}
          className="flex flex-col"
        >
          <FieldGroup className="gap-2">
            <Field>
              <Label htmlFor="name">Name</Label>
              <div className="flex flex-col">
                <Input
                  id="name"
                  name="name"
                  defaultValue="Forgotten Blade"
                  aria-describedby="customer-error"
                />
                <div
                  id="customer-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[2rem]"
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Field className="w-full max-w-xs">
                  <FieldLabel>Grade</FieldLabel>
                  <Select items={grades} name="grade" aria-describedby="grade-error">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {grades.map((grade) => (
                          <SelectItem key={grade.value} value={grade.value}>
                            {grade.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <div
                  id="grade-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[2rem]"
                >
                  {state.errors?.grade &&
                    state.errors.grade.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
              <div>
                <Field className="w-full max-w-xs">
                  <FieldLabel>Type</FieldLabel>
                  <Select items={itemTypes} name="type" aria-describedby="type-error">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {itemTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <div id="type-error" aria-live="polite" aria-atomic="true" className="min-h-[2rem]">
                  {state.errors?.type &&
                    state.errors.type.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
              <div className="flex flex-col">
                <Field>
                  <FieldLabel>Enchant</FieldLabel>
                  <Input
                    id="enchant"
                    placeholder="3"
                    name="enchant"
                    aria-describedby="enchant-error"
                  />
                </Field>
                <div
                  id="enchant-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[2rem]"
                >
                  {state.errors?.enchant &&
                    state.errors.enchant.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </div>
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
                  {state.errors?.ownerUserId &&
                    state.errors.ownerUserId.map((error: string) => (
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
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
