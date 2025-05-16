
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import { searchAnime } from '@/services/anime-service';
import { AnimeCard } from '@/components/AnimeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const performSearch = async (term: string, page: number = 1) => {
    if (term.trim() === '') {
      setResults([]);
      setHasSearched(true); // Or false, depending on desired UX for empty search
      setHasNextPage(false);
      setIsLoading(false);
      setCurrentPage(1);
      return;
    }

    setIsLoading(true);
    if (page === 1) {
      setHasSearched(false); 
    }
    
    try {
      const searchData = await searchAnime(term, page);
      
      // Safely access properties, providing defaults if searchData or its properties are null/undefined
      const newApiResults = searchData?.results || [];
      const apiCurrentPage = searchData?.currentPage || page;
      const apiHasNextPage = !!searchData?.hasNextPage; // Ensure boolean

      if (page === 1) {
        setResults(newApiResults);
      } else {
        // prevResults should always be an array due to useState initialization
        setResults(prevResults => [...prevResults, ...newApiResults]);
      }
      setCurrentPage(apiCurrentPage);
      setHasNextPage(apiHasNextPage);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setHasNextPage(false);
      // Optionally reset current page or display a more specific error message
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); 
    performSearch(searchTerm, 1);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      performSearch(searchTerm, currentPage + 1);
    }
  };
  
  useEffect(() => {
    if (searchTerm.trim() === '' && hasSearched) { 
      setResults([]);
      setHasSearched(false);
      setHasNextPage(false);
      setCurrentPage(1);
    }
  }, [searchTerm, hasSearched]);

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Input
            type="search"
            placeholder="Search anime by title..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim() === '') {
                setResults([]);
                setHasSearched(false);
                setHasNextPage(false);
                setCurrentPage(1);
              }
            }}
            className="pr-10 text-base"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchTerm('');
                setResults([]);
                setHasSearched(false);
                setHasNextPage(false);
                setCurrentPage(1);
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Button type="submit" variant="default" size="lg" disabled={isLoading && searchTerm.trim() !== ''}>
           {isLoading && searchTerm.trim() !== '' && results.length === 0 && page === 1 ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <SearchIcon className="mr-2 h-5 w-5" />}
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
          <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No results found for "{searchTerm}".</p>
          <p className="text-sm text-muted-foreground">Try a different keyword or check your spelling.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold">Search Results ({results.length}{hasNextPage ? '+' : ''})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button onClick={handleLoadMore} disabled={isLoading} variant="outline" size="lg">
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
      
      {!hasSearched && !isLoading && results.length === 0 && searchTerm.trim() === '' && (
         <div className="text-center py-10">
            <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Start searching for your favorite anime!</p>
          </div>
      )}
    </div>
  );
}
