
'use server';

import axios from 'axios';
import type { AnimeSearchResult, AnimeInfo, Episode, StreamingLinks } from '@/types/anime';

const AVALYNN_API_URL = 'https://avalynn.vercel.app';

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
    let responseDataString: string;
    const rawData = error.response.data;

    if (typeof rawData === 'string') {
      if (rawData.trim().startsWith('<!DOCTYPE html>')) {
        responseDataString = '[HTML Response - Truncated]';
      } else {
        responseDataString = rawData.substring(0, 500); // Log first 500 chars
        if (rawData.length > 500) {
          responseDataString += '... [Truncated]';
        }
      }
    } else if (typeof rawData === 'object' && rawData !== null) {
      try {
        responseDataString = JSON.stringify(rawData, null, 2);
      } catch (e) {
        responseDataString = '[Unserializable Object Response]';
      }
    } else if (rawData === undefined) {
        responseDataString = '[No Response Data (undefined)]';
    } else {
        responseDataString = `[Unexpected Response Data Type: ${typeof rawData}]`;
    }
    console.error(`${message}. Status: ${error.response.status}, Data: ${responseDataString}`);
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
  const requestUrl = `${AVALYNN_API_URL}/${encodeURIComponent(query)}`;
  
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
  const requestUrl = `${AVALYNN_API_URL}/info/${id}`;

  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}`);

  try {
    const { data } = await axios.get(requestUrl);

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0 && !(data instanceof Array))) {
      console.warn(`[anime-service] ${context}: No data or empty object received from ${requestUrl}.`);
      return null;
    }
    
    // Ensure title is properly extracted even if it's nested
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


    if (typeof data.id !== 'string' && typeof data.id !== 'number') { // ID can sometimes be a number from anilist
        console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Missing or invalid id. Data:`, data);
        // Allow proceeding if title is present, using provided id if possible or a placeholder
        if (!id && !(data.id)) return null; 
    }
    
    const episodes = Array.isArray(data.episodes) ? data.episodes : [];
    
    return {
        ...data,
        id: String(data.id || id), // Ensure id is a string
        title: title,
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
  const requestUrl = `${AVALYNN_API_URL}/watch/${episodeId}`;

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
  const context = 'getTrendingAnimeList (now /top-airing)';
  const requestUrl = `${AVALYNN_API_URL}/top-airing`;
  console.log(`[anime-service] ${context}: Fetching page ${page} from ${requestUrl}.`);
  
  try {
    const { data } = await axios.get(requestUrl, { params: { page } });
    if (data && Array.isArray(data.results)) {
      return (data.results || []).slice(0, 8) as AnimeSearchResult[];
    } else if (Array.isArray(data)) { 
      return (data || []).slice(0, 8) as AnimeSearchResult[];
    } else {
      console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Data:`, data);
      return [];
    }
  } catch (error: any) {
    logApiError(error, context, requestUrl, { page });
    return [];
  }
}

export async function getPopularAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  const context = 'getPopularAnimeList (now /popular)';
  const requestUrl = `${AVALYNN_API_URL}/popular`;
  console.log(`[anime-service] ${context}: Fetching page ${page} from ${requestUrl}.`);

  try {
    const { data } = await axios.get(requestUrl, { params: { page } });
    if (data && Array.isArray(data.results)) {
      return (data.results || []).slice(0, 8) as AnimeSearchResult[];
    } else if (Array.isArray(data)) { 
      return (data || []).slice(0, 8) as AnimeSearchResult[];
    } else {
      console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Data:`, data);
      return [];
    }
  } catch (error: any) {
    logApiError(error, context, requestUrl, { page });
    return [];
  }
}
