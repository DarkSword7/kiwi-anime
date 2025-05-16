// This file is deprecated as data is now fetched from the Consumet API.
// Kept temporarily to avoid breaking imports if any exist, but should be removed.
import type { Anime, AnimeSearchResult } from '@/types/anime';

export const mockAnimeData: Anime[] = []; // Empty array

export const getAnimeById = (id: string): Anime | undefined => {
  console.warn("getAnimeById from mock-anime.ts is deprecated. Use API service.");
  return undefined;
};

export const getTrendingAnime = (): AnimeSearchResult[] => {
  console.warn("getTrendingAnime from mock-anime.ts is deprecated. Use API service.");
  return [];
};

export const getPopularAnime = (): AnimeSearchResult[] => {
  console.warn("getPopularAnime from mock-anime.ts is deprecated. Use API service.");
  return [];
};
