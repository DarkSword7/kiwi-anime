
'use server';

import type { AnimeSearchResult, AnimeInfo, StreamingLinks, SubtitleTrack } from '@/types/anime';
import axios from 'axios';

const API_BASE_URL = 'https://animefreestream.vercel.app';
const ZORO_PROVIDER_PATH = '/anime/zoro';

// Centralized error logging for API calls
const logApiError = (error: any, context: string, requestUrl: string, queryParams?: object) => {
  let message = `[anime-service] Error in ${context} requesting ${requestUrl}`;
  if (queryParams) {
    message += ` with params: ${JSON.stringify(queryParams)}`;
  }

  if (axios.isAxiosError(error) && error.response) {
    let responseData: any = error.response.data;
    // Check if responseData is HTML
    if (typeof responseData === 'string' && responseData.trim().startsWith('<!DOCTYPE html>')) {
      responseData = '[HTML Response - Truncated]';
    } else if (typeof responseData === 'string') {
      // Attempt to parse if it might be stringified JSON, otherwise truncate
      try {
        const parsedJson = JSON.parse(responseData);
        responseData = JSON.stringify(parsedJson, null, 2); // Pretty print for better readability
        if (responseData.length > 1000) { // Truncate very long JSON strings
          responseData = responseData.substring(0, 1000) + "... [Truncated JSON]";
        }
      } catch (e) {
        // Not JSON, just a string, truncate if too long
        responseData = responseData.substring(0, 500) + (responseData.length > 500 ? '... [Truncated String]' : '');
      }
    } else if (typeof responseData === 'object' && responseData !== null) {
      // Already an object, try to stringify for logging, truncate if too long
      try {
        responseData = JSON.stringify(responseData, null, 2);
        if (responseData.length > 1000) {
          responseData = responseData.substring(0, 1000) + "... [Truncated JSON Object]";
        }
      } catch (e: any) {
         // Handle circular structures or other stringification errors
        if (e.message && e.message.includes('circular structure')) {
          responseData = '[Circular Structure in JSON Response]';
        } else {
          responseData = '[Unserializable Object Response]';
        }
      }
    } else if (responseData === undefined || responseData === null) {
        responseData = '[No Response Data (undefined/null)]';
    } else {
        responseData = `[Unexpected Response Data Type: ${typeof responseData}]`;
    }
    console.error(`${message}. Status: ${error.response.status}, Data:`, responseData);
  } else if (axios.isAxiosError(error) && error.request) {
    console.error(`${message}. No response received. Code: ${error.code || 'N/A'}, Message: ${error.message}`);
  } else {
    console.error(`${message}. Error:`, error instanceof Error ? error.message : String(error));
  }
};

interface PaginatedAnimeResults {
  currentPage: number;
  hasNextPage: boolean;
  results: AnimeSearchResult[];
}

export async function searchAnime(query: string, page: number = 1): Promise<PaginatedAnimeResults> {
  const context = 'searchAnime (Zoro)';
  const requestUrl = `${API_BASE_URL}${ZORO_PROVIDER_PATH}/${encodeURIComponent(query)}`;
  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}, Query Params:`, { page });

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
    logApiError(error, context, requestUrl, { query_in_path: query, page });
    return { currentPage: page, hasNextPage: false, results: [] };
  }
}

export async function getAnimeInfo(animeId: string): Promise<AnimeInfo | null> {
  const context = 'getAnimeInfo (Zoro)';
  const requestUrl = `${API_BASE_URL}${ZORO_PROVIDER_PATH}/info`;
  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}, Query Params:`, { id: animeId });

  try {
    const { data } = await axios.get(requestUrl, { params: { id: animeId } });

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0 && !(data instanceof Array))) {
      console.warn(`[anime-service] ${context}: No data or empty object received from ${requestUrl} for id ${animeId}.`);
      return null;
    }
    
    let title = 'Unknown Title';
    if (data.title && typeof data.title === 'string') {
        title = data.title;
    } else if (data.title && typeof data.title.romaji === 'string') {
        title = data.title.romaji;
    } else if (data.title && typeof data.title.english === 'string') {
        title = data.title.english;
    } else if (data.title && typeof data.title.native === 'string') {
        title = data.title.native;
    }

    if (typeof data.id !== 'string' && typeof data.id !== 'number') {
        console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Missing or invalid id. Data:`, data);
        if (!animeId && !(data.id)) return null; 
    }
    
    const episodes = Array.isArray(data.episodes) ? data.episodes.map((ep: any) => ({...ep, id: String(ep.id)})) : [];
    
    return {
        ...data,
        id: String(data.id || animeId), 
        title: title,
        episodes,
    } as AnimeInfo;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      console.log(`[anime-service] ${context}: Anime with ID ${animeId} not found (404) at ${requestUrl}.`);
      return null;
    }
    logApiError(error, context, requestUrl, { id: animeId });
    return null;
  }
}

export async function getEpisodeStreamingLinks(episodeId: string, server: string = 'vidcloud'): Promise<StreamingLinks | null> {
  const context = 'getEpisodeStreamingLinks (Zoro)';
  const requestUrl = `${API_BASE_URL}${ZORO_PROVIDER_PATH}/watch/${encodeURIComponent(episodeId)}`; 
  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}, Query Params:`, { server });
  
  try {
    const { data } = await axios.get(requestUrl, {
      params: { server },
    });

    if (typeof data === 'object' && data !== null && Array.isArray(data.sources)) {
        const validSources = (data.sources || []).filter((s: any) => typeof s.url === 'string' && s.url.trim() !== '');
        const subtitles = (data.subtitles || []).filter((sub: any) => typeof sub.url === 'string' && sub.url.trim() !== '' && typeof sub.lang === 'string') as SubtitleTrack[];
        
        return {
            headers: data.headers || {},
            sources: validSources,
            subtitles: subtitles,
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
    logApiError(error, context, requestUrl, { episodeId_in_path: episodeId, server });
    return null;
  }
}

async function fetchPaginatedAnimeList(endpoint: string, page: number = 1, context: string): Promise<PaginatedAnimeResults> {
  const requestUrl = `${API_BASE_URL}${ZORO_PROVIDER_PATH}${endpoint}`;
  console.log(`[anime-service] ${context}: Fetching page ${page} from ${requestUrl}.`);
  try {
    const { data } = await axios.get(requestUrl, { params: { page } });
    if (data && Array.isArray(data.results)) {
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
    logApiError(error, context, requestUrl, { page });
    return { currentPage: page, hasNextPage: false, results: [] };
  }
}


export async function getTrendingAnimeList(page: number = 1): Promise<PaginatedAnimeResults> {
  return fetchPaginatedAnimeList('/top-airing', page, 'getTrendingAnimeList (Zoro /top-airing)');
}

export async function getPopularAnimeList(page: number = 1): Promise<PaginatedAnimeResults> {
  return fetchPaginatedAnimeList('/most-popular', page, 'getPopularAnimeList (Zoro /most-popular)');
}

export async function getRecentEpisodesList(page: number = 1): Promise<PaginatedAnimeResults> {
 return fetchPaginatedAnimeList('/recent-episodes', page, 'getRecentEpisodesList (Zoro /recent-episodes)');
}

export async function getLatestCompletedAnimeList(page: number = 1): Promise<PaginatedAnimeResults> {
 return fetchPaginatedAnimeList('/latest-completed', page, 'getLatestCompletedAnimeList (Zoro /latest-completed)');
}

export async function getRecentlyAddedAnimeList(page: number = 1): Promise<PaginatedAnimeResults> {
  return fetchPaginatedAnimeList('/recent-added', page, 'getRecentlyAddedAnimeList (Zoro /recent-added)');
}
