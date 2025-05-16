import { getAnimeInfo } from '@/services/anime-service';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Tv, Film, Clapperboard, Info, List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import type { AnimeInfo, Episode } from '@/types/anime';

interface AnimeDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function AnimeDetailsPage({ params }: AnimeDetailsPageProps) {
  const anime: AnimeInfo | null = await getAnimeInfo(params.id);

  if (!anime) {
    notFound(); // Triggers the not-found.tsx page
  }
  
  const year = anime.releaseDate ? (isNaN(Number(anime.releaseDate)) ? new Date(anime.releaseDate).getFullYear() : anime.releaseDate) : 'N/A';
  const imageUrl = anime.image || 'https://placehold.co/600x400.png'; // Fallback banner
  const coverImageUrl = anime.image || 'https://placehold.co/200x300.png'; // Fallback cover


  return (
    <div className="max-w-5xl mx-auto">
      <Card className="overflow-hidden shadow-xl bg-card">
        <CardHeader className="p-0 relative h-64 md:h-80">
          <Image
            src={imageUrl}
            alt={`Banner for ${anime.title}`}
            layout="fill"
            objectFit="cover"
            className="opacity-50" // Darken banner slightly
            priority
            data-ai-hint="anime art wide"
            unoptimized={!anime.image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground drop-shadow-lg">{anime.title}</h1>
            {anime.otherName && <p className="text-sm text-muted-foreground drop-shadow-sm">{anime.otherName}</p>}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex justify-center md:justify-start">
              <Image
                src={coverImageUrl}
                alt={`Cover for ${anime.title}`}
                width={220}
                height={330}
                className="rounded-lg shadow-lg object-cover border-2 border-border"
                data-ai-hint="anime poster portrait"
                 unoptimized={!anime.image}
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              {anime.type && (
                <div className="flex items-center text-muted-foreground">
                  <Clapperboard className="w-5 h-5 mr-2 text-primary" />
                  <span>Type: {anime.type}</span>
                </div>
              )}
              
              {anime.releaseDate && (
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                  <span>Released: {String(year)}</span>
                </div>
              )}

              {anime.status && (
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <Badge 
                        variant={anime.status.toLowerCase() === 'ongoing' || anime.status.toLowerCase() === 'airing' ? 'default' : 'secondary'} 
                        className="capitalize py-1 px-3 text-xs"
                    >
                        {anime.status}
                    </Badge>
                </div>
              )}
              
              {typeof anime.totalEpisodes === 'number' && (
                 <div className="flex items-center text-muted-foreground">
                  <Tv className="w-5 h-5 mr-2 text-primary" />
                  <span>{anime.totalEpisodes} Episodes</span>
                </div>
              )}

              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">{genre}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {anime.description && (
            <div>
              <h2 className="text-2xl font-semibold mb-3 flex items-center">
                <Info className="w-6 h-6 mr-2 text-primary"/> Synopsis
              </h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {anime.description}
              </p>
            </div>
          )}

          {anime.episodes && anime.episodes.length > 0 && (
            <div>
              <Separator className="my-6"/>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <List className="w-6 h-6 mr-2 text-primary"/> Episodes ({anime.totalEpisodes})
              </h2>
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2 rounded-md border p-4 bg-background/50">
                {anime.episodes.map((episode: Episode) => (
                  <Link key={episode.id} href={`/watch/${episode.id}?animeId=${anime.id}&epNum=${episode.number}`} passHref>
                    <Button variant="ghost" className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-muted">
                       <span className="text-primary font-medium mr-2">Ep {episode.number}:</span>
                       <span className="truncate flex-1">{episode.title || `Episode ${episode.number}`}</span>
                       {/* TODO: Add play icon or watch status later */}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {!anime.episodes || anime.episodes.length === 0 && (
            <p className="text-muted-foreground mt-4">No episode information available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
