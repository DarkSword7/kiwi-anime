
'use server';

import axios from 'axios';
import type { AnimeSearchResult, AnimeInfo, Episode, StreamingLinks } from '@/types/anime';

const API_BASE_URL = 'https://animefreestream.vercel.app';
const ANIMEPAHE_PROVIDER_PATH = '/anime/animepahe';

// Centralized error logging for API calls
const logApiError = (error: any, context: string, requestUrl: string, queryParams?: object) => {
  let message = `[anime-service] Error in ${context} requesting ${requestUrl}`;
  if (queryParams) {
    message += ` with params: ${JSON.stringify(queryParams)}`;
  }

  if (error.response) {
    let responseData: any = error.response.data;
    if (typeof responseData === 'string') {
      if (responseData.trim().startsWith('<!DOCTYPE html>') || responseData.trim().startsWith('<html')) {
        responseData = '[HTML Response - Truncated]';
      } else {
        // Truncate very long strings that aren't clearly HTML
        responseData = responseData.substring(0, 500) + (responseData.length > 500 ? '... [Truncated]' : '');
      }
    } else if (typeof responseData === 'object' && responseData !== null) {
      // Attempt to stringify, but catch circular structure errors
      try {
        responseData = JSON.stringify(responseData, null, 2);
         if (responseData.length > 1000) { // Further truncate if stringified JSON is too long
            responseData = responseData.substring(0, 1000) + "... [Truncated JSON]";
        }
      } catch (e: any) {
        if (e.message.includes('circular structure')) {
          responseData = '[Circular Structure in JSON Response]';
        } else {
          responseData = '[Unserializable Object Response]';
        }
      }
    } else if (responseData === undefined) {
        responseData = '[No Response Data (undefined)]';
    } else {
        responseData = `[Unexpected Response Data Type: ${typeof responseData}]`;
    }
    console.error(`${message}. Status: ${error.response.status}, Data:`, responseData);
  } else if (error.request) {
    console.error(`${message}. No response received. Code: ${error.code || 'N/A'}, Message: ${error.message}`);
  } else {
    console.error(`${message}. Error:`, error.message);
  }
};

export async function searchAnime(query: string, page: number = 1): Promise<{ currentPage: number, hasNextPage: boolean, results: AnimeSearchResult[] }> {
  const context = 'searchAnime (AnimePahe)';
  const requestUrl = `${API_BASE_URL}${ANIMEPAHE_PROVIDER_PATH}/${encodeURIComponent(query)}`;
  
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
  const context = 'getAnimeInfo (AnimePahe)';
  // Changed: id is now a path parameter
  const requestUrl = `${API_BASE_URL}${ANIMEPAHE_PROVIDER_PATH}/info/${encodeURIComponent(id)}`;

  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}`);

  try {
    // Changed: no query params needed for id here
    const { data } = await axios.get(requestUrl);

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0 && !(data instanceof Array))) {
      console.warn(`[anime-service] ${context}: No data or empty object received from ${requestUrl} for id ${id}.`);
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
        if (!id && !(data.id)) return null; 
    }
    
    const episodes = Array.isArray(data.episodes) ? data.episodes : [];
    
    return {
        ...data,
        id: String(data.id || id), 
        title: title,
        episodes,
    } as AnimeInfo;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      console.log(`[anime-service] ${context}: Anime with ID ${id} not found (404) at ${requestUrl}.`);
      return null;
    }
    logApiError(error, context, requestUrl, { id_in_path: id }); // Logged id as id_in_path to differentiate
    return null;
  }
}

export async function getEpisodeStreamingLinks(episodeId: string, server: string = 'vidstreaming'): Promise<StreamingLinks | null> {
  const context = 'getEpisodeStreamingLinks (AnimePahe)';
  const requestUrl = `${API_BASE_URL}${ANIMEPAHE_PROVIDER_PATH}/watch`;

  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}, Params:`, { episodeId, server });
  
  try {
    const { data } = await axios.get(requestUrl, {
      params: { episodeId, server },
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
  const context = `getTrendingAnimeList (AnimePahe via search)`;
  console.log(`[anime-service] ${context}: Fetching page ${page} by searching for "top airing".`);
  try {
    const searchData = await searchAnime("top airing", page);
    if (searchData && Array.isArray(searchData.results)) {
      return (searchData.results || []).slice(0, 8) as AnimeSearchResult[];
    } else {
      console.warn(`[anime-service] ${context}: Unexpected data structure from search. Data:`, searchData);
      return [];
    }
  } catch (error: any) {
    console.error(`[anime-service] Error in ${context}:`, error.message);
    return [];
  }
}

export async function getPopularAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  const context = `getPopularAnimeList (AnimePahe via search)`;
  console.log(`[anime-service] ${context}: Fetching page ${page} by searching for "popular".`);
  try {
    const searchData = await searchAnime("popular", page);
     if (searchData && Array.isArray(searchData.results)) {
      return (searchData.results || []).slice(0, 8) as AnimeSearchResult[];
    } else {
      console.warn(`[anime-service] ${context}: Unexpected data structure from search. Data:`, searchData);
      return [];
    }
  } catch (error: any) {
    console.error(`[anime-service] Error in ${context}:`, error.message);
    return [];
  }
}
