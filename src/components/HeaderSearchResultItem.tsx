
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import Image from 'next/image';
import Link from 'next/link';
import { Tv, Film, CalendarDays } from 'lucide-react';

interface HeaderSearchResultItemProps {
  anime: AnimeSearchResult;
  onSelect: () => void; // Callback to close popover on selection
}

export function HeaderSearchResultItem({ anime, onSelect }: HeaderSearchResultItemProps) {
  const imageUrl = anime.image || 'https://placehold.co/40x60.png?text=N/A';
  const dataAiHint = anime.image ? "anime poster small" : "placeholder anime";
  const year = anime.releaseDate ? (isNaN(Number(anime.releaseDate)) ? new Date(anime.releaseDate).getFullYear() : anime.releaseDate) : null;
  const IconComponent = anime.type?.toLowerCase().includes("movie") ? Film : Tv;

  return (
    <Link
      href={`/anime/${anime.id}`}
      passHref
      onClick={onSelect}
      className="flex items-center p-2.5 hover:bg-accent/50 rounded-md transition-colors duration-150 group"
    >
      <div className="flex-shrink-0 w-10 h-[60px] relative rounded overflow-hidden mr-3 shadow-sm">
        <Image
          src={imageUrl}
          alt={anime.title}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-105 transition-transform"
          data-ai-hint={dataAiHint}
          unoptimized={!anime.image}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary" title={anime.title}>
          {anime.title}
        </h4>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center space-x-2">
          {anime.type && (
            <div className="flex items-center">
              <IconComponent className="w-3 h-3 mr-1 text-primary/80" />
              <span className="capitalize">{anime.type}</span>
            </div>
          )}
          {year && (
            <div className="flex items-center">
              <CalendarDays className="w-3 h-3 mr-1 text-primary/80" />
              <span>{year}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
