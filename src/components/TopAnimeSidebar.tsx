
"use client";

import type { AnimeSearchResult } from '@/types/anime';
import { TopAnimeSidebarItem } from './TopAnimeSidebarItem';
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';

interface TopAnimeSidebarProps {
  animeList: AnimeSearchResult[];
}

export function TopAnimeSidebar({ animeList }: TopAnimeSidebarProps) {
  if (!animeList || animeList.length === 0) {
    return <p className="text-muted-foreground text-sm p-4">No top anime to display.</p>;
  }

  // For now, filter buttons are static
  const filters = ["Day", "Week", "Month"];
  const activeFilter = "Day"; // Static for now

  return (
    <div className="bg-card/50 rounded-lg p-4 shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
          <ListFilter className="w-5 h-5 mr-2 text-primary" /> Top Anime
        </h2>
        {/* Static Filter Buttons */}
        <div className="flex space-x-1">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'ghost'}
              size="sm"
              className={`px-2.5 py-1 text-xs h-auto ${activeFilter === filter ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'}`}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2 overflow-y-auto flex-grow pr-1 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
        {animeList.map((anime, index) => (
          <TopAnimeSidebarItem key={anime.id} anime={anime} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}
