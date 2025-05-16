import Link from 'next/link';
import Image from 'next/image';
import type { AnimeSearchResult } from '@/types/anime'; // Using AnimeSearchResult as it's what search provides
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

interface AnimeCardProps {
  anime: AnimeSearchResult; // Changed to AnimeSearchResult
}

export function AnimeCard({ anime }: AnimeCardProps) {
  // Fallback image in case API image is invalid or missing
  const imageUrl = anime.image || 'https://placehold.co/300x450.png';
  const dataAiHint = anime.image ? "anime poster" : "placeholder anime";

  return (
    <Link href={`/anime/${anime.id}`} passHref>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer group">
        <CardHeader className="p-0 relative aspect-[2/3]">
          <Image
            src={imageUrl}
            alt={`Cover image for ${anime.title}`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={dataAiHint}
            unoptimized={!anime.image} // Use unoptimized for placeholder if API image fails
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2 leading-tight truncate" title={anime.title}>
            {anime.title}
          </CardTitle>
          {anime.releaseDate && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <CalendarDays className="w-3.5 h-3.5 mr-1" />
              <span>{anime.releaseDate}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {anime.subOrDub && (
            <Badge variant={anime.subOrDub === 'dub' ? 'secondary' : 'outline'} className="text-xs capitalize">
              {anime.subOrDub}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
