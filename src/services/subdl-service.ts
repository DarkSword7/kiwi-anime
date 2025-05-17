
'use server';

import axios from 'axios';

const SUBDL_API_URL = 'https://api.subdl.com/api/v1/subtitles';
// It's better to load this from environment variables in a real app
// For now, using the one provided or from process.env
const SUBDL_API_KEY = process.env.SUBDL_API_KEY || 'toP2K8S9koJt_N-xwa0vGFO9lLVATI-y';

interface SubdlSubtitleDetail {
  language: string; // e.g., "English"
  url: string; // download URL
  release_name?: string;
  uploader?: string;
  fps?: number;
  // Add other fields as needed based on actual API response
}

export interface SubdlApiResult {
  status: boolean;
  results: any[]; // Film match results
  subtitles: SubdlSubtitleDetail[];
}

export interface SubdlFormattedResult {
  langName: string;
  downloadUrl: string;
  releaseName?: string;
}

export async function searchSubdlSubtitles(
  animeTitle: string,
  episodeNumber?: number, // SubDL might not use this directly in the initial query
  seasonNumber?: number,  // Same as above
  languages: string = "en" // Comma-separated language codes e.g., "en,es"
): Promise<SubdlFormattedResult[]> {

  if (!SUBDL_API_KEY) {
    console.warn('[subdl-service] SUBDL_API_KEY is not set. SubDL search will be skipped.');
    return [];
  }

  const requestPayload = {
    query: {
      api_key: SUBDL_API_KEY,
      film_name: animeTitle,
      type: "tv", // Assuming anime series are best matched as "tv"
      languages: languages,
      // SubDL's basic query doesn't seem to take episode/season.
      // It might be a two-step process: 1. find film_id, 2. get episode subtitles.
      // For now, we are fetching all subtitles for the film_name.
    }
  };

  if (seasonNumber) {
    // @ts-ignore // Add season if provided, though API docs unclear on this exact field for query
    requestPayload.query.season_number = seasonNumber;
  }
  if (episodeNumber) {
    // @ts-ignore // Add episode if provided, though API docs unclear on this exact field for query
    requestPayload.query.episode_number = episodeNumber;
  }


  console.log('[subdl-service] Searching SubDL with payload:', JSON.stringify(requestPayload, null, 2));

  try {
    const { data } = await axios.post<SubdlApiResult>(SUBDL_API_URL, requestPayload);
    
    console.log('[subdl-service] Raw results from SubDL:', JSON.stringify(data, null, 2));

    if (data && data.status && Array.isArray(data.subtitles)) {
      const formattedResults: SubdlFormattedResult[] = data.subtitles.map(sub => ({
        langName: sub.language || 'Unknown Language',
        downloadUrl: sub.url, // Assuming 'url' is the download link
        releaseName: sub.release_name
      }));
      
      // Filter for English if multiple languages were requested but only English is desired for display initially
      // Or implement more sophisticated filtering based on the 'languages' input parameter
      // For now, returning all results from the 'subtitles' array.
      return formattedResults;
    } else {
      console.warn('[subdl-service] SubDL API did not return a successful status or subtitles array:', data);
      return [];
    }

  } catch (error: any) {
    console.error('[subdl-service] Error searching SubDL:', error.response ? error.response.data : error.message);
    return [];
  }
}
