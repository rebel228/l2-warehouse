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

import { useActionState } from 'react';
import { CharacterFormDialogProps } from '@/lib/types/DialogWindow';
import { addCharacter, State } from '@/app/actions/characters';

export function CharacterDialogForm({ open, onOpenChange }: CharacterFormDialogProps) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(addCharacter, initialState);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Character</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col">
          <FieldGroup className="gap-2">
            <Field>
              <Label htmlFor="name">Character Name</Label>
              <div className="flex flex-col">
                <Input id="name" name="name" aria-describedby="character-error" />
                <div
                  id="character-error"
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
            <Field>
              <Label htmlFor="class">Class</Label>
              <div className="flex flex-col">
                <Input id="class" name="class" aria-describedby="class-error" />
                <div
                  id="class-error"
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
            <Field>
              <Label htmlFor="owned">Owner</Label>
              <div className="flex flex-col">
                <Input id="owned" name="owned" aria-describedby="owner-error" />
                <div
                  id="owner-error"
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
