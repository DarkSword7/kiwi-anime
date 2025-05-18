
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface AnimeSliderProps {
  title: string;
  animeList: AnimeSearchResult[];
  viewAllLink?: string;
}

export function AnimeSlider({ title, animeList, viewAllLink }: AnimeSliderProps) {
  if (!animeList || animeList.length === 0) {
    return null; // Don't render if no anime
  }

  return (
    <section className="py-8 md:py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-primary hover:text-accent transition-colors flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        )}
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex space-x-4 pb-4">
          {animeList.map((anime) => (
            <div key={anime.id} className="w-40 sm:w-44 md:w-48 flex-shrink-0">
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
