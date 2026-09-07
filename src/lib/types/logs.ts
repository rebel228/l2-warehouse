export type LogEntry = {
  id: number;
  type: 'transfer' | 'reassignment';
  itemName: string;
  from: string | null;
  to: string | null;
  changedBy: string;
  timestamp: Date;
};
