"use client";

import type { Anime } from '@/types/anime';
import { mockAnimeData } from '@/data/mock-anime';
import { AnimeCard } from '@/components/AnimeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';

export function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    performSearch();
  };
  
  const performSearch = () => {
    if (searchTerm.trim() === '') {
      setResults([]);
      setHasSearched(true); // Show "no results" if search term is empty after submission
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredResults = mockAnimeData.filter(
      (anime) =>
        anime.title.toLowerCase().includes(lowerSearchTerm) ||
        anime.description.toLowerCase().includes(lowerSearchTerm) ||
        anime.genres.some(genre => genre.toLowerCase().includes(lowerSearchTerm))
    );
    setResults(filteredResults);
    setHasSearched(true);
  };
  
  // Optional: Debounced search as user types
  // useEffect(() => {
  //   if (searchTerm.trim() === '') {
  //     setResults([]);
  //     setHasSearched(false);
  //     return;
  //   }
  //   const timerId = setTimeout(() => {
  //     performSearch();
  //   }, 500); // Debounce time: 500ms
  //   return () => clearTimeout(timerId);
  // }, [searchTerm]);


  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Input
            type="search"
            placeholder="Search anime by title, genre, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Button type="submit" variant="default" size="lg">
          <SearchIcon className="mr-2 h-5 w-5" /> Search
        </Button>
      </form>

      {hasSearched && (
        <div>
          {results.length > 0 ? (
            <>
              <h2 className="text-2xl font-semibold mb-6">Search Results ({results.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No results found for "{searchTerm}".</p>
              <p className="text-sm text-muted-foreground">Try a different keyword or check your spelling.</p>
            </div>
          )}
        </div>
      )}
      {!hasSearched && (
         <div className="text-center py-10">
            <SearchIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Start searching for your favorite anime!</p>
          </div>
      )}
    </div>
  );
}
