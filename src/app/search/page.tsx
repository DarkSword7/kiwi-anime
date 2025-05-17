
import { SearchComponent } from '@/components/SearchComponent';

export default function SearchPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight text-primary text-center">
        Find Your Next Favorite Anime
      </h1>
      <SearchComponent />
    </div>
  );
}
