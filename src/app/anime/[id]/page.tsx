
import { getAnimeInfo } from '@/services/anime-service';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Tv, Film, Clapperboard, Info, List, Users, Star, ThumbsUp, ShieldQuestion } from 'lucide-react';
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
    notFound(); 
  }
  
  const year = anime.releaseDate ? (isNaN(Number(anime.releaseDate)) ? new Date(anime.releaseDate).getFullYear() : anime.releaseDate) : 'N/A';
  // Use a more dynamic placeholder or ensure API always provides an image
  const bannerImageUrl = anime.cover || anime.image || 'https://placehold.co/1200x400.png?text=Banner+Not+Available'; 
  const coverImageUrl = anime.image || 'https://placehold.co/220x330.png?text=Cover';


  return (
    <div className="max-w-6xl mx-auto text-foreground">
      {/* Banner Section */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full rounded-lg overflow-hidden shadow-2xl mb-[-80px] md:mb-[-120px]">
        <Image
          src={bannerImageUrl}
          alt={`Banner for ${anime.title}`}
          layout="fill"
          objectFit="cover"
          className="opacity-40"
          priority
          data-ai-hint="anime art wide"
          unoptimized={!anime.cover && !anime.image} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <Card className="overflow-hidden shadow-xl bg-card border-border/50 relative z-10 mx-4 md:mx-8 lg:mx-auto">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-[250px_1fr] gap-6 md:gap-8 items-start">
            {/* Left Column: Cover Image & Actions */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <Image
                src={coverImageUrl}
                alt={`Cover for ${anime.title}`}
                width={220}
                height={330}
                className="rounded-lg shadow-lg object-cover border-2 border-border aspect-[2/3]"
                data-ai-hint="anime poster portrait"
                unoptimized={!anime.image}
              />
              {anime.episodes && anime.episodes.length > 0 && (
                <Button asChild size="lg" className="w-full bg-primary hover:bg-accent text-primary-foreground">
                  <Link href={`/watch?ep=${encodeURIComponent(anime.episodes[0].id)}&animeId=${anime.id}&epNum=${anime.episodes[0].number}`}>
                    Watch Episode 1
                  </Link>
                </Button>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="space-y-5">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{anime.title}</h1>
              {anime.otherName && <p className="text-sm text-muted-foreground -mt-3">{anime.otherName}</p>}
              
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {anime.type && (
                  <div className="flex items-center">
                    {anime.type.toLowerCase().includes("movie") ? <Film className="w-4 h-4 mr-1.5 text-primary" /> : <Clapperboard className="w-4 h-4 mr-1.5 text-primary" />}
                    <span>{anime.type}</span>
                  </div>
                )}
                {anime.releaseDate && (
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1.5 text-primary" />
                    <span>{String(year)}</span>
                  </div>
                )}
                {anime.status && (
                   <div className="flex items-center">
                    <ShieldQuestion className="w-4 h-4 mr-1.5 text-primary" /> {/* Placeholder icon for status */}
                    <Badge 
                        variant={anime.status.toLowerCase() === 'ongoing' || anime.status.toLowerCase() === 'releasing' || anime.status.toLowerCase() === 'airing' ? 'default' : 'secondary'} 
                        className={`capitalize py-0.5 px-2 text-xs ${anime.status.toLowerCase() === 'ongoing' || anime.status.toLowerCase() === 'releasing' || anime.status.toLowerCase() === 'airing' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary/20 text-secondary-foreground border-secondary/30'}`}
                    >
                        {anime.status}
                    </Badge>
                   </div>
                )}
                {typeof anime.totalEpisodes === 'number' && anime.totalEpisodes > 0 && (
                   <div className="flex items-center">
                    <Tv className="w-4 h-4 mr-1.5 text-primary" />
                    <span>{anime.totalEpisodes} Episodes</span>
                  </div>
                )}
                 {/* Example for Rating & Popularity - if API provides it */}
                {/* {anime.rating && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1.5 text-amber-400" /> 
                    <span>{anime.rating / 10}/10</span>
                  </div>
                )}
                {anime.popularity && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1.5 text-teal-400" /> 
                    <span>#{anime.popularity} Popularity</span>
                  </div>
                )} */}
              </div>

              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs border-primary/30 text-primary/80 hover:bg-primary/10">{genre}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {anime.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center text-foreground/90">
                    <Info className="w-5 h-5 mr-2 text-primary"/> Synopsis
                  </h2>
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm md:text-base max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
                    {anime.description.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?i>/gi, '')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {anime.episodes && anime.episodes.length > 0 && (
            <div className="mt-8">
              <Separator className="my-6 bg-border/50"/>
              <h2 className="text-2xl font-semibold mb-4 flex items-center text-foreground/90">
                <List className="w-6 h-6 mr-2 text-primary"/> Episodes ({anime.episodes.length})
              </h2>
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 rounded-md border border-border/50 p-4 bg-background/50 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
                {anime.episodes.map((episode: Episode) => (
                  <Link key={episode.id} href={`/watch?ep=${encodeURIComponent(episode.id)}&animeId=${anime.id}&epNum=${episode.number}`} passHref>
                    <Button variant="ghost" className="w-full justify-start text-left h-auto py-2.5 px-3 hover:bg-primary/10 hover:text-primary transition-colors duration-150">
                       <span className="text-primary font-medium mr-2 min-w-[60px]">Ep {episode.number}:</span>
                       <span className="truncate flex-1 text-foreground/90">{episode.title || `Episode ${episode.number}`}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {(!anime.episodes || anime.episodes.length === 0) && (
            <p className="text-muted-foreground mt-6 text-center">No episode information available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
