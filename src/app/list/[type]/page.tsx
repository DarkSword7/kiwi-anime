
import { AnimeCard } from '@/components/AnimeCard';
import { PaginationControls } from '@/components/PaginationControls';
import { 
  getPopularAnimeList, 
  getTrendingAnimeList, 
  getRecentEpisodesList,
  getLatestCompletedAnimeList,
  getRecentlyAddedAnimeList 
} from '@/services/anime-service';
import type { AnimeSearchResult } from '@/types/anime';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ListPageLoading from './loading'; // Import loading component

interface ListPageProps {
  params: {
    type: string;
  };
  searchParams?: {
    page?: string;
  };
}

interface FetchFunctionMap {
  [key: string]: (page: number) => Promise<{ currentPage: number; hasNextPage: boolean; results: AnimeSearchResult[] }>;
}

const fetchFunctions: FetchFunctionMap = {
  'popular': getPopularAnimeList,
  'trending': getTrendingAnimeList, // Corresponds to top-airing
  'recent-episodes': getRecentEpisodesList,
  'latest-completed': getLatestCompletedAnimeList,
  'recently-added': getRecentlyAddedAnimeList,
  // Add more types as needed, e.g., 'most-favorite'
};

const typeToTitleMap: { [key: string]: string } = {
  'popular': "Popular Anime",
  'trending': "Top Airing Anime",
  'recent-episodes': "Recent Episodes",
  'latest-completed': "Latest Completed Series",
  'recently-added': "Recently Added Anime",
};

export default async function ListPage({ params, searchParams }: ListPageProps) {
  const listType = params.type;
  const page = parseInt(searchParams?.page || '1', 10);

  const fetchFunction = fetchFunctions[listType];
  const pageTitle = typeToTitleMap[listType] || "Anime List";

  if (!fetchFunction) {
    notFound();
  }

  const data = await fetchFunction(page);

  if (!data) {
    // This case might be handled by the service returning empty results
    // but good to have a fallback if service itself returns null.
    return (
      <div className="py-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">{pageTitle}</h1>
        <p className="text-muted-foreground">Could not load anime for this section.</p>
      </div>
    )
  }

  const { results: animeList, currentPage, hasNextPage } = data;

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary text-center">
        {pageTitle}
      </h1>
      
      {animeList && animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {animeList.map((anime) => (
            <AnimeCard key={`${listType}-${anime.id}-${page}`} anime={anime} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center col-span-full py-10">
          No anime found for this section or page.
        </p>
      )}

      <PaginationControls
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        basePath={`/list/${listType}`}
      />
    </div>
  );
}

// Optional: Add generateStaticParams if you want to pre-render these list types
// export async function generateStaticParams() {
//   return Object.keys(typeToTitleMap).map((type) => ({
//     type: type,
//   }));
// }

