
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tv } from 'lucide-react'; // Using Tv as a generic icon for type

interface TopAnimeSidebarItemProps {
  anime: AnimeSearchResult;
  rank: number;
}

export function TopAnimeSidebarItem({ anime, rank }: TopAnimeSidebarItemProps) {
  const imageUrl = anime.image || 'https://placehold.co/60x90.png?text=N/A';
  const dataAiHint = anime.image ? "anime poster small" : "placeholder anime";

  // Define border colors for top ranks
  const rankColors: { [key: number]: string } = {
    1: 'border-sky-400',
    2: 'border-pink-400',
    3: 'border-amber-400',
  };
  const rankTextColor: { [key: number]: string } = {
    1: 'text-sky-400',
    2: 'text-pink-400',
    3: 'text-amber-400',
  };

  const itemBorderColor = rankColors[rank] || 'border-transparent';
  const itemRankTextColor = rankTextColor[rank] || 'text-muted-foreground/60';

  return (
    <Link href={`/anime/${anime.id}`} passHref>
      <div className={`flex items-center space-x-3 p-2.5 bg-card/30 hover:bg-card/70 rounded-md transition-all duration-200 group border-l-4 ${itemBorderColor} hover:shadow-lg`}>
        <div className={`w-10 text-center text-3xl font-bold ${itemRankTextColor} group-hover:text-primary transition-colors`}>
          {rank}
        </div>
        <div className="flex-shrink-0 w-14 h-[84px] relative rounded overflow-hidden shadow-md">
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
          <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
            {anime.type && (
              <div className="flex items-center">
                <Tv className="w-3 h-3 mr-1 text-primary/70" />
                <span className="capitalize">{anime.type}</span>
              </div>
            )}
            {anime.subOrDub && (
              <Badge
                variant={anime.subOrDub.toLowerCase() === 'dub' ? 'secondary' : 'outline'}
                className="text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/80"
              >
                {anime.subOrDub.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
