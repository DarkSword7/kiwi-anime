
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clapperboard, Tv } from 'lucide-react'; // Film icon for movies

interface CompactAnimeListItemProps {
  anime: AnimeSearchResult;
}

export function CompactAnimeListItem({ anime }: CompactAnimeListItemProps) {
  const imageUrl = anime.image || 'https://placehold.co/80x120.png?text=N/A';
  const dataAiHint = anime.image ? "anime poster small" : "placeholder anime";
  const year = anime.releaseDate ? (isNaN(Number(anime.releaseDate)) ? new Date(anime.releaseDate).getFullYear() : anime.releaseDate) : null;

  const IconComponent = anime.type?.toLowerCase().includes("movie") ? Clapperboard : Tv;

  return (
    <Link href={`/anime/${anime.id}`} passHref prefetch={false}>
      <div className="flex items-start space-x-3 p-3 bg-card/50 hover:bg-card/80 rounded-lg transition-colors duration-200 group">
        <div className="flex-shrink-0 w-16 h-24 relative rounded-md overflow-hidden">
          <Image
            src={imageUrl}
            alt={anime.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={dataAiHint}
            unoptimized={!anime.image}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" title={anime.title}>
            {anime.title}
          </h3>
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            {anime.type && (
              <div className="flex items-center">
                <IconComponent className="w-3 h-3 mr-1.5 text-primary/80" />
                <span className="capitalize">{anime.type}</span>
              </div>
            )}
            {year && (
               <div className="flex items-center">
                <CalendarDays className="w-3 h-3 mr-1.5 text-primary/80" />
                <span>{year}</span>
              </div>
            )}
          </div>
          {anime.subOrDub && (
            <Badge 
              variant={anime.subOrDub.toLowerCase() === 'dub' ? 'secondary' : 'outline'} 
              className="text-[10px] px-1.5 py-0.5 mt-1.5 border-primary/30 text-primary/80"
            >
              {anime.subOrDub.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
