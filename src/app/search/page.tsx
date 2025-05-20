
import { SearchComponent } from '@/components/SearchComponent';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs'; // Import Breadcrumbs

function SearchPageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
      <p className="text-xl text-muted-foreground">Loading search...</p>
    </div>
  );
}

export default function SearchPage() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Search" }
  ];

  return (
    <div className="py-8">
      <Breadcrumbs items={breadcrumbItems} className="max-w-4xl mx-auto"/>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight text-primary text-center">
        Find Your Next Favorite Anime
      </h1>
      <Suspense fallback={<SearchPageLoadingFallback />}>
        <SearchComponent />
      </Suspense>
    </div>
  );
}
