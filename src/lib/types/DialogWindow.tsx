import { CharacterWithRelations } from '@/app/actions/characters';
import { ItemWithRelations } from '@/app/actions/items';

export interface ItemDialogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: ItemWithRelations | null;
}

export interface CharacterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  characterToEdit?: CharacterWithRelations | null;
}
