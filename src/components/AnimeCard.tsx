import Link from 'next/link';
import Image from 'next/image';
import type { AnimeSearchResult } from '@/types/anime';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardFooter, CardHeader, CardTitle
import { Badge } from '@/components/ui/badge';
import { Tv } from 'lucide-react'; // For episode count example if available

interface AnimeCardProps {
  anime: AnimeSearchResult;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const imageUrl = anime.image || 'https://placehold.co/200x300.png?text=No+Image';
  const dataAiHint = anime.image ? "anime poster portrait" : "placeholder anime";

  return (
    <Link href={`/anime/${anime.id}`} passHref>
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
           {/* Overlay for title could go here if design needs it on image */}
        </div>
        <CardContent className="p-3 space-y-1">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors" title={anime.title}>
            {anime.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {anime.type && <span className="capitalize">{anime.type}</span>}
            {anime.subOrDub && (
              <Badge 
                variant={anime.subOrDub.toLowerCase() === 'dub' ? 'secondary' : 'outline'} 
                className="text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/80"
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
