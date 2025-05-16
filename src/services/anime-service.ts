
'use server';

import axios from 'axios';
import type { AnimeSearchResult, AnimeInfo, Episode, StreamingLinks } from '@/types/anime';

const CONSUMET_API_URL = process.env.CONSUMET_API_URL || 'https://api.consumet.org';
const ANIME_PROVIDER = '9anime'; // Using 9anime provider
// const CORS_PROXY_PREFIX = 'https://cors.consumet.stream/'; // Removed due to ENOTFOUND issues

// Centralized error logging for API calls
const logApiError = (error: any, context: string, requestUrl: string, queryParams?: object) => {
  let message = `[anime-service] Error in ${context} requesting ${requestUrl}`;
  if (queryParams) {
    message += ` with params: ${JSON.stringify(queryParams)}`;
  }
  // Check for axios error structure
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`${message}. Status: ${error.response.status}, Data:`, error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    // Avoid logging error.request directly due to circular structures
    console.error(`${message}. No response received. Code: ${error.code || 'N/A'}, Message: ${error.message}`);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error(`${message}. Error:`, error.message);
  }
};

export async function searchAnime(query: string, page: number = 1): Promise<{ currentPage: number, hasNextPage: boolean, results: AnimeSearchResult[] }> {
  const context = 'searchAnime';
  const requestUrl = `${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/${encodeURIComponent(query)}`;
  
  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}, Params:`, { page });

  try {
    const { data } = await axios.get(requestUrl, {
      params: { page },
    });

    if (typeof data === 'object' && data !== null && Array.isArray(data.results)) {
      return {
        currentPage: Number(data.currentPage) || page,
        hasNextPage: Boolean(data.hasNextPage),
        results: (data.results || []) as AnimeSearchResult[],
      };
    } else {
      console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Data:`, data);
      return { currentPage: page, hasNextPage: false, results: [] };
    }
  } catch (error: any) {
    logApiError(error, context, requestUrl, { query, page });
    return { currentPage: page, hasNextPage: false, results: [] };
  }
}

export async function getAnimeInfo(id: string): Promise<AnimeInfo | null> {
  const context = 'getAnimeInfo';
  const requestUrl = `${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/info/${id}`;

  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}`);

  try {
    const { data } = await axios.get(requestUrl);

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0 && !(data instanceof Array))) {
      console.warn(`[anime-service] ${context}: No data or empty object received from ${requestUrl}.`);
      return null;
    }
    
    if (typeof data.id !== 'string' || typeof data.title !== 'string') {
        console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Missing id or title. Data:`, data);
        return null;
    }
    
    const episodes = Array.isArray(data.episodes) ? data.episodes : [];

    return {
        ...data,
        episodes,
    } as AnimeInfo;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      console.log(`[anime-service] ${context}: Anime with ID ${id} not found (404) at ${requestUrl}.`);
      return null;
    }
    logApiError(error, context, requestUrl, { id });
    return null;
  }
}

export async function getEpisodeStreamingLinks(episodeId: string, server: string = 'vidstreaming'): Promise<StreamingLinks | null> {
  const context = 'getEpisodeStreamingLinks';
  const requestUrl = `${CONSUMET_API_URL}/anime/${ANIME_PROVIDER}/watch/${episodeId}`;

  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}, Params:`, { server });
  
  try {
    const { data } = await axios.get(requestUrl, {
      params: { server },
    });

    if (typeof data === 'object' && data !== null && Array.isArray(data.sources)) {
        const validSources = (data.sources || []).filter((s: any) => typeof s.url === 'string' && s.url.trim() !== '');
        
        return {
            headers: data.headers || {},
            sources: validSources,
            download: data.download,
        } as StreamingLinks;
    } else {
        console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Data:`, data);
        return null;
    }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      console.log(`[anime-service] ${context}: Episode ${episodeId} on server ${server} not found (404) at ${requestUrl}.`);
      return null; 
    }
    logApiError(error, context, requestUrl, { episodeId, server });
    return null;
  }
}

export async function getTrendingAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  const context = 'getTrendingAnimeList';
  console.log(`[anime-service] ${context}: Fetching page ${page}.`);
  const searchResults = await searchAnime('top rated', page);
  return (searchResults.results || []).slice(0, 8); 
}

export async function getPopularAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  const context = 'getPopularAnimeList';
  console.log(`[anime-service] ${context}: Fetching page ${page}.`);
  const searchResults = await searchAnime('most popular', page);
  return (searchResults.results || []).slice(0, 8);
}
