
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
    if (items.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  }, [items.length]);

  const handlePrev = () => {
    if (items.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  useEffect(() => {
    if (items.length <= 1) return; 

    const timer = setTimeout(() => {
      handleNext();
    }, 7000); 

    return () => clearTimeout(timer);
  }, [currentIndex, items.length, handleNext]);

  if (!items || items.length === 0) {
    return (
      <section className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] rounded-lg overflow-hidden group text-foreground bg-card flex items-center justify-center">
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

  const currentAnime = items[currentIndex];

  return (
    <section className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] rounded-lg overflow-hidden group text-foreground">
      {/* Image with adjusted opacity and gradient */}
      <Image
        src={currentAnime.image || "https://placehold.co/1600x900.png"}
        alt={currentAnime.title || "Featured Anime Banner"}
        layout="fill"
        objectFit="cover"
        className="opacity-40 group-hover:opacity-50 transition-opacity duration-500 ease-in-out"
        data-ai-hint="anime landscape epic"
        priority={currentIndex === 0} 
        unoptimized={!currentAnime.image}
        key={currentAnime.id}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent/10" />
      
      <div className="relative z-10 flex flex-col items-start justify-end h-full p-4 md:p-8 lg:p-12 space-y-2 md:space-y-3 pb-12 md:pb-16"> {/* Added more padding-bottom for dots */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-xl transition-all duration-300 line-clamp-2">
          {currentAnime.title}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-foreground/80 max-w-md md:max-w-xl drop-shadow-md line-clamp-2 md:line-clamp-3 transition-all duration-300">
          Explore the world of {currentAnime.title}. Discover episodes, characters, and more.
        </p>
        <Button 
          size="default" 
          asChild 
          className="bg-primary hover:bg-accent text-primary-foreground text-sm md:text-base px-6 py-2.5 md:px-7 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
        >
          <Link href={`/anime/${currentAnime.id}`}>
            <PlayCircle className="mr-2 h-5 w-5" /> View Details
          </Link>
        </Button>
      </div>

      {items.length > 1 && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrev} 
            className="absolute left-1 md:left-3 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm p-2"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext} 
            className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm p-2"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-primary scale-125' : 'bg-white/60 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
