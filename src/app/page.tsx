
import { HeroCarousel } from '@/components/HeroCarousel';
import { AnimeSlider } from '@/components/AnimeSlider';
import { CompactAnimeListItem } from '@/components/CompactAnimeListItem';
import { TopAnimeSidebar } from '@/components/TopAnimeSidebar';
import { getPopularAnimeList, getTrendingAnimeList, getRecentEpisodesList } from '@/services/anime-service';
import { Separator } from '@/components/ui/separator';

export default async function HomePage() {
  const [trendingAnimeResult, popularAnimeResult, recentEpisodesResult] = await Promise.allSettled([
    getTrendingAnimeList(1), // Assuming this fetches a good number for carousel/lists
    getPopularAnimeList(1), // Assuming this fetches a good number for popular slider & sidebar
    getRecentEpisodesList(1) // Assuming this fetches a good number for recent slider
  ]);

  const trendingAnime = trendingAnimeResult.status === 'fulfilled' ? trendingAnimeResult.value : [];
  const popularAnime = popularAnimeResult.status === 'fulfilled' ? popularAnimeResult.value : [];
  const recentEpisodes = recentEpisodesResult.status === 'fulfilled' ? recentEpisodesResult.value : [];
  
  const carouselItems = trendingAnime.slice(0, 8);
  const recentEpisodesForSlider = recentEpisodes.slice(0, 20);
  const popularAnimeForSlider = popularAnime.slice(0, 20);
  const topAnimeForSidebar = popularAnime.slice(0, 10);

  const newReleaseItems = recentEpisodes.slice(0, 5);
  const newAddedItems = trendingAnime.slice(0, 5); 
  const popularRightNowItems = popularAnime.slice(0, 5);

  // Header height is h-16 (4rem). Main content in layout.tsx has py-8 (2rem top/bottom padding).
  // Sidebar sticky top should be 4rem (header) + 2rem (main padding top) = 6rem.
  const sidebarStickyTopClass = "top-[calc(theme(spacing.16)_+_theme(spacing.8))]"; 
  // Sidebar max height: 100vh - (header_height + main_padding_top) - main_padding_bottom
  const sidebarMaxHeightClass = "max-h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.8)_-_theme(spacing.8))]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_320px] gap-6"> {/* Adjusted grid and gap */}
      {/* Main content column */}
      <div className="space-y-10 md:space-y-14 order-1"> {/* Ensure main content is first on small screens */}
        <HeroCarousel items={carouselItems} />

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

      {/* Sidebar column - always in DOM, but stacking and sticky behavior changes with screen size */}
      <aside 
        className={`order-2 lg:order-none lg:sticky ${sidebarStickyTopClass} ${sidebarMaxHeightClass}`}
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
  );
}
