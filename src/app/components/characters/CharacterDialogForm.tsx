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
import { useState } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUpdateCharacter } from '@/lib/hooks/useCharacters';

export function CharacterDialogForm({
  open,
  onOpenChange,
  characterToEdit,
}: CharacterFormDialogProps) {
  const [fieldErrors, setFieldErrors] = useState<State['errors']>({});
  const queryClient = useQueryClient();

  const [name, setName] = useState(characterToEdit?.name ?? '');
  const [characterClass, setCharacterClass] = useState(characterToEdit?.class ?? '');

  const [searchTerm, setSearchTerm] = useState(characterToEdit?.user?.username ?? '');
  const [userList, setUserList] = useState<{ id: number; username: string; email: string }[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState(String(characterToEdit?.userId ?? ''));
  const [ownerError, setOwnerError] = useState<string>('');

  const updateMutation = useUpdateCharacter();

  const addMutation = useMutation({
    mutationFn: (formData: FormData) => addCharacter(formData),
    onSuccess: (data) => {
      if (!data.success) {
        setFieldErrors(data.errors || {});
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  const resetForm = () => {
    setName('');
    setCharacterClass('');
    setSearchTerm('');
    setSelectedOwnerId('');
    setUserList([]);
    setOwnerError('');
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
    setSearchTerm(value);
    setSelectedOwnerId('');
    handleSearch(value);
  };

  const handleUserSelect = (user: { id: number; username: string }) => {
    handleSearch.cancel();
    setSearchTerm(user.username);
    setSelectedOwnerId(String(user.id));
    setUserList([]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchTerm.trim().length > 0 && !selectedOwnerId) {
      setOwnerError('Not a valid user');
      return;
    }

    const formData = new FormData(e.currentTarget);

    if (selectedOwnerId) {
      formData.append('userId', selectedOwnerId);
    }
    if (characterToEdit) {
      updateMutation.mutate(
        { id: characterToEdit.id, formData },
        {
          onSuccess: (data) => {
            if (data.success) {
              queryClient.invalidateQueries({ queryKey: ['characters'] });
              onOpenChange(false);
              resetForm();
            } else {
              setFieldErrors(data.errors || {});
            }
          },
        }
      );
    } else {
      addMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{characterToEdit ? 'Edit Character' : 'Add New Character'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <FieldGroup className="gap-2">
            <Field>
              <Label htmlFor="name">Character Name</Label>
              <div className="flex flex-col">
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-describedby="character-error"
                />
                <div
                  id="character-error"
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-h-[1.5rem]"
                >
                  {fieldErrors?.name?.map((error: string) => (
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
                <Select
                  name="class"
                  value={characterClass}
                  onValueChange={(val) => setCharacterClass(val ?? '')}
                  aria-describedby="class-error"
                >
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
                  {fieldErrors?.class?.map((error: string) => (
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
                  {ownerError && <p className="mt-0.5 text-sm text-red-500">{ownerError}</p>}
                  {!ownerError &&
                    fieldErrors?.userId?.map((error: string) => (
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
                ? characterToEdit
                  ? 'Saving...'
                  : 'Adding...'
                : characterToEdit
                  ? 'Save Changes'
                  : 'Create Character'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
