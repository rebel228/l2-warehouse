import CharacterCard from '@/app/components/crarecters-view/CharacterCard';
import { charactersMocks } from '@/lib/mock';

export default function CharactersPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Characters</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {charactersMocks.map((char) => (
          <CharacterCard key={char.id} character={char} />
        ))}
      </div>
    </div>
  );
}
