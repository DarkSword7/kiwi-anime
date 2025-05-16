
'use server';

import axios from 'axios';
import type { AnimeSearchResult, AnimeInfo, Episode, StreamingLinks } from '@/types/anime';

const API_BASE_URL = 'https://animefreestream.vercel.app'; // Changed to new self-hosted URL

// Centralized error logging for API calls
const logApiError = (error: any, context: string, requestUrl: string, queryParams?: object) => {
  let message = `[anime-service] Error in ${context} requesting ${requestUrl}`;
  if (queryParams) {
    message += ` with params: ${JSON.stringify(queryParams)}`;
  }

  if (error.response) {
    let responseDataString: string;
    const rawData = error.response.data;

    if (typeof rawData === 'string') {
      if (rawData.trim().startsWith('<!DOCTYPE html>') || rawData.trim().startsWith('<html')) {
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
        // Handle potential circular structures in non-HTML object responses
        responseDataString = '[Unserializable Object Response]';
      }
    } else if (rawData === undefined) {
        responseDataString = '[No Response Data (undefined)]';
    } else {
        responseDataString = `[Unexpected Response Data Type: ${typeof rawData}]`;
    }
    console.error(`${message}. Status: ${error.response.status}, Data: ${responseDataString}`);
  } else if (error.request) {
    console.error(`${message}. No response received. Code: ${error.code || 'N/A'}, Message: ${error.message}`);
  } else {
    console.error(`${message}. Error:`, error.message);
  }
};

export async function searchAnime(query: string, page: number = 1): Promise<{ currentPage: number, hasNextPage: boolean, results: AnimeSearchResult[] }> {
  const context = 'searchAnime';
  // Assuming the new API uses the query directly in the path like Gogoanime provider
  const requestUrl = `${API_BASE_URL}/${encodeURIComponent(query)}`;
  
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
  // Assuming the new API uses /info/:id like Gogoanime provider
  const requestUrl = `${API_BASE_URL}/info/${id}`;

  console.log(`[anime-service] ${context}: Requesting URL: ${requestUrl}`);

  try {
    const { data } = await axios.get(requestUrl);

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0 && !(data instanceof Array))) {
      console.warn(`[anime-service] ${context}: No data or empty object received from ${requestUrl}.`);
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
    logApiError(error, context, requestUrl, { id });
    return null;
  }
}

export async function getEpisodeStreamingLinks(episodeId: string, server: string = 'vidstreaming'): Promise<StreamingLinks | null> {
  const context = 'getEpisodeStreamingLinks';
  // Assuming the new API uses /watch/:episodeId like Gogoanime provider
  const requestUrl = `${API_BASE_URL}/watch/${episodeId}`;

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
  const context = 'getTrendingAnimeList (using /top-airing)';
  // Assuming the new API uses /top-airing like Gogoanime provider
  const requestUrl = `${API_BASE_URL}/top-airing`;
  console.log(`[anime-service] ${context}: Fetching page ${page} from ${requestUrl}.`);
  
  try {
    const { data } = await axios.get(requestUrl, { params: { page } });
    if (data && Array.isArray(data.results)) {
      return (data.results || []).slice(0, 8) as AnimeSearchResult[];
    } else if (Array.isArray(data)) { // Some APIs might return array directly
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
  const context = 'getPopularAnimeList (using /popular)';
  // Assuming the new API uses /popular like Gogoanime provider
  const requestUrl = `${API_BASE_URL}/popular`;
  console.log(`[anime-service] ${context}: Fetching page ${page} from ${requestUrl}.`);

  try {
    const { data } = await axios.get(requestUrl, { params: { page } });
    if (data && Array.isArray(data.results)) {
      return (data.results || []).slice(0, 8) as AnimeSearchResult[];
    } else if (Array.isArray(data)) { // Some APIs might return array directly
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
