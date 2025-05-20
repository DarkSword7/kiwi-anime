
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayCircle, CalendarDays, Tv } from 'lucide-react'; // Using Tv for type
import React, { useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots, // Import custom dots
  type CarouselApi,
} from "@/components/ui/carousel"; // Assuming carousel.tsx is in ui
import Autoplay from "embla-carousel-autoplay"


interface HeroCarouselProps {
  items: AnimeSearchResult[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  )

  useEffect(() => {
    if (!api) {
      return
    }
    // Example: You could use api for something if needed
  }, [api])

  if (!items || items.length === 0) {
    return (
      <section className="relative h-[55vh] md:h-[60vh] lg:h-[70vh] rounded-lg overflow-hidden group text-foreground bg-card flex items-center justify-center">
        <div className="text-center p-6 md:p-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-xl mb-4">
            Explore Exciting Anime
          </h1>
          <p className="text-md md:text-lg text-foreground/80 max-w-xl drop-shadow-md mb-6">
            Your portal to an exciting world of anime. Discover trending shows, popular series, and get personalized suggestions.
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-accent text-primary-foreground text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <Link href="/search">
              <PlayCircle className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Start Exploring
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      setApi={setApi}
      className="w-full rounded-lg overflow-hidden shadow-2xl"
    >
      <CarouselContent>
        {items.map((anime, index) => {
          const year = anime.releaseDate ? (isNaN(Number(anime.releaseDate)) ? new Date(anime.releaseDate).getFullYear() : anime.releaseDate) : null;
          // Limited description for search results, use placeholder if none.
          const description = (anime as any).description || `Discover the world of ${anime.title}. Episodes, characters, and more.`;
          const imageUrl = anime.image || "https://placehold.co/800x450.png?text=Anime+Image";
          const dataAiHint = anime.image ? "anime art style" : "placeholder anime";

          return (
            <CarouselItem key={anime.id + '-' + index} className="relative h-[55vh] md:h-[60vh] lg:h-[70vh] text-foreground/90">
              {/* Background with Image */}
              <div className="absolute inset-0">
                <Image
                  src={imageUrl} // This will be the large backdrop image
                  alt={`Backdrop for ${anime.title}`}
                  layout="fill"
                  objectFit="cover"
                  className="opacity-30" // Soft backdrop
                  priority={index === 0}
                  unoptimized={!anime.image}
                  data-ai-hint={dataAiHint + " wide"}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex items-center p-6 md:p-10 lg:p-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
                  {/* Left Column: Text Info */}
                  <div className="space-y-4 md:space-y-5 max-w-lg">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground line-clamp-3">
                      {anime.title}
                    </h1>
                    
                    <div className="flex items-center space-x-3 text-xs md:text-sm text-muted-foreground">
                      {/* Placeholder Badges - Replace with actual data if available */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/50 border border-border">
                        PG-13
                      </span>
                       {anime.type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/50 border border-border">
                          {anime.type.toUpperCase()}
                        </span>
                      )}
                      {year && (
                        <span className="inline-flex items-center">
                           <CalendarDays className="w-3.5 h-3.5 mr-1" /> {year}
                        </span>
                      )}
                       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/50 border border-border">
                        HD
                      </span>
                      {/* Add more metadata like CC or Mic icon if data exists */}
                    </div>

                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed line-clamp-3 md:line-clamp-4">
                      {description}
                    </p>
                    
                    <Button 
                      size="lg" 
                      asChild 
                      className="bg-primary hover:bg-accent text-primary-foreground text-sm md:text-base px-6 py-3 md:px-7 md:py-3.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    >
                      <Link href={`/anime/${anime.id}`}>
                        <PlayCircle className="mr-2 h-5 w-5" /> PLAY NOW
                      </Link>
                    </Button>
                     <div className="pt-3 md:pt-4 !mt-6 md:!mt-8"> {/* Dots container */}
                        <CarouselDots />
                     </div>
                  </div>

                  {/* Right Column: Anime Poster Image (optional, could be part of backdrop) */}
                  <div className="hidden md:flex justify-center items-center relative aspect-[2/3] max-w-xs mx-auto">
                     <Image
                        src={imageUrl} // Or a different character-focused image if API provides
                        alt={`Poster for ${anime.title}`}
                        width={300}
                        height={450}
                        className="rounded-lg shadow-2xl object-cover border-2 border-border/30"
                        data-ai-hint={dataAiHint + " portrait"}
                        unoptimized={!anime.image}
                      />
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="absolute left-4 bottom-6 z-20 hidden md:block">
        <CarouselPrevious className="bg-card/50 hover:bg-card/80 text-foreground backdrop-blur-sm border-border/50" />
      </div>
      <div className="absolute right-4 bottom-6 z-20 hidden md:block">
        <CarouselNext className="bg-card/50 hover:bg-card/80 text-foreground backdrop-blur-sm border-border/50" />
      </div>
    </Carousel>
  );
}
