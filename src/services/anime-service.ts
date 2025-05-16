
'use server';

import axios from 'axios';
import type { AnimeSearchResult, AnimeInfo, Episode, StreamingLinks } from '@/types/anime';

const CONSUMET_API_URL = process.env.CONSUMET_API_URL || 'https://api.consumet.org';
const ANIME_PROVIDER = '9anime'; // Using 9anime provider

// Centralized error logging for API calls
const logApiError = (error: any, context: string, queryParams?: object) => {
  let message = `Error in ${context}`;
  if (queryParams) {
    message += ` with params: ${JSON.stringify(queryParams)}`;
  }
  console.error(message, error.response?.data || error.message);
};

export async function searchAnime(query: string, page: number = 1): Promise<{ currentPage: number, hasNextPage: boolean, results: AnimeSearchResult[] }> {
  const context = 'searchAnime';
  try {
    const { data } = await axios.get(`${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/${encodeURIComponent(query)}`, {
      params: { page },
    });

    // Validate the received data structure
    if (typeof data === 'object' && data !== null && Array.isArray(data.results)) {
      return {
        currentPage: Number(data.currentPage) || page,
        hasNextPage: Boolean(data.hasNextPage),
        results: data.results as AnimeSearchResult[],
      };
    } else {
      console.warn(`Unexpected data structure from ${context} (query: ${query}, page: ${page}):`, data);
      return { currentPage: page, hasNextPage: false, results: [] };
    }
  } catch (error: any) {
    logApiError(error, context, { query, page });
    return { currentPage: page, hasNextPage: false, results: [] }; // Default return on error
  }
}

export async function getAnimeInfo(id: string): Promise<AnimeInfo | null> {
  const context = 'getAnimeInfo';
  try {
    const { data } = await axios.get(`${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/info/${id}`);

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0 && !(data instanceof Array))) {
      // Consumet API sometimes returns empty object {} for not found
      return null;
    }

    // Basic validation for expected structure
    if (typeof data.id !== 'string' || typeof data.title !== 'string') {
        console.warn(`Unexpected data structure from ${context} (id: ${id}): Missing id or title. Data:`, data);
        return null;
    }
    
    // Ensure episodes is an array, default to empty if not present or not an array
    const episodes = Array.isArray(data.episodes) ? data.episodes : [];

    return {
        ...data,
        episodes,
    } as AnimeInfo;
  } catch (error: any) {
    // Log 404s differently or just let it return null
    if (error.response && error.response.status === 404) {
      // This is an expected "not found" scenario
      return null;
    }
    logApiError(error, context, { id });
    return null; // Default return on any other error
  }
}

export async function getEpisodeStreamingLinks(episodeId: string, server: string = 'vidstreaming'): Promise<StreamingLinks | null> {
  const context = 'getEpisodeStreamingLinks';
  try {
    const { data } = await axios.get(`${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/watch/${episodeId}`, {
      params: { server },
    });

    // Validate structure
    if (typeof data === 'object' && data !== null && Array.isArray(data.sources)) {
        const validSources = data.sources.filter((s: any) => typeof s.url === 'string' && s.url.trim() !== '');
        
        // It's possible to get sources but none are valid (e.g. empty URLs)
        // We return the structure but with potentially empty validSources
        return {
            headers: data.headers || {}, // Ensure headers object exists
            sources: validSources,
            download: data.download,
        } as StreamingLinks;
    } else {
        console.warn(`Unexpected data structure from ${context} (episodeId: ${episodeId}, server: ${server}):`, data);
        return null;
    }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; 
    }
    logApiError(error, context, { episodeId, server });
    return null; // Default return on error
  }
}

export async function getTrendingAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  // Using a generic query that might fetch recent/popular shows.
  // Consumet's 9anime search doesn't have specific "trending" filters.
  const searchResults = await searchAnime('top rated', page); // Query "top rated"
  return searchResults.results.slice(0, 8); // Limiting to 8 for display
}

export async function getPopularAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  // Using a generic query for popular shows.
  const searchResults = await searchAnime('most popular', page); // Query "most popular"
  return searchResults.results.slice(0, 8); // Limiting to 8 for display
}
