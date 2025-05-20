
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
import ListPageLoading from './loading';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs'; // Import Breadcrumbs

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
  'trending': getTrendingAnimeList,
  'recent-episodes': getRecentEpisodesList,
  'latest-completed': getLatestCompletedAnimeList,
  'recently-added': getRecentlyAddedAnimeList,
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

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Catalogue", href: "/catalogue" }, // Or a more general "Lists" page if you had one
    { label: pageTitle }
  ];

  if (!data) {
    return (
      <div className="py-8 text-center">
        <Breadcrumbs items={breadcrumbItems} className="max-w-5xl mx-auto px-4"/>
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">{pageTitle}</h1>
        <p className="text-muted-foreground">Could not load anime for this section.</p>
      </div>
    )
  }

  const { results: animeList, currentPage, hasNextPage } = data;

  return (
    <div className="py-8">
      <Breadcrumbs items={breadcrumbItems} className="max-w-5xl mx-auto px-4"/>
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
