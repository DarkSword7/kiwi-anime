
import Link from 'next/link';
import Image from 'next/image';
import type { AnimeSearchResult } from '@/types/anime';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnimeCardProps {
  anime: AnimeSearchResult & { episodeNumber?: number; animeType?: string }; // Add optional episodeNumber and animeType
  watchLink?: string; // Optional link for direct watch
}

export function AnimeCard({ anime, watchLink }: AnimeCardProps) {
  const imageUrl = anime.image || 'https://placehold.co/200x300.png?text=No+Image';
  const dataAiHint = anime.image ? "anime poster portrait" : "placeholder anime";
  const linkHref = watchLink || `/anime/${anime.id}`;

  return (
    <Link href={linkHref} passHref prefetch={false}>
      <Card className="h-full flex flex-col bg-card border-border/50 rounded-lg overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/50 hover:scale-[1.02]">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={anime.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={dataAiHint}
            unoptimized={!anime.image}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
            {/* Potential overlay content */}
          </div>
           {anime.episodeNumber && (
             <Badge 
                variant="default"
                className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0.5 backdrop-blur-sm shadow-md"
             >
                Ep {anime.episodeNumber}
             </Badge>
           )}
        </div>
        <CardContent className="p-2.5 space-y-1 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors" title={anime.title}>
              {anime.title}
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            {(anime.type || anime.animeType) && <span className="capitalize text-[10px] sm:text-xs">{anime.type || anime.animeType}</span>}
            {anime.subOrDub && (
              <Badge 
                variant={anime.subOrDub.toLowerCase() === 'dub' ? 'secondary' : 'outline'} 
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/80"
              >
                {anime.subOrDub.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
