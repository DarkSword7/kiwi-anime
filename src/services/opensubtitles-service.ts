
'use server';

import OpenSubtitles from 'opensubtitles-api';
import type { SubtitleTrack } from '@/types/anime';

// Initialize OpenSubtitles API client
// IMPORTANT: Set these environment variables in your .env.local file
const OS_API_KEY = process.env.OPENSUBTITLES_API_KEY;
const OS_USER_AGENT = process.env.OPENSUBTITLES_USER_AGENT || 'AniWaveLite/1.0';

interface OpenSubtitleInfo {
  lang: string;
  langName: string;
  url: string; // This is typically a download link for the subtitle file (often .srt)
  score?: number;
  filename?: string;
  [key: string]: any; // Allow other properties
}

export interface OpenSubtitlesResult {
  lang: string;
  langName: string;
  downloadUrl: string;
  filename?: string;
  score?: number;
}

export async function searchOpenSubtitles(
  query: string,
  episodeNumber?: number,
  seasonNumber?: number // Season number might be hard to get reliably for anime
): Promise<OpenSubtitlesResult[]> {

  if (!OS_API_KEY) {
    console.warn('[opensubtitles-service] OPENSUBTITLES_API_KEY is not set. OpenSubtitles search will be skipped.');
    return [];
  }
  
  const osClient = new OpenSubtitles({
    useragent: OS_USER_AGENT,
    apikey: OS_API_KEY, // For the new API
    ssl: true,
  });

  const searchOptions: any = {
    query: query,
    limit: 'best', // Get the best matches
  };

  if (episodeNumber !== undefined) {
    searchOptions.episode = episodeNumber;
  }
  if (seasonNumber !== undefined) {
    searchOptions.season = seasonNumber;
  }

  console.log('[opensubtitles-service] Searching OpenSubtitles with options:', searchOptions);

  try {
    // The opensubtitles-api package returns an object where keys are language codes
    const resultsByLang: { [langCode: string]: OpenSubtitleInfo[] | OpenSubtitleInfo } = await osClient.search(searchOptions);
    
    console.log('[opensubtitles-service] Raw results from OpenSubtitles:', JSON.stringify(resultsByLang, null, 2));

    const allSubtitles: OpenSubtitlesResult[] = [];

    for (const langCode in resultsByLang) {
      if (Object.prototype.hasOwnProperty.call(resultsByLang, langCode)) {
        const langResults = resultsByLang[langCode];
        const resultsArray = Array.isArray(langResults) ? langResults : [langResults]; // Ensure it's an array

        resultsArray.forEach((sub: OpenSubtitleInfo) => {
          if (sub && sub.url) { // Check if sub and sub.url are defined
            allSubtitles.push({
              lang: langCode,
              langName: sub.langName || langCode,
              downloadUrl: sub.url, // This is a download URL, not a direct VTT link
              filename: sub.filename,
              score: sub.score,
            });
          }
        });
      }
    }
    
    // Sort by score if available, descending
    allSubtitles.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    console.log('[opensubtitles-service] Processed subtitles:', allSubtitles);
    return allSubtitles.slice(0, 10); // Return top 10 results
  } catch (error: any) {
    console.error('[opensubtitles-service] Error searching OpenSubtitles:', error.message || error);
    if (error.message && error.message.includes('401 Unauthorized')) {
        console.error('[opensubtitles-service] OpenSubtitles API Key might be invalid or missing.');
    }
    if (error.message && error.message.includes('429 Too Many Requests')) {
        console.error('[opensubtitles-service] OpenSubtitles API rate limit hit. Please wait and try again.');
    }
    return [];
  }
}
