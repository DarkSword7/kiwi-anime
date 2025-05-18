
import { HeroCarousel } from '@/components/HeroCarousel';
import { AnimeSlider } from '@/components/AnimeSlider';
import { CompactAnimeListItem } from '@/components/CompactAnimeListItem';
import { getPopularAnimeList, getTrendingAnimeList, getRecentEpisodesList } from '@/services/anime-service';
import type { AnimeSearchResult } from '@/types/anime';
import { Separator } from '@/components/ui/separator';

export default async function HomePage() {
  const [trendingAnimeResult, popularAnimeResult, recentEpisodesResult] = await Promise.allSettled([
    getTrendingAnimeList(1),     // For Hero Carousel & "New Added" column
    getPopularAnimeList(1),      // For "Popular Series" slider & "Popular Right Now" column
    getRecentEpisodesList(1)     // For "Recently Uploaded" slider & "New Release" column
  ]);

  const trendingAnime = trendingAnimeResult.status === 'fulfilled' ? trendingAnimeResult.value : [];
  const popularAnime = popularAnimeResult.status === 'fulfilled' ? popularAnimeResult.value : [];
  const recentEpisodes = recentEpisodesResult.status === 'fulfilled' ? recentEpisodesResult.value : [];
  
  const carouselItems = trendingAnime.slice(0, 8); // Max 8 items for carousel
  const recentEpisodesForSlider = recentEpisodes.slice(0, 20); // More items for slider
  const popularAnimeForSlider = popularAnime.slice(0, 20); // More items for slider

  // Data for the 3-column list section
  const newReleaseItems = recentEpisodes.slice(0, 5);
  const newAddedItems = trendingAnime.slice(0, 5); // Using trending as a proxy for "newly added"
  const popularRightNowItems = popularAnime.slice(0, 5);


  return (
    <div className="space-y-10 md:space-y-14">
      <HeroCarousel items={carouselItems} />

      {recentEpisodesForSlider.length > 0 && (
        <AnimeSlider title="Recently Uploaded" animeList={recentEpisodesForSlider} />
      )}

      {popularAnimeForSlider.length > 0 && (
         <AnimeSlider title="Popular Series" animeList={popularAnimeForSlider} />
      )}

      <Separator className="my-8 md:my-12 bg-border/30" />

      {/* 3-Column List Section */}
      <section className="py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Column 1: New Release */}
          {newReleaseItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary/50 pb-2 mb-4">
                New Release →
              </h3>
              <div className="space-y-3">
                {newReleaseItems.map((anime) => (
                  <CompactAnimeListItem key={`new-${anime.id}`} anime={anime} />
                ))}
              </div>
            </div>
          )}

          {/* Column 2: New Added (Using Trending) */}
          {newAddedItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary/50 pb-2 mb-4">
                Recently Added →
              </h3>
              <div className="space-y-3">
                {newAddedItems.map((anime) => (
                  <CompactAnimeListItem key={`added-${anime.id}`} anime={anime} />
                ))}
              </div>
            </div>
          )}
          
          {/* Column 3: Popular Right Now (Using Popular) */}
          {popularRightNowItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary/50 pb-2 mb-4">
                Popular Now →
              </h3>
              <div className="space-y-3">
                {popularRightNowItems.map((anime) => (
                  <CompactAnimeListItem key={`popular-col-${anime.id}`} anime={anime} />
                ))}
              </div>
            </div>
          )}
        </div>
        {(newReleaseItems.length === 0 && newAddedItems.length === 0 && popularRightNowItems.length === 0) && (
             <p className="text-muted-foreground text-center col-span-1 md:col-span-2 lg:col-span-3">
                Could not load additional anime lists at the moment.
            </p>
        )}
      </section>
    </div>
  );
}
