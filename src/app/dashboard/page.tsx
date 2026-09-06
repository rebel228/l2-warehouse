import { redirect } from 'next/navigation';
import ItemTable from '../components/items/ItemTable';

export default function DashboardPage() {
  redirect('/dashboard/items');
  return <></>;
}
