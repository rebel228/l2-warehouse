import { getCharacters } from '@/app/actions/characters';
import CharactersTable from '@/app/components/characters/CharacterTable';

export default async function CharactersPage() {
  const initialData = await getCharacters();
  return <CharactersTable initialData={initialData} />;
}
