import { AnimeCard } from '@/components/AnimeCard';
import { getPopularAnimeList, getTrendingAnimeList, searchAnime } from '@/services/anime-service';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

export default async function HomePage() {
  const [trendingAnimeResult, popularAnimeResult, heroAnimeResult] = await Promise.allSettled([
    getTrendingAnimeList(1), // Fetches from /top-airing
    getPopularAnimeList(1),  // Fetches from /most-popular
    searchAnime("Demon Slayer", 1) // Example search for hero section
  ]);

  const trendingAnime = trendingAnimeResult.status === 'fulfilled' ? trendingAnimeResult.value.slice(0, 6) : []; // Show 6
  const popularAnime = popularAnimeResult.status === 'fulfilled' ? popularAnimeResult.value.slice(0, 6) : []; // Show 6
  
  const heroAnime = heroAnimeResult.status === 'fulfilled' && heroAnimeResult.value.results.length > 0 
    ? heroAnimeResult.value.results[0] 
    : null;

  return (
    <div className="space-y-16">
      <section className="relative h-[50vh] md:h-[65vh] rounded-lg overflow-hidden group text-foreground">
        <Image 
          src={heroAnime?.image || "https://placehold.co/1600x900.png"} 
          alt={heroAnime?.title || "Featured Anime Banner"}
          layout="fill" 
          objectFit="cover" 
          className="opacity-30 group-hover:opacity-40 transition-opacity duration-300"
          data-ai-hint="anime landscape epic"
          priority
          unoptimized={!heroAnime?.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative z-10 flex flex-col items-start justify-end h-full p-6 md:p-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-xl">
            {heroAnime?.title || "Explore Exciting Anime"}
          </h1>
          {/* For a real app, you'd fetch full info for description. Here using a placeholder. */}
          <p className="text-md md:text-lg text-foreground/80 max-w-xl drop-shadow-md line-clamp-3">
            {heroAnime 
              ? `Discover episodes and more for ${heroAnime.title}. Dive into its captivating world.`
              : "Your portal to an exciting world of anime. Discover trending shows, popular series, and get personalized suggestions."
            }
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-accent text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <Link href={heroAnime ? `/anime/${heroAnime.id}` : "/search"}>
              <PlayCircle className="mr-2 h-6 w-6" /> Play Now
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Trending Now</h2>
          {/* <Link href="/trending" className="text-sm text-primary hover:text-accent transition-colors">View All</Link> */}
        </div>
        {trendingAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {trendingAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Could not load trending anime at the moment. Try refreshing.</p>
        )}
      </section>

      <section>
         <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Popular Series</h2>
          {/* <Link href="/popular" className="text-sm text-primary hover:text-accent transition-colors">View All</Link> */}
        </div>
        {popularAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
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
