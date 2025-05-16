import { AnimeCard } from '@/components/AnimeCard';
import { getPopularAnimeList, getTrendingAnimeList } from '@/services/anime-service';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  // Fetch data in parallel
  const [trendingAnimeResult, popularAnimeResult] = await Promise.allSettled([
    getTrendingAnimeList(1),
    getPopularAnimeList(1)
  ]);

  const trendingAnime = trendingAnimeResult.status === 'fulfilled' ? trendingAnimeResult.value : [];
  const popularAnime = popularAnimeResult.status === 'fulfilled' ? popularAnimeResult.value : [];

  return (
    <div className="space-y-12">
      <section className="relative rounded-lg overflow-hidden text-center p-8 md:p-16 bg-card shadow-lg">
        <Image 
          src="https://placehold.co/1200x400.png" 
          alt="AniWave Lite Banner" 
          layout="fill" 
          objectFit="cover" 
          className="opacity-20 dark:opacity-10"
          data-ai-hint="anime landscape"
          priority
        />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-primary">
            Welcome to AniWave Lite
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-6">
            Your portal to an exciting world of anime. Discover trending shows, popular series, and get personalized suggestions.
          </p>
          <Button size="lg" asChild>
            <Link href="/search">Explore Anime</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 pb-2 border-b-2 border-primary">Trending Anime</h2>
        {trendingAnime.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Could not load trending anime at the moment. Try refreshing.</p>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 pb-2 border-b-2 border-primary">Popular Anime</h2>
        {popularAnime.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Could not load popular anime at the moment. Try refreshing.</p>
        )}
      </section>
    </div>
  );
}
