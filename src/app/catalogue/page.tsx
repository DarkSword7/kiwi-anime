
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  searchAnime,
  getMoviesList,
  getOVASList,
  getONASList,
  getSpecialsList,
  getTVShowsList,
  getAnimeByGenre,
  getTopAiringAnimeList, // Default fetch
} from '@/services/anime-service';
import type { AnimeSearchResult, PaginatedAnimeResults } from '@/types/anime';
import { CatalogueAnimeCard } from '@/components/catalogue/CatalogueAnimeCard';
import { CatalogueFilterSidebar } from '@/components/catalogue/CatalogueFilterSidebar';
import { PaginationControls } from '@/components/PaginationControls';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2, LayoutGrid } from 'lucide-react';
import CatalogueLoading from './loading'; // Import the loading component

function CataloguePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [animeList, setAnimeList] = useState<AnimeSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Read initial filters from URL
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    const genreFromUrl = searchParams.get('genre');
    const queryFromUrl = searchParams.get('q');
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

    setSelectedType(typeFromUrl);
    setSelectedGenre(genreFromUrl);
    setSearchTerm(queryFromUrl || '');
    setCurrentPage(pageFromUrl);
  }, [searchParams]);

  const fetchData = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    let data: PaginatedAnimeResults = { currentPage: pageToFetch, hasNextPage: false, results: [] };

    try {
      const currentQ = searchParams.get('q');
      const currentType = searchParams.get('type');
      const currentGenre = searchParams.get('genre');

      if (currentQ) {
        data = await searchAnime(currentQ, pageToFetch);
      } else if (currentType) {
        switch (currentType) {
          case 'movie': data = await getMoviesList(pageToFetch); break;
          case 'ova': data = await getOVASList(pageToFetch); break;
          case 'ona': data = await getONASList(pageToFetch); break;
          case 'special': data = await getSpecialsList(pageToFetch); break;
          case 'tv': data = await getTVShowsList(pageToFetch); break;
          default: data = await getTopAiringAnimeList(pageToFetch); // Fallback for unknown type
        }
      } else if (currentGenre) {
        data = await getAnimeByGenre(currentGenre, pageToFetch);
      } else {
        // Default fetch if no filters are active (e.g., top airing or most popular)
        data = await getTopAiringAnimeList(pageToFetch);
      }
    } catch (error) {
      console.error("Error fetching catalogue data:", error);
    }
    
    setAnimeList(data.results || []);
    setCurrentPage(data.currentPage || pageToFetch);
    setHasNextPage(data.hasNextPage || false);
    setIsLoading(false);
  }, [searchParams]); // Re-run when searchParams change

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    fetchData(pageFromUrl);
  }, [fetchData, searchParams]); // searchParams will trigger this when filters change URL

  const updateQueryParams = (paramsToUpdate: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value === null) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    // Reset page to 1 for any new filter other than page itself
    if (!('page' in paramsToUpdate)) {
      current.set('page', '1');
    }
    const query = current.toString();
    router.push(`/catalogue${query ? `?${query}` : ''}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateQueryParams({ q: searchTerm || null, type: null, genre: null }); // New search clears type/genre
  };
  
  const handleApplyFilters = () => {
    updateQueryParams({ type: selectedType, genre: selectedGenre, q: null }); // Applying filters clears search term
  };

  const handleResetFilters = () => {
    setSelectedType(null);
    setSelectedGenre(null);
    setSearchTerm('');
    updateQueryParams({ type: null, genre: null, q: null });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage.toString() });
  };
  
  // Determine title based on filters
  let pageTitle = "Catalogue";
  const typeParam = searchParams.get('type');
  const genreParam = searchParams.get('genre');
  const qParam = searchParams.get('q');

  if (qParam) {
    pageTitle = `Search Results for "${qParam}"`;
  } else if (typeParam) {
    pageTitle = `${typeParam.charAt(0).toUpperCase() + typeParam.slice(1)} Anime`;
  } else if (genreParam) {
    pageTitle = `${genreParam.charAt(0).toUpperCase() + genreParam.slice(1)} Genre`;
  }


  return (
    <div className="container mx-auto px-4 py-8 text-foreground">
      {/* Breadcrumbs and Title */}
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span>Catalogue</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground mt-1">Explore our extensive collection. Use the filters to find your next favorite show.</p>
      </div>

      {/* Catalogue Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search the catalogue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 pl-10 pr-12 text-base bg-card/70 border-border/50 focus:border-primary placeholder:text-muted-foreground"
          />
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 text-sm bg-primary hover:bg-accent">
            Search
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Main Content Area */}
        <main className="md:order-1 space-y-6">
          {isLoading && animeList.length === 0 && (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          )}
          {!isLoading && animeList.length === 0 && (
            <div className="text-center py-10 col-span-full">
              <LayoutGrid className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No anime found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          )}
          {animeList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {animeList.map((anime) => (
                <CatalogueAnimeCard key={anime.id + '-' + (anime.title || '')} anime={anime} />
              ))}
            </div>
          )}
          {animeList.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              basePath="/catalogue"
              currentQuery={searchParams.toString()}
              onPageChange={handlePageChange}
            />
          )}
        </main>

        {/* Filter Sidebar */}
        <div className="md:order-2 w-full md:w-auto">
          <CatalogueFilterSidebar
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
}

// Wrap CataloguePageContent with Suspense for useSearchParams
export default function CataloguePage() {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <CataloguePageContent />
    </Suspense>
  );
}
