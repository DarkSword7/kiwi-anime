
import { HeroCarousel } from '@/components/HeroCarousel';
import { AnimeSlider } from '@/components/AnimeSlider';
import { CompactAnimeListItem } from '@/components/CompactAnimeListItem';
import { TopAnimeSidebar } from '@/components/TopAnimeSidebar';
import { getPopularAnimeList, getTrendingAnimeList, getRecentEpisodesList } from '@/services/anime-service';
import { Separator } from '@/components/ui/separator';

export default async function HomePage() {
  const [trendingAnimeResult, popularAnimeResult, recentEpisodesResult] = await Promise.allSettled([
    getTrendingAnimeList(1), // Fetches a page of trending anime
    getPopularAnimeList(1),  // Fetches a page of popular anime
    getRecentEpisodesList(1) // Fetches a page of recent episodes
  ]);

  const trendingAnime = trendingAnimeResult.status === 'fulfilled' ? trendingAnimeResult.value : [];
  const popularAnime = popularAnimeResult.status === 'fulfilled' ? popularAnimeResult.value : [];
  const recentEpisodes = recentEpisodesResult.status === 'fulfilled' ? recentEpisodesResult.value : [];
  
  // Data for Hero Carousel (e.g., first 8 trending items)
  const carouselItems = trendingAnime.slice(0, 8);

  // Data for Sliders (e.g., first 20 items)
  const recentEpisodesForSlider = recentEpisodes.slice(0, 20);
  const popularAnimeForSlider = popularAnime.slice(0, 20);
  
  // Data for Columnar Lists (e.g., first 5 items from respective lists)
  const newReleaseItems = recentEpisodes.slice(0, 5);
  const newAddedItems = trendingAnime.slice(0, 5); 
  const popularRightNowItems = popularAnime.slice(0, 5);

  // Data for Top Anime Sidebar (e.g., top 10 popular items)
  const topAnimeForSidebar = popularAnime.slice(0, 10);

  // Tailwind classes for sticky sidebar positioning
  const sidebarStickyTopClass = "top-[calc(theme(spacing.16)_+_theme(spacing.8))]"; // Header height (h-16) + main content py-8 top
  const sidebarMaxHeightClass = "max-h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.8)_-_theme(spacing.8))]"; // Full height minus header and main's top/bottom padding

  return (
    <div className="space-y-10 md:space-y-14"> {/* Outer container for spacing */}
      <HeroCarousel items={carouselItems} />

      {/* Grid container for main content and sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_300px] gap-6">
        
        {/* Main content sections (sliders, columnar list) */}
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
                 <p className="text-muted-foreground text-center col-span-1 md:col-span-2 xl:col-span-3">
                    Could not load additional anime lists at the moment.
                </p>
            )}
          </section>
        </div>

        {/* Sidebar column */}
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
