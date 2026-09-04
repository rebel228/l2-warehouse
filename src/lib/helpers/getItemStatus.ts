export function getItemStatus(
  assignedId: number | null | undefined,
  holderId: number | null | undefined
): 'in_bank' | 'assigned' | 'held' {
  const a = assignedId ?? null;
  const h = holderId ?? null;
  if (h === null) {
    if (a === null) return 'in_bank';
    return 'assigned';
  }

  if (a === null) return 'held';

  return a === h ? 'assigned' : 'held';
}
