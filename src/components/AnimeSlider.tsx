
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface AnimeSliderProps {
  title: string;
  animeList: AnimeSearchResult[];
  viewAllLink?: string; // New prop for "View All" link
}

export function AnimeSlider({ title, animeList, viewAllLink }: AnimeSliderProps) {
  if (!animeList || animeList.length === 0) {
    return null; // Don't render if no anime
  }

  return (
    <section className="py-6 md:py-8"> {/* Reduced py for tighter look */}
      <div className="flex justify-between items-center mb-4 md:mb-5"> {/* Reduced mb */}
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-primary hover:text-accent transition-colors flex items-center group">
            View All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex space-x-3 md:space-x-4 pb-4"> {/* Reduced space-x */}
          {animeList.map((anime) => (
            <div key={anime.id} className="w-36 sm:w-40 md:w-44 lg:w-48 flex-shrink-0"> {/* Adjusted widths */}
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

