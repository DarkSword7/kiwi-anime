
"use client"; // Needs to be client component to use useEffect for localStorage

import React, { useState, useEffect } from 'react';
import { HeroCarousel } from '@/components/HeroCarousel';
import { AnimeSlider } from '@/components/AnimeSlider';
import { CompactAnimeListItem } from '@/components/CompactAnimeListItem';
import { TopAnimeSidebar } from '@/components/TopAnimeSidebar';
import { 
  getPopularAnimeList, 
  getTrendingAnimeList, 
  getRecentEpisodesList,
  getLatestCompletedAnimeList,
  getRecentlyAddedAnimeList 
} from '@/services/anime-service';
import type { AnimeSearchResult, ContinueWatchingItem } from '@/types/anime'; // Import ContinueWatchingItem
import { getContinueWatchingList } from '@/lib/localStorageUtils'; // Import localStorage util
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  // State for fetched anime lists
  const [trendingAnime, setTrendingAnime] = useState<AnimeSearchResult[]>([]);
  const [popularAnime, setPopularAnime] = useState<AnimeSearchResult[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<AnimeSearchResult[]>([]);
  const [latestCompletedAnime, setLatestCompletedAnime] = useState<AnimeSearchResult[]>([]);
  const [recentlyAddedAnime, setRecentlyAddedAnime] = useState<AnimeSearchResult[]>([]);
  const [continueWatchingItems, setContinueWatchingItems] = useState<ContinueWatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      const [
        trendingResult, 
        popularResult, 
        recentResult,
        latestCompletedResult,
        recentlyAddedResult
      ] = await Promise.allSettled([
        getTrendingAnimeList(1),
        getPopularAnimeList(1),
        getRecentEpisodesList(1),
        getLatestCompletedAnimeList(1),
        getRecentlyAddedAnimeList(1)
      ]);

      if (trendingResult.status === 'fulfilled') setTrendingAnime(trendingResult.value.results);
      if (popularResult.status === 'fulfilled') setPopularAnime(popularResult.value.results);
      if (recentResult.status === 'fulfilled') setRecentEpisodes(recentResult.value.results);
      if (latestCompletedResult.status === 'fulfilled') setLatestCompletedAnime(latestCompletedResult.value.results);
      if (recentlyAddedResult.status === 'fulfilled') setRecentlyAddedAnime(recentlyAddedResult.value.results);
      
      // Fetch continue watching items from localStorage
      setContinueWatchingItems(getContinueWatchingList());
      
      setIsLoading(false);
    }
    fetchAllData();
  }, []);
  
  const carouselItems = trendingAnime.slice(0, 8);
  const newReleaseItems = recentEpisodes.slice(0, 5);
  const recentlyAddedItemsForColumn = recentlyAddedAnime.slice(0, 5); 
  const latestCompletedItemsForColumn = latestCompletedAnime.slice(0, 5);
  const topAnimeForSidebar = trendingAnime.slice(0, 10); 

  const sidebarStickyTopClass = "top-[calc(theme(spacing.16)_+_theme(spacing.8))]"; 
  const sidebarMaxHeightClass = "max-h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.8)_-_theme(spacing.8))]";

  // Transform ContinueWatchingItem to AnimeSearchResult for AnimeSlider/AnimeCard
  const continueWatchingForSlider: AnimeSearchResult[] = continueWatchingItems.map(item => ({
    id: item.animeId, // Use animeId as the main ID for linking to anime details page
    title: item.animeTitle,
    image: item.animeImage,
    // These fields are for display on AnimeCard if customized, or can be omitted
    // releaseDate: undefined, // Not directly available in ContinueWatchingItem
    // subOrDub: undefined, // Not directly available
    type: item.animeType, 
    // Custom props for AnimeCard
    episodeNumber: item.episodeNumber,
    watchLink: `/watch?ep=${encodeURIComponent(item.episodeId)}&animeId=${item.animeId}&epNum=${item.episodeNumber}`
  }));


  if (isLoading && trendingAnime.length === 0) { // Basic loading state for initial fetch
    return <div className="flex justify-center items-center min-h-screen text-primary text-xl">Loading Kiwi Anime...</div>;
  }

  return (
    <div className="space-y-10 md:space-y-14">
      <HeroCarousel items={carouselItems} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_300px] gap-6">
        <div className="space-y-8 md:space-y-10 order-1 lg:order-1 overflow-hidden">
          {continueWatchingForSlider.length > 0 && (
            <AnimeSlider 
              title="Continue Watching" 
              animeList={continueWatchingForSlider}
              // No "View All" for continue watching typically
            />
          )}

          {recentEpisodes.length > 0 && (
            <AnimeSlider 
              title="Recently Uploaded" 
              animeList={recentEpisodes}
              viewAllLink="/list/recent-episodes" 
            />
          )}

          {popularAnime.length > 0 && (
             <AnimeSlider 
              title="Popular Series" 
              animeList={popularAnime}
              viewAllLink="/list/popular"
            />
          )}

          <Separator className="my-6 md:my-8 bg-border/30" />

          <section className="py-6 md:py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {newReleaseItems.length > 0 && (
                <div className="space-y-4">
                  <Link href="/list/recent-episodes" className="group">
                    <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary/50 pb-2 mb-4 flex justify-between items-center group-hover:text-primary transition-colors">
                      New Release 
                      <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </h3>
                  </Link>
                  <div className="space-y-3">
                    {newReleaseItems.map((anime) => (
                      <CompactAnimeListItem key={`new-${anime.id}`} anime={anime} />
                    ))}
                  </div>
                </div>
              )}

              {recentlyAddedItemsForColumn.length > 0 && (
                <div className="space-y-4">
                   <Link href="/list/recently-added" className="group">
                    <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary/50 pb-2 mb-4 flex justify-between items-center group-hover:text-primary transition-colors">
                      Recently Added
                      <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </h3>
                  </Link>
                  <div className="space-y-3">
                    {recentlyAddedItemsForColumn.map((anime) => (
                      <CompactAnimeListItem key={`added-${anime.id}`} anime={anime} />
                    ))}
                  </div>
                </div>
              )}
              
              {latestCompletedItemsForColumn.length > 0 && (
                <div className="space-y-4">
                  <Link href="/list/latest-completed" className="group">
                    <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary/50 pb-2 mb-4 flex justify-between items-center group-hover:text-primary transition-colors">
                      Latest Completed
                      <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </h3>
                  </Link>
                  <div className="space-y-3">
                    {latestCompletedItemsForColumn.map((anime) => (
                      <CompactAnimeListItem key={`completed-${anime.id}`} anime={anime} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {(newReleaseItems.length === 0 && recentlyAddedItemsForColumn.length === 0 && latestCompletedItemsForColumn.length === 0 && !isLoading) && (
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
          ) : !isLoading ? (
            <div className="bg-card/50 rounded-lg p-4 shadow-md h-full flex items-center justify-center">
              <p className="text-muted-foreground">Top anime list couldn't be loaded.</p>
            </div>
          ) : null }
        </aside>
      </div>
    </div>
  );
}
