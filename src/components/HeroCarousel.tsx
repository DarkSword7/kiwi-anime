
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface HeroCarouselProps {
  items: AnimeSearchResult[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  }, [items.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  useEffect(() => {
    if (items.length <= 1) return; // Don't auto-cycle if only one or no items

    const timer = setTimeout(() => {
      handleNext();
    }, 7000); // Change slide every 7 seconds

    return () => clearTimeout(timer);
  }, [currentIndex, items.length, handleNext]);

  if (!items || items.length === 0) {
    // Fallback if no items are provided
    return (
      <section className="relative h-[50vh] md:h-[65vh] rounded-lg overflow-hidden group text-foreground bg-card flex items-center justify-center">
        <div className="text-center p-6 md:p-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-xl mb-4">
            Explore Exciting Anime
          </h1>
          <p className="text-md md:text-lg text-foreground/80 max-w-xl drop-shadow-md mb-6">
            Your portal to an exciting world of anime. Discover trending shows, popular series, and get personalized suggestions.
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-accent text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <Link href="/search">
              <PlayCircle className="mr-2 h-6 w-6" /> Start Exploring
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const currentAnime = items[currentIndex];

  return (
    <section className="relative h-[50vh] md:h-[65vh] rounded-lg overflow-hidden group text-foreground">
      <Image
        src={currentAnime.image || "https://placehold.co/1600x900.png"}
        alt={currentAnime.title || "Featured Anime Banner"}
        layout="fill"
        objectFit="cover"
        className="opacity-30 group-hover:opacity-40 transition-opacity duration-500 ease-in-out"
        data-ai-hint="anime landscape epic"
        priority={currentIndex === 0} // Only prioritize the first image
        unoptimized={!currentAnime.image}
        key={currentAnime.id} // Add key for proper re-renders on image change
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-start justify-end h-full p-6 md:p-12 space-y-3 md:space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-xl transition-all duration-300 line-clamp-2">
          {currentAnime.title}
        </h1>
        <p className="text-md md:text-lg text-foreground/80 max-w-xl drop-shadow-md line-clamp-3 transition-all duration-300">
          {/* Using a generic description for now, as search results usually don't have full descriptions */}
          Explore the world of {currentAnime.title}. Discover episodes, characters, and more.
        </p>
        <Button 
          size="lg" 
          asChild 
          className="bg-primary hover:bg-accent text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
        >
          <Link href={`/anime/${currentAnime.id}`}>
            <PlayCircle className="mr-2 h-6 w-6" /> View Details
          </Link>
        </Button>
      </div>

      {items.length > 1 && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrev} 
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-background/30 hover:bg-background/70 text-foreground rounded-full backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext} 
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-background/30 hover:bg-background/70 text-foreground rounded-full backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-primary scale-125' : 'bg-foreground/50 hover:bg-foreground/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
