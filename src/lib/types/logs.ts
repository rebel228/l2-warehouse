import { ItemEventSnapshot } from '../db/schema';

export type LogEntry = {
  id: number;
  type: 'item_created' | 'item_deleted' | 'owner_change' | 'reassignment' | 'transfer';
  from: string | null;
  to: string | null;
  changedBy: string;
  timestamp: Date;
  snapshot: ItemEventSnapshot;
};
