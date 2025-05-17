
'use server';

import axios from 'axios';
import type { AnimeSearchResult, AnimeInfo, Episode, StreamingLinks, SubtitleTrack } from '@/types/anime';

const API_BASE_URL = 'https://animefreestream.vercel.app';
const ZORO_PROVIDER_PATH = '/anime/zoro';

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
        try {
          const parsedJson = JSON.parse(responseData);
          responseData = JSON.stringify(parsedJson, null, 2);
          if (responseData.length > 1000) {
             responseData = responseData.substring(0, 1000) + "... [Truncated JSON]";
          }
        } catch (e) {
          responseData = responseData.substring(0, 500) + (responseData.length > 500 ? '... [Truncated String]' : '');
        }
      }
    } else if (typeof responseData === 'object' && responseData !== null) {
      try {
        responseData = JSON.stringify(responseData, null, 2);
         if (responseData.length > 1000) { 
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
  const context = 'searchAnime (Zoro)';
  const requestUrl = `${API_BASE_URL}${ZORO_PROVIDER_PATH}/${encodeURIComponent(query)}`;
  
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

export async function getTrendingAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  const context = 'getTrendingAnimeList (Zoro /top-airing)';
  const requestUrl = `${API_BASE_URL}${ZORO_PROVIDER_PATH}/top-airing`;
  console.log(`[anime-service] ${context}: Fetching page ${page} from ${requestUrl}.`);
  try {
    const { data } = await axios.get(requestUrl, { params: { page } });
    if (data && Array.isArray(data.results)) {
      return (data.results || []) as AnimeSearchResult[];
    } else if (data && Array.isArray(data)) { // Some Consumet endpoints might return array directly
        return (data || []) as AnimeSearchResult[];
    }
     else {
      console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Data:`, data);
      return [];
    }
  } catch (error: any) {
    logApiError(error, context, requestUrl, { page });
    return [];
  }
}

export async function getPopularAnimeList(page: number = 1): Promise<AnimeSearchResult[]> {
  const context = 'getPopularAnimeList (Zoro /most-popular)';
  const requestUrl = `${API_BASE_URL}${ZORO_PROVIDER_PATH}/most-popular`;
  console.log(`[anime-service] ${context}: Fetching page ${page} from ${requestUrl}.`);
  try {
    const { data } = await axios.get(requestUrl, { params: { page } });
     if (data && Array.isArray(data.results)) {
      return (data.results || []) as AnimeSearchResult[];
    } else if (data && Array.isArray(data)) {
        return (data || []) as AnimeSearchResult[];
    }
     else {
      console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Data:`, data);
      return [];
    }
  } catch (error: any) {
    logApiError(error, context, requestUrl, { page });
    return [];
  }
}

export async function getRecentEpisodesList(page: number = 1): Promise<AnimeSearchResult[]> {
  const context = 'getRecentEpisodesList (Zoro /recent-episodes)';
  const requestUrl = `${API_BASE_URL}${ZORO_PROVIDER_PATH}/recent-episodes`;
  console.log(`[anime-service] ${context}: Fetching page ${page} from ${requestUrl}.`);
  try {
    const { data } = await axios.get(requestUrl, { params: { page } });
    // Assuming the structure is similar to search results or popular/trending
    if (data && Array.isArray(data.results)) {
      return (data.results || []) as AnimeSearchResult[];
    } else if (data && Array.isArray(data)) { // Fallback if it's a direct array
        return (data || []) as AnimeSearchResult[];
    } else {
      console.warn(`[anime-service] ${context}: Unexpected data structure from ${requestUrl}. Data:`, data);
      return [];
    }
  } catch (error: any) {
    logApiError(error, context, requestUrl, { page });
    return [];
  }
}
