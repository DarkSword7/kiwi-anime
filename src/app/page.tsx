
import { HeroCarousel } from '@/components/HeroCarousel';
import { AnimeSlider } from '@/components/AnimeSlider';
import { CompactAnimeListItem } from '@/components/CompactAnimeListItem';
import { TopAnimeSidebar } from '@/components/TopAnimeSidebar';
import { 
  getPopularAnimeList, 
  getTrendingAnimeList, 
  getRecentEpisodesList,
  getMostFavoriteAnimeList,
  getLatestCompletedAnimeList,
  getRecentlyAddedAnimeList
} from '@/services/anime-service';
import { Separator } from '@/components/ui/separator';

export default async function HomePage() {
  const [
    trendingAnimeResult, 
    popularAnimeResult, 
    recentEpisodesResult,
    mostFavoriteAnimeResult,
    latestCompletedAnimeResult,
    recentlyAddedAnimeResult
  ] = await Promise.allSettled([
    getTrendingAnimeList(1),    // For Hero Carousel
    getPopularAnimeList(1),     // For Popular Series Slider
    getRecentEpisodesList(1),   // For Recently Uploaded Slider & New Release Column
    getMostFavoriteAnimeList(1),// For Top Anime Sidebar
    getLatestCompletedAnimeList(1), // For Latest Completed Column
    getRecentlyAddedAnimeList(1)  // For Recently Added Column
  ]);

  const trendingAnime = trendingAnimeResult.status === 'fulfilled' ? trendingAnimeResult.value : [];
  const popularAnime = popularAnimeResult.status === 'fulfilled' ? popularAnimeResult.value : [];
  const recentEpisodes = recentEpisodesResult.status === 'fulfilled' ? recentEpisodesResult.value : [];
  const mostFavoriteAnime = mostFavoriteAnimeResult.status === 'fulfilled' ? mostFavoriteAnimeResult.value : [];
  const latestCompletedAnime = latestCompletedAnimeResult.status === 'fulfilled' ? latestCompletedAnimeResult.value : [];
  const recentlyAddedAnime = recentlyAddedAnimeResult.status === 'fulfilled' ? recentlyAddedAnimeResult.value : [];
  
  const carouselItems = trendingAnime.slice(0, 8);
  const recentEpisodesForSlider = recentEpisodes.slice(0, 20);
  const popularAnimeForSlider = popularAnime.slice(0, 20);
  
  const newReleaseItems = recentEpisodes.slice(0, 5);
  const recentlyAddedItems = recentlyAddedAnime.slice(0, 5); 
  const latestCompletedItems = latestCompletedAnime.slice(0, 5);

  const topAnimeForSidebar = mostFavoriteAnime.slice(0, 10);

  const sidebarStickyTopClass = "top-[calc(theme(spacing.16)_+_theme(spacing.8))]"; 
  const sidebarMaxHeightClass = "max-h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.8)_-_theme(spacing.8))]";

  return (
    <div className="space-y-10 md:space-y-14">
      <HeroCarousel items={carouselItems} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_300px] gap-6">
        
        <div className="space-y-10 md:space-y-14 order-1 lg:order-1 overflow-hidden">
          {recentEpisodesForSlider.length > 0 && (
            <AnimeSlider title="Recently Uploaded" animeList={recentEpisodesForSlider} />
          )}

          {popularAnimeForSlider.length > 0 && (
             <AnimeSlider title="Popular Series" animeList={popularAnimeForSlider} />
          )}

          <Separator className="my-8 md:my-12 bg-border/30" />

          <section className="py-8 md:py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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

              {recentlyAddedItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary/50 pb-2 mb-4">
                    Recently Added →
                  </h3>
                  <div className="space-y-3">
                    {recentlyAddedItems.map((anime) => (
                      <CompactAnimeListItem key={`added-${anime.id}`} anime={anime} />
                    ))}
                  </div>
                </div>
              )}
              
              {latestCompletedItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary/50 pb-2 mb-4">
                    Latest Completed →
                  </h3>
                  <div className="space-y-3">
                    {latestCompletedItems.map((anime) => (
                      <CompactAnimeListItem key={`completed-${anime.id}`} anime={anime} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {(newReleaseItems.length === 0 && recentlyAddedItems.length === 0 && latestCompletedItems.length === 0) && (
                 <p className="text-muted-foreground text-center col-span-1 md:col-span-2 xl:col-span-3">
                    Could not load additional anime lists at the moment.
                </p>
            )}
          </section>
        </div>

        <aside 
          className={`order-2 lg:order-2 lg:sticky ${sidebarStickyTopClass} ${sidebarMaxHeightClass} w-full lg:w-auto`}
        >
          {topAnimeForSidebar.length > 0 ? (
            <TopAnimeSidebar animeList={topAnimeForSidebar} />
          ) : (
            <div className="bg-card/50 rounded-lg p-4 shadow-md h-full flex items-center justify-center">
              <p className="text-muted-foreground">Top anime list couldn't be loaded.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
