
"use client";

import React, { useState, useEffect, useRef, type FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchAnime } from '@/services/anime-service';
import type { AnimeSearchResult } from '@/types/anime';
import { HeaderSearchResultItem } from './HeaderSearchResultItem';
import { useDebounce } from '@/hooks/use-debounce';
import { ScrollArea } from './ui/scroll-area';

interface HeaderSearchBarProps {
  onSearchSubmit?: () => void; // Optional: if Sheet needs to close on mobile search submit
  className?: string;
}

export function HeaderSearchBar({ onSearchSubmit, className }: HeaderSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery);
    },
    300, // 300ms debounce delay
    [searchQuery]
  );

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      if (debouncedQuery.trim().length === 0) {
        setIsPopoverOpen(false);
      }
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const searchData = await searchAnime(debouncedQuery.trim(), 1); // Fetch first page for dropdown
        setResults(searchData?.results.slice(0, 7) || []); // Limit to 7 results
        setIsPopoverOpen(true); 
      } catch (error) {
        console.error("Header search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    if (newQuery.trim().length === 0) {
        setIsPopoverOpen(false);
        setResults([]);
    } else if(newQuery.trim().length >=2 && results.length > 0) {
        setIsPopoverOpen(true);
    }
  };

  const handleFormSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear input after redirect
      setResults([]);
      setIsPopoverOpen(false);
      onSearchSubmit?.(); // Close mobile sheet if callback provided
      inputRef.current?.blur();
    }
  };

  const handleResultSelected = () => {
    setSearchQuery(''); // Clear input
    setResults([]);
    setIsPopoverOpen(false);
    onSearchSubmit?.(); // Close mobile sheet
  }

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsPopoverOpen(false);
    inputRef.current?.focus();
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <form onSubmit={handleFormSubmit} className={`relative w-full ${className}`}>
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search anime..."
            className="h-9 pl-8 pr-10 text-sm bg-input border-border focus:bg-background focus:border-primary"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => { if (searchQuery.trim().length >= 2 && results.length > 0) setIsPopoverOpen(true);}}
          />
          <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </form>
      </PopoverTrigger>
      
      {isPopoverOpen && debouncedQuery.trim().length >= 2 && (
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-2 mt-1 bg-card border-border shadow-xl"
          sideOffset={5}
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focusing PopoverContent itself
        >
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
          {!isLoading && results.length === 0 && debouncedQuery.trim().length >= 2 && (
            <p className="p-4 text-sm text-center text-muted-foreground">No results found for "{debouncedQuery}".</p>
          )}
          {!isLoading && results.length > 0 && (
            <ScrollArea className="max-h-[calc(70vh-100px)]"> {/* Adjust max height as needed */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground px-2.5 py-1.5 border-b border-border/50 mb-1">
                  Anime
                </p>
                {results.map((anime) => (
                  <HeaderSearchResultItem key={anime.id} anime={anime} onSelect={handleResultSelected} />
                ))}
              </div>
            </ScrollArea>
          )}
          {!isLoading && searchQuery.trim().length >=2 && ( // Show "View all" if there's a search query
             <div className="border-t border-border/50 mt-2 pt-2">
                <Button variant="ghost" className="w-full text-sm text-primary hover:text-accent justify-center" onClick={() => handleFormSubmit()}>
                  View all results for "{searchQuery.trim()}"
                </Button>
              </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
