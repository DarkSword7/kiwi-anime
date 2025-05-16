import { getAnimeById } from '@/data/mock-anime';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star, CalendarDays, Tv, Film, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';

interface AnimeDetailsPageProps {
  params: {
    id: string;
  };
}

export default function AnimeDetailsPage({ params }: AnimeDetailsPageProps) {
  const anime = getAnimeById(params.id);

  if (!anime) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0 relative h-64 md:h-96">
          <Image
            src={anime.coverImage} // Assuming coverImage can be used as a banner too
            alt={`Banner for ${anime.title}`}
            layout="fill"
            objectFit="cover"
            className="opacity-80"
            priority
            data-ai-hint="anime art wide"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground drop-shadow-md">{anime.title}</h1>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex justify-center md:justify-start">
              <Image
                src={anime.coverImage}
                alt={`Cover for ${anime.title}`}
                width={200}
                height={300}
                className="rounded-lg shadow-lg object-cover"
                data-ai-hint="anime poster portrait"
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-4 text-lg">
                <div className="flex items-center text-amber-500">
                  <Star className="w-6 h-6 mr-1 fill-current" />
                  <span className="font-semibold">{anime.rating.toFixed(1)}</span>
                </div>
                {anime.year && (
                  <div className="flex items-center text-muted-foreground">
                    <CalendarDays className="w-5 h-5 mr-1" />
                    <span>{anime.year}</span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">{genre}</Badge>
                  ))}
                </div>
              </div>

              {anime.status && (
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <Badge variant={anime.status === 'Airing' ? 'default' : 'outline'} className="capitalize">{anime.status}</Badge>
                </div>
              )}

              {anime.episodes && (
                 <div className="flex items-center text-muted-foreground">
                  <Tv className="w-5 h-5 mr-2" />
                  <span>{anime.episodes} Episodes</span>
                </div>
              )}

              {anime.studios && anime.studios.length > 0 && (
                <div className="flex items-center text-muted-foreground">
                  <Film className="w-5 h-5 mr-2" />
                  <span>{anime.studios.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold mb-3">Synopsis</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
              {anime.description}
            </p>
          </div>

          {/* Placeholder for future sections like episode list, related content, etc. */}

        </CardContent>
      </Card>
    </div>
  );
}
