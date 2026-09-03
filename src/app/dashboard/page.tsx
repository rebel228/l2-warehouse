import { redirect } from 'next/navigation';
import ItemTable from '../components/item-table/ItemTable';

export default function DashboardPage() {
  redirect('/dashboard/items');
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <ItemTable />
    </div>
  );
}
