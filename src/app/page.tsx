
import { AnimeCard } from '@/components/AnimeCard';
import { HeroCarousel } from '@/components/HeroCarousel';
import { getPopularAnimeList, getTrendingAnimeList, getRecentEpisodesList } from '@/services/anime-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const [trendingAnimeResult, popularAnimeResult, recentEpisodesResult] = await Promise.allSettled([
    getTrendingAnimeList(1), // Fetches from /top-airing
    getPopularAnimeList(1),  // Fetches from /most-popular
    getRecentEpisodesList(1) // Fetches from /recent-episodes
  ]);

  const trendingAnime = trendingAnimeResult.status === 'fulfilled' ? trendingAnimeResult.value.slice(0, 8) : []; // Use more for carousel
  const popularAnime = popularAnimeResult.status === 'fulfilled' ? popularAnimeResult.value.slice(0, 6) : []; // Show 6
  const recentEpisodes = recentEpisodesResult.status === 'fulfilled' ? recentEpisodesResult.value.slice(0, 6) : []; // Show 6
  
  return (
    <div className="space-y-12 md:space-y-16">
      <HeroCarousel items={trendingAnime} />

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Trending Now</h2>
          {/* Optional: Add a "View All" link if you create a dedicated page */}
          {/* <Link href="/trending" className="text-sm text-primary hover:text-accent transition-colors flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link> */}
        </div>
        {trendingAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {/* Display a subset of trending if desired, or use popular here and carousel for trending */}
            {trendingAnime.slice(0,6).map((anime) => (
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
          {/* <Link href="/popular" className="text-sm text-primary hover:text-accent transition-colors flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link> */}
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

      <section>
         <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Recently Uploaded</h2>
           {/* <Link href="/recent" className="text-sm text-primary hover:text-accent transition-colors flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link> */}
        </div>
        {recentEpisodes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {recentEpisodes.map((anime) => (
              // Assuming AnimeSearchResult is compatible. If recent episodes have a different structure,
              // you might need a different card or adapt AnimeCard.
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Could not load recently uploaded episodes at the moment. Try refreshing.</p>
        )}
      </section>
    </div>
  );
}
