
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"; // Assuming carousel.tsx is in ui

interface AnimeSliderProps {
  title: string;
  animeList: AnimeSearchResult[];
  viewAllLink?: string;
}

export function AnimeSlider({ title, animeList, viewAllLink }: AnimeSliderProps) {
  if (!animeList || animeList.length === 0) {
    return null;
  }

  // Determine how many items to show per slide based on common screen sizes
  // This is a basic approach; more complex logic could be used for true adaptive slides
  const itemsPerView = {
    base: 2.2, // ~2 items visible on smallest screens, with partial next
    sm: 3.2,   // ~3 items on small screens
    md: 4.2,   // ~4 items on medium screens
    lg: 5.2,   // ~5 items on large screens
    xl: 6.2,   // ~6 items on extra-large screens
  };

  return (
    <section className="py-6 md:py-8">
      <div className="flex justify-between items-center mb-4 md:mb-5">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-primary hover:text-accent transition-colors flex items-center group">
            View All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 'auto', // Scroll by number of fully visible items, or 1 by 1 if not enough
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-3"> {/* Negative margin to counteract item padding */}
          {animeList.map((anime, index) => (
            <CarouselItem 
              key={anime.id + '-' + index} 
              className="pl-2 md:pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6" // Responsive item width
            >
              <div className="h-full">
                <AnimeCard anime={anime} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-card/70 hover:bg-card border-border/50 text-foreground/80 hover:text-foreground h-9 w-9" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-card/70 hover:bg-card border-border/50 text-foreground/80 hover:text-foreground h-9 w-9" />
      </Carousel>
    </section>
  );
}
