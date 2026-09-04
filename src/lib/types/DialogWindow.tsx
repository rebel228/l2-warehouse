export interface ItemDialogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface CharacterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}
