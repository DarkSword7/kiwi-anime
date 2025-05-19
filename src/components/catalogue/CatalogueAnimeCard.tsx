
import type { AnimeSearchResult } from '@/types/anime';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Tv } from 'lucide-react';

interface CatalogueAnimeCardProps {
  anime: AnimeSearchResult;
}

export function CatalogueAnimeCard({ anime }: CatalogueAnimeCardProps) {
  const imageUrl = anime.image || 'https://placehold.co/300x450.png?text=No+Image';
  const dataAiHint = anime.image ? "anime poster portrait" : "placeholder anime";
  const year = anime.releaseDate ? (isNaN(Number(anime.releaseDate)) ? new Date(anime.releaseDate).getFullYear() : anime.releaseDate) : null;
  
  // The API doesn't provide description or full genre list in search results,
  // so we'll keep it simple for now. Description shown in the image would require fetching full info per card.
  const displayGenres = (anime as any).genres?.slice(0, 2).join(', ') || '';

  return (
    <Link href={`/anime/${anime.id}`} passHref>
      <Card className="h-full flex flex-col bg-card border-border/50 rounded-lg overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/50">
        <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={anime.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={dataAiHint}
            unoptimized={!anime.image}
          />
          {anime.type && (
            <Badge className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 backdrop-blur-sm">
              {anime.type.toUpperCase()}
            </Badge>
          )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
        </CardHeader>
        <CardContent className="p-3 space-y-1.5 flex-grow flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight" title={anime.title}>
              {anime.title}
            </CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
              {year && (
                <div className="flex items-center">
                  <CalendarDays className="w-3 h-3 mr-1 text-primary/70" />
                  <span>{year}</span>
                </div>
              )}
              {/* Displaying anime type if available from search */}
              {anime.type && !year && ( // Show type if year is not present to avoid redundancy with badge
                 <div className="flex items-center">
                  <Tv className="w-3 h-3 mr-1 text-primary/70" />
                  <span className="capitalize">{anime.type}</span>
                </div>
              )}
            </div>
             {/* For description, API needs to provide it in search results or fetch per card (costly) */}
             {/* <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {(anime as any).description || 'No description available.'}
            </CardDescription> */}
          </div>
           {anime.subOrDub && (
              <Badge 
                variant={anime.subOrDub.toLowerCase() === 'dub' ? 'secondary' : 'outline'} 
                className="text-[10px] px-1.5 py-0.5 mt-auto self-start border-primary/30 text-primary/80"
              >
                {anime.subOrDub.toUpperCase()}
              </Badge>
            )}
        </CardContent>
      </Card>
    </Link>
  );
}
