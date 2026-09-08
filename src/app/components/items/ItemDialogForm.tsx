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
import { useState } from 'react';
import { ItemDialogFormProps } from '@/lib/types/DialogWindow';
import { useDebouncedCallback } from 'use-debounce';
import { getUsers } from '@/app/actions/users';
import { searchCharacters } from '@/app/actions/characters';
import { useAddItem, useUpdateItem } from '@/lib/hooks/useItems';
import { ItemFieldErrors } from '@/lib/types/mutations-results';
import { toast } from 'sonner';

export function ItemDialogForm({ open, onOpenChange, itemToEdit }: ItemDialogFormProps) {
  const grades = GRADES.map((value) => ({ value, label: value }));
  const itemTypes = ITEM_TYPES.map((value) => ({ value, label: value }));
  const [fieldErrors, setFieldErrors] = useState<ItemFieldErrors>({});

  const [name, setName] = useState(itemToEdit?.name ?? '');
  const [grade, setGrade] = useState(itemToEdit?.grade ?? '');
  const [type, setType] = useState(itemToEdit?.type ?? '');
  const [enchant, setEnchant] = useState(String(itemToEdit?.enchantLevel ?? 0));

  const [searchTerm, setSearchTerm] = useState(itemToEdit?.ownerUser?.username ?? '');
  const [userList, setUserList] = useState<{ id: number; username: string; email: string }[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState(String(itemToEdit?.ownerUserId ?? ''));
  const [ownerError, setOwnerError] = useState<string>('');

  const [assignedSearchTerm, setAssignedSearchTerm] = useState(
    itemToEdit?.assignedChar?.name ?? ''
  );
  const [assignedList, setAssignedList] = useState<{ id: number; name: string; class: string }[]>(
    []
  );

  const [selectedAssignedId, setSelectedAssignedId] = useState(
    String(itemToEdit?.assignedId ?? '')
  );
  const [assignedError, setAssignedError] = useState<string>('');

  const [holderSearchTerm, setHolderSearchTerm] = useState(itemToEdit?.holderChar?.name ?? '');
  const [holderList, setHolderList] = useState<{ id: number; name: string; class: string }[]>([]);
  const [selectedHolderId, setSelectedHolderId] = useState(String(itemToEdit?.holderId ?? ''));
  const [holderError, setHolderError] = useState<string>('');

  const addMutation = useAddItem();
  const updateMutation = useUpdateItem();

  const resetForm = () => {
    setName('');
    setGrade('D');
    setType('Weapon');
    setEnchant('0');
    setSearchTerm('');
    setSelectedOwnerId('');
    setUserList([]);
    setOwnerError('');
    setAssignedSearchTerm('');
    setSelectedAssignedId('');
    setAssignedList([]);
    setAssignedError('');
    setHolderSearchTerm('');
    setSelectedHolderId('');
    setHolderList([]);
    setHolderError('');
    setFieldErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

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
    setSelectedOwnerId('');
    setSearchTerm(value);
    handleSearch(value);
  };

  const handleUserSelect = (user: { id: number; username: string }) => {
    handleSearch.cancel();
    setSearchTerm(user.username);
    setSelectedOwnerId(String(user.id));
    setUserList([]);
  };

  const handleAssignedSearch = useDebouncedCallback(async (value: string) => {
    if (value.length >= 1) {
      const result = await searchCharacters(value);
      setAssignedList(result);
    } else {
      setAssignedList([]);
    }
  }, 300);

  const handleAssignedSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAssignedSearchTerm(value);
    setSelectedAssignedId('');
    handleAssignedSearch(value);
  };

  const handleAssignedSelect = (character: { id: number; name: string }) => {
    handleAssignedSearch.cancel();
    setAssignedSearchTerm(character.name);
    setSelectedAssignedId(String(character.id));
    setAssignedList([]);
  };

  const handleHolderSearch = useDebouncedCallback(async (value: string) => {
    if (value.length >= 1) {
      const result = await searchCharacters(value);
      setHolderList(result);
    } else {
      setHolderList([]);
    }
  }, 300);

  const handleHolderSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHolderSearchTerm(value);
    setSelectedHolderId('');
    handleHolderSearch(value);
  };

  const handleHolderSelect = (character: { id: number; name: string }) => {
    handleHolderSearch.cancel();
    setHolderSearchTerm(character.name);
    setSelectedHolderId(String(character.id));
    setHolderList([]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFieldErrors({});
    setOwnerError('');
    setAssignedError('');
    setHolderError('');

    if (searchTerm.trim().length > 0 && !selectedOwnerId) {
      setOwnerError('Not a valid user');
      return;
    }

    if (assignedSearchTerm.trim().length > 0 && !selectedAssignedId) {
      setAssignedError('Not a valid character');
      return;
    }

    if (holderSearchTerm.trim().length > 0 && !selectedHolderId) {
      setHolderError('Not a valid character');
      return;
    }

    const formData = new FormData(e.currentTarget);

    if (selectedOwnerId) {
      formData.append('ownerUserId', selectedOwnerId);
    }
    if (selectedAssignedId) {
      formData.append('assignedId', selectedAssignedId);
    }
    if (selectedHolderId) {
      formData.append('holderId', selectedHolderId);
    }
    if (itemToEdit) {
      updateMutation.mutate(
        { id: itemToEdit.id, formData },
        {
          onSuccess: (data) => {
            if (!data.success) {
              if (data.errors) {
                setFieldErrors(data.errors);
              } else toast.error(data.message);

              return;
            }

            toast.success(data.message);
            onOpenChange(false);
            resetForm();
          },
        }
      );
      return;
    }

    addMutation.mutate(formData, {
      onSuccess: (data) => {
        if (!data.success) {
          if (data.errors) {
            setFieldErrors(data.errors);
          } else {
            toast.error(data.message);
          }

          return;
        }

        toast.success(data.message ?? 'Item added successfully');
        onOpenChange(false);
        resetForm();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <FieldGroup className="gap-2">
            <Field>
              <Label htmlFor="name">Name</Label>
              <div className="flex flex-col">
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-describedby="customer-error"
                />
                <div
                  id="customer-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[2rem]"
                >
                  {fieldErrors?.name &&
                    fieldErrors.name.map((error: string) => (
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
                  <Select
                    items={grades}
                    name="grade"
                    value={grade}
                    onValueChange={(val) => setGrade(val ?? 'D')}
                    aria-describedby="grade-error"
                  >
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
                  {fieldErrors?.grade &&
                    fieldErrors.grade.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
              <div>
                <Field className="w-full max-w-xs">
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    items={itemTypes}
                    name="type"
                    value={type}
                    onValueChange={(val) => setType(val ?? 'Weapon')}
                    aria-describedby="type-error"
                  >
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
                  {fieldErrors?.type &&
                    fieldErrors.type.map((error: string) => (
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
                    name="enchant"
                    value={enchant}
                    onChange={(e) => setEnchant(e.target.value)}
                    aria-describedby="enchant-error"
                  />
                </Field>
                <div
                  id="enchant-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[2rem]"
                >
                  {fieldErrors?.enchant &&
                    fieldErrors.enchant.map((error: string) => (
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
                  {ownerError && <p className="mt-0.5 text-sm text-red-500">{ownerError}</p>}
                  {!ownerError &&
                    fieldErrors?.ownerUserId?.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </Field>
            <Field>
              <Label htmlFor="assigned">Assign to</Label>
              <div className="flex flex-col">
                <div className="relative">
                  <Input
                    id="assigned"
                    aria-describedby="assigned-error"
                    value={assignedSearchTerm}
                    onChange={handleAssignedSearchChange}
                  />
                  {assignedList.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-md overflow-hidden">
                      {assignedList.map((character) => (
                        <div
                          key={character.id}
                          className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted hover:text-muted-foreground"
                          onClick={() => handleAssignedSelect(character)}
                        >
                          {character.name} ({character.class})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  id="assigned-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[2rem]"
                >
                  {assignedError && <p className="mt-0.5 text-sm text-red-500">{assignedError}</p>}
                  {!assignedError &&
                    fieldErrors?.assignedId?.map((error: string) => (
                      <p className="mt-0.5 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </Field>
            <Field>
              <Label htmlFor="holder">Give to</Label>
              <div className="flex flex-col">
                <div className="relative">
                  <Input
                    id="holder"
                    aria-describedby="holder-error"
                    value={holderSearchTerm}
                    onChange={handleHolderSearchChange}
                  />
                  {holderList.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-md overflow-hidden">
                      {holderList.map((character) => (
                        <div
                          key={character.id}
                          className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted hover:text-muted-foreground"
                          onClick={() => handleHolderSelect(character)}
                        >
                          {character.name} ({character.class})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  id="holder-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[2rem]"
                >
                  {holderError && <p className="mt-0.5 text-sm text-red-500">{holderError}</p>}
                  {!holderError &&
                    fieldErrors?.holderId?.map((error: string) => (
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
            <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
              {addMutation.isPending || updateMutation.isPending
                ? itemToEdit
                  ? 'Saving...'
                  : 'Adding...'
                : itemToEdit
                  ? 'Save Changes'
                  : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
