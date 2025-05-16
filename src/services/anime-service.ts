'use server';

import axios from 'axios';
import type { AnimeSearchResult, AnimeInfo, Episode, StreamingLinks } from '@/types/anime';

const CONSUMET_API_URL = process.env.CONSUMET_API_URL || 'https://api.consumet.org';
const ANIME_PROVIDER = '9anime'; // Using 9anime provider

// Generic error handler
const handleError = (error: any, context: string): never => {
  console.error(`Error in ${context}:`, error.response?.data || error.message);
  throw new Error(`Failed to fetch data from ${context}. ${error.message}`);
};

export async function searchAnime(query: string, page: number = 1): Promise<{ currentPage: number, hasNextPage: boolean, results: AnimeSearchResult[] }> {
  try {
    const { data } = await axios.get(`${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/${encodeURIComponent(query)}`, {
      params: { page },
    });
    // Adapt data if necessary, e.g., mapping 'image' to 'coverImage' if needed by components
    // For now, assuming components will use 'image' directly or types are aligned.
    return data;
  } catch (error) {
    return handleError(error, `searchAnime (query: ${query})`);
  }
}

export async function getAnimeInfo(id: string): Promise<AnimeInfo | null> {
  try {
    const { data } = await axios.get(`${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/info/${id}`);
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0 && !(data instanceof Array))) {
        // Consumet API sometimes returns empty object {} for not found instead of 404
        return null;
    }
    return data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; // Explicitly return null for 404s
    }
    // Consumet API might return {} for not found, which axios might not throw as error if status is 200
    // The check above handles empty object, this handles actual network/server errors
    return handleError(error, `getAnimeInfo (id: ${id})`);
  }
}

export async function getEpisodeStreamingLinks(episodeId: string, server: string = 'vidstreaming'): Promise<StreamingLinks | null> {
  // Available servers: "vidcloud", "streamsb", "vidstreaming", "streamtape"
  // vidstreaming is often a reliable default.
  try {
    const { data } = await axios.get(`${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/watch/${episodeId}`, {
      params: { server },
    });
    return data;
  } catch (error: any) {
     if (error.response && error.response.status === 404) {
      return null; 
    }
    return handleError(error, `getEpisodeStreamingLinks (episodeId: ${episodeId}, server: ${server})`);
  }
}

// Helper functions for fetching specific lists, similar to old mock data structure
// These will use the searchAnime function with predefined queries.
// Note: The quality of "trending" or "popular" results depends heavily on the search query effectiveness.
export async function getTrendingAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  // Using a generic query that might fetch recent/popular shows.
  // Consumet's 9anime search doesn't have specific "trending" filters.
  // We can try searching for a recent year or a popular genre.
  // For demonstration, let's search for "new season".
  const data = await searchAnime('top rated', page);
  return data.results.slice(0, 8); // Limiting to 8 for display
}

export async function getPopularAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  // Using a generic query for popular shows.
  const data = await searchAnime('most popular', page);
  return data.results.slice(0, 8); // Limiting to 8 for display
}
