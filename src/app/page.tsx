
import { HeroCarousel } from '@/components/HeroCarousel';
import { AnimeSlider } from '@/components/AnimeSlider';
import { CompactAnimeListItem } from '@/components/CompactAnimeListItem';
import { TopAnimeSidebar } from '@/components/TopAnimeSidebar';
import { getPopularAnimeList, getTrendingAnimeList, getRecentEpisodesList } from '@/services/anime-service';
import { Separator } from '@/components/ui/separator';

export default async function HomePage() {
  const [trendingAnimeResult, popularAnimeResult, recentEpisodesResult] = await Promise.allSettled([
    getTrendingAnimeList(1),     // For Hero Carousel & "New Added" column
    getPopularAnimeList(1),      // For "Popular Series" slider & "Popular Right Now" column & Top Anime Sidebar
    getRecentEpisodesList(1)     // For "Recently Uploaded" slider & "New Release" column
  ]);

  const trendingAnime = trendingAnimeResult.status === 'fulfilled' ? trendingAnimeResult.value : [];
  const popularAnime = popularAnimeResult.status === 'fulfilled' ? popularAnimeResult.value : [];
  const recentEpisodes = recentEpisodesResult.status === 'fulfilled' ? recentEpisodesResult.value : [];
  
  const carouselItems = trendingAnime.slice(0, 8);
  const recentEpisodesForSlider = recentEpisodes.slice(0, 20);
  const popularAnimeForSlider = popularAnime.slice(0, 20);
  const topAnimeForSidebar = popularAnime.slice(0, 10); // Top 10 for the sidebar

  // Data for the 3-column list section
  const newReleaseItems = recentEpisodes.slice(0, 5);
  const newAddedItems = trendingAnime.slice(0, 5); 
  const popularRightNowItems = popularAnime.slice(0, 5);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,380px)] gap-x-8 gap-y-10"> {/* Main content and sidebar */}
      {/* Main content column */}
      <div className="space-y-10 md:space-y-14 lg:col-span-1">
        <HeroCarousel items={carouselItems} />

        {recentEpisodesForSlider.length > 0 && (
          <AnimeSlider title="Recently Uploaded" animeList={recentEpisodesForSlider} />
        )}

        {popularAnimeForSlider.length > 0 && (
           <AnimeSlider title="Popular Series" animeList={popularAnimeForSlider} />
        )}

        <Separator className="my-8 md:my-12 bg-border/30" />

        {/* 3-Column List Section */}
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
      <aside className="hidden lg:block lg:col-span-1 sticky top-20 h-[calc(100vh-5rem-2.5rem)] "> {/* Adjust stickiness and height as needed */}
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
