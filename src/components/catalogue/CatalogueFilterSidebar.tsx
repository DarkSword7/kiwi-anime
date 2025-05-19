
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getGenreList } from '@/services/anime-service';
import type { Genre } from '@/types/anime';
import { FilterX, RotateCcw } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const ANIME_TYPES = [
  { id: 'tv', label: 'TV' },
  { id: 'movie', label: 'Movie' },
  { id: 'ova', label: 'OVA' },
  { id: 'ona', label: 'ONA' },
  { id: 'special', label: 'Special' },
];

interface CatalogueFilterSidebarProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  selectedGenre: string | null;
  onGenreChange: (genre: string | null) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export function CatalogueFilterSidebar({
  selectedType,
  onTypeChange,
  selectedGenre,
  onGenreChange,
  onApplyFilters,
  onResetFilters,
}: CatalogueFilterSidebarProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  useEffect(() => {
    async function fetchGenres() {
      setLoadingGenres(true);
      const fetchedGenres = await getGenreList();
      setGenres(fetchedGenres || []);
      setLoadingGenres(false);
    }
    fetchGenres();
  }, []);

  return (
    <aside className="w-full md:w-[300px] space-y-6 sticky top-[calc(theme(spacing.16)_+_theme(spacing.8))] self-start">
      <Card className="bg-card/70 border-border/40 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="multiple" defaultValue={['type', 'genres']} className="w-full">
            {/* Type Filter */}
            <AccordionItem value="type">
              <AccordionTrigger className="text-base font-semibold text-foreground/90 hover:text-primary">Type</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {ANIME_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      variant={selectedType === type.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onTypeChange(selectedType === type.id ? null : type.id)}
                      className={`w-full ${selectedType === type.id ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-primary hover:bg-primary/10'}`}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Genres Filter */}
            <AccordionItem value="genres">
              <AccordionTrigger className="text-base font-semibold text-foreground/90 hover:text-primary">Genres</AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-[200px] pt-2 pr-3">
                  <div className="grid grid-cols-2 gap-2">
                    {loadingGenres ? (
                      [...Array(8)].map((_, i) => <Skeleton key={i} className="h-9 w-full bg-muted" />)
                    ) : genres.length > 0 ? (
                      genres.map((genre) => (
                        <Button
                          key={genre.id}
                          variant={selectedGenre === genre.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onGenreChange(selectedGenre === genre.id ? null : genre.id)}
                          className={`w-full truncate ${selectedGenre === genre.id ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-primary hover:bg-primary/10'}`}
                          title={genre.title}
                        >
                          {genre.title}
                        </Button>
                      ))
                    ) : (
                      <p className="col-span-2 text-sm text-muted-foreground text-center">No genres found.</p>
                    )}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-3 pt-4 border-t border-border/30">
            <Button onClick={onApplyFilters} className="w-full bg-primary hover:bg-accent text-primary-foreground">
              <FilterX className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button onClick={onResetFilters} variant="outline" className="w-full border-muted-foreground/50 text-muted-foreground hover:bg-muted/30">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
