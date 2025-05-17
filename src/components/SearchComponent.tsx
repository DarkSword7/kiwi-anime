
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import { searchAnime } from '@/services/anime-service';
import { AnimeCard } from '@/components/AnimeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X, Loader2, Film } from 'lucide-react';
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter

export function SearchComponent() {
  const router = useRouter(); // Added for updating URL without full navigation
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q');

  const [searchTerm, setSearchTerm] = useState(queryFromUrl || '');
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const performSearch = useCallback(async (term: string, pageToFetch: number = 1) => {
    if (term.trim() === '') {
      setResults([]);
      setHasSearched(true);
      setHasNextPage(false);
      setIsLoading(false);
      setCurrentPage(1);
      return;
    }

    setIsLoading(true);
    if (pageToFetch === 1) {
      setHasSearched(false);
    }
    
    try {
      const searchData = await searchAnime(term, pageToFetch);
      
      const newApiResults = searchData?.results || [];
      const apiCurrentPage = Number(searchData?.currentPage) || pageToFetch; // Ensure currentPage is a number
      const apiHasNextPage = !!searchData?.hasNextPage;

      if (pageToFetch === 1) {
        setResults(newApiResults);
      } else {
        setResults(prevResults => [...(prevResults || []), ...newApiResults]);
      }
      setCurrentPage(apiCurrentPage);
      setHasNextPage(apiHasNextPage);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]); 
      setHasNextPage(false);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== searchTerm) {
      setSearchTerm(q);
      setCurrentPage(1); // Reset page when URL query changes
      performSearch(q, 1);
    } else if (!q && searchTerm !== '') { // If URL query is removed but internal searchTerm exists
      // Optionally clear results or keep them, based on desired behavior
      // setResults([]); 
      // setHasSearched(false);
    }
  }, [searchParams, performSearch, searchTerm]);


  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Update URL query param without full page reload, which triggers useEffect
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    // The useEffect will then pick up the change and call performSearch
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      performSearch(searchTerm, currentPage + 1);
    }
  };
  
  // This effect clears results if the search term becomes empty *after* a search has been made.
  useEffect(() => {
    if (searchTerm.trim() === '' && hasSearched) { 
      setResults([]);
      // setHasSearched(false); // Keep hasSearched true to show the "Start searching" message if input is cleared
      setHasNextPage(false);
      setCurrentPage(1);
      // Clear the URL query param if search term is cleared
      // router.push('/search', { scroll: false }); // This might be too aggressive
    }
  }, [searchTerm, hasSearched, router]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Input
            type="search"
            placeholder="Search by title (e.g., One Piece, Naruto)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // If input is cleared, we might want to update URL or let submit handle it
            }}
            className="h-12 pl-10 pr-12 text-base bg-input border-border focus:border-primary placeholder-muted-foreground"
          />
           <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchTerm('');
                // Optionally trigger a URL update to clear 'q' param
                router.push('/search', { scroll: false }); 
                setResults([]);
                setHasSearched(false); // Reset hasSearched so it shows "Start searching"
                setHasNextPage(false);
                setCurrentPage(1);
              }}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Button type="submit" variant="default" size="lg" disabled={isLoading && searchTerm.trim() !== ''} className="h-12 px-6 text-base">
           {isLoading && searchTerm.trim() !== '' && results.length === 0 && currentPage === 1 ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <SearchIcon className="mr-2 h-5 w-5" />}
          Search
        </Button>
      </form>

      {isLoading && results.length === 0 && searchTerm.trim() !== '' && currentPage === 1 && (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-xl text-muted-foreground">Searching...</p>
        </div>
      )}

      {hasSearched && !isLoading && results.length === 0 && searchTerm.trim() !== '' && (
        <div className="text-center py-10">
          <Film className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No results found for "{searchTerm}".</p>
          <p className="text-sm text-muted-foreground">Try a different keyword or check your spelling.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-foreground">Search Results ({results.length}{hasNextPage ? '+' : ''})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-6">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button onClick={handleLoadMore} disabled={isLoading} variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Load More Results
              </Button>
            </div>
          )}
        </>
      )}
      
      {!isLoading && results.length === 0 && searchTerm.trim() === '' && (
         <div className="text-center py-10">
            <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Start searching for your favorite anime!</p>
            {/* Optional: Show initial placeholder if no URL query was present and input is empty */}
            { !queryFromUrl && !hasSearched && <p className="text-sm text-muted-foreground">Type a title in the search bar above.</p>}
          </div>
      )}
    </div>
  );
}
