
import { SearchComponent } from '@/components/SearchComponent';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Fallback component for Suspense
function SearchPageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
      <p className="text-xl text-muted-foreground">Loading search...</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight text-primary text-center">
        Find Your Next Favorite Anime
      </h1>
      <Suspense fallback={<SearchPageLoadingFallback />}>
        <SearchComponent />
      </Suspense>
    </div>
  );
}
