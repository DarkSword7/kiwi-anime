import { AnimeCard } from '@/components/AnimeCard';
import { getPopularAnime, getTrendingAnime } from '@/data/mock-anime';
import Image from 'next/image';

export default function HomePage() {
  const trendingAnime = getTrendingAnime();
  const popularAnime = getPopularAnime();

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
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            Your portal to an exciting world of anime. Discover trending shows, popular series, and get personalized suggestions.
          </p>
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
          <p className="text-muted-foreground">No trending anime available at the moment.</p>
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
          <p className="text-muted-foreground">No popular anime available at the moment.</p>
        )}
      </section>
    </div>
  );
}
