import Link from 'next/link';
import Image from 'next/image';
import type { Anime } from '@/types/anime';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`} passHref>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
        <CardHeader className="p-0 relative aspect-[2/3]">
          <Image
            src={anime.coverImage}
            alt={`Cover image for ${anime.title}`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            data-ai-hint="anime poster"
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2 leading-tight truncate" title={anime.title}>
            {anime.title}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Star className="w-4 h-4 mr-1 text-amber-500 fill-amber-500" />
            <span>{anime.rating.toFixed(1)}</span>
          </div>
          <div className="space-x-1">
            {anime.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
           <p className="text-xs text-muted-foreground">{anime.status}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
