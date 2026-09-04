import ItemTable from '../../components/items/ItemTable';
import { getItems } from '@/app/actions/items';

export default async function ItemsPage() {
  const initialItems = await getItems();
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Items</h1>
      <ItemTable initialItems={initialItems} />
    </div>
  );
}
