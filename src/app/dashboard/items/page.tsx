import ItemTable from '../../components/items/ItemTable';
import { getItems } from '@/app/actions/items';

export default async function ItemsPage() {
  const initialItems = await getItems();
  return <ItemTable initialItems={initialItems} />;
}
