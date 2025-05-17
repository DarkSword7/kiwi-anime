
"use client";

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { MediaPlayer, MediaProvider, type MediaProviderAdapter, type HLSProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { getEpisodeStreamingLinks, getAnimeInfo } from '@/services/anime-service';
import type { StreamingLinks, AnimeInfo, StreamingSource, SubtitleTrack } from '@/types/anime';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Tv, SkipBack, SkipForward } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CIPHERTV_CORS_PROXY_URL = 'https://proxys.ciphertv.dev/proxy?url=';

interface WatchPageContentProps {
  // No episodeId prop needed here, will be fetched from searchParams
}

function WatchPageContent({}: WatchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const episodeIdFromQuery = searchParams.get('ep');
  const animeId = searchParams.get('animeId');
  const currentEpNumber = parseInt(searchParams.get('epNum') || '0', 10);

  const [streamingInfo, setStreamingInfo] = useState<StreamingLinks | null>(null);
  const [animeDetails, setAnimeDetails] = useState<AnimeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<string>('vidstreaming'); 
  const [selectedQuality, setSelectedQuality] = useState<string | undefined>(undefined);
  const [hlsProvider, setHlsProvider] = useState<HLSProvider | null>(null);


  const availableServers = ["vidstreaming", "vidcloud", "streamsb", "streamtape", "animepahe"]; 

  console.log(`[WatchPageContent] Initializing. episodeIdFromQuery: ${episodeIdFromQuery}, animeId: ${animeId}, selectedServer: ${selectedServer}`);
  if (!episodeIdFromQuery) {
    console.warn("[WatchPageContent] Initialization: episodeIdFromQuery is missing from URL.");
  }

  useEffect(() => {
    async function fetchData() {
      console.log(`[WatchPageContent] fetchData triggered. episodeId: ${episodeIdFromQuery}, server: ${selectedServer}`);
      if (!episodeIdFromQuery) {
        setError("Episode ID is missing from URL.");
        setIsLoading(false);
        console.warn("[WatchPageContent] fetchData aborted: episodeIdFromQuery is missing.");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setStreamingInfo(null); 
      setSelectedQuality(undefined);
      setHlsProvider(null);

      try {
        const links = await getEpisodeStreamingLinks(episodeIdFromQuery, selectedServer);
        console.log("[WatchPageContent] API getEpisodeStreamingLinks response:", JSON.stringify(links, null, 2));

        if (links && links.sources && links.sources.length > 0) {
          setStreamingInfo(links);
          const defaultQualitySource = links.sources.find(s => 
            s.quality?.toLowerCase() === 'default' || 
            s.quality?.toLowerCase() === 'auto' ||
            s.quality?.toLowerCase().includes('auto') 
          );
          const firstSource = links.sources[0];
          const qualityToSet = defaultQualitySource?.quality || firstSource?.quality;
          
          setSelectedQuality(qualityToSet);
          console.log("[WatchPageContent] Streaming links found. Sources count:", links.sources.length, "Selected quality set to:", qualityToSet);
          if (links.headers && Object.keys(links.headers).length > 0) {
            console.log("[WatchPageContent] Headers received from API:", JSON.stringify(links.headers));
          } else {
            console.log("[WatchPageContent] No custom headers received from API for this source/server.");
          }
          if (links.subtitles && links.subtitles.length > 0) {
            console.log("[WatchPageContent] API-provided subtitles received:", JSON.stringify(links.subtitles));
          } else {
            console.log("[WatchPageContent] No API-provided subtitles received.");
          }

        } else {
          const errorMsg = `No streaming links found for episode ${episodeIdFromQuery} on server '${selectedServer}'. This could be due to the episode not being available, an API issue, or the server not being supported for this provider. Try another server.`;
          setError(errorMsg);
          setStreamingInfo(null); 
          console.warn("[WatchPageContent] No streaming links found or sources array is empty. Error set:", errorMsg);
        }

        if (animeId) {
          console.log("[WatchPageContent] Fetching anime details for animeId:", animeId);
          const details = await getAnimeInfo(animeId);
          setAnimeDetails(details);
          console.log("[WatchPageContent] Fetched anime details:", details ? `Title: ${details.title}` : "Not found");
        }

      } catch (e: any) {
        console.error("[WatchPageContent] Error in fetchData:", e);
        setError(e.message || `Could not load video information for server '${selectedServer}'. Please try again or select a different server.`);
        setStreamingInfo(null); 
      } finally {
        setIsLoading(false);
        console.log("[WatchPageContent] fetchData finished. isLoading set to false.");
      }
    }
    if (episodeIdFromQuery) { 
        fetchData();
    } else {
        setIsLoading(false); 
    }
  }, [episodeIdFromQuery, animeId, selectedServer]); 


  const currentSource = useMemo(() => {
    if (!streamingInfo || !streamingInfo.sources || streamingInfo.sources.length === 0) {
      console.log("[WatchPageContent] currentSource derived: undefined (no streamingInfo or sources)");
      return undefined;
    }
    
    const sourceByQuality = selectedQuality ? streamingInfo.sources.find(s => s.quality === selectedQuality) : undefined;
    const defaultSource = streamingInfo.sources.find(s => s.quality?.toLowerCase() === 'default' || s.quality?.toLowerCase() === 'auto') || streamingInfo.sources[0];
    
    const finalSource = sourceByQuality || defaultSource;

    console.log("[WatchPageContent] currentSource derived. Selected quality:", selectedQuality, "Found source:", JSON.stringify(finalSource, null, 2));
    return finalSource;
  }, [streamingInfo, selectedQuality]);
  
  const playerSrcUrl = useMemo(() => {
    if (!currentSource?.url) {
      console.log("[WatchPageContent] playerSrcUrl derived: undefined (no currentSource.url)");
      return undefined;
    }

    let url = currentSource.url;
    if (url.startsWith('http') && !url.includes('proxys.ciphertv.dev') && !url.includes('animefreestream.vercel.app/')) {
        try {
            const fullUrl = new URL(url); 
            url = `${CIPHERTV_CORS_PROXY_URL}${encodeURIComponent(fullUrl.toString())}`;
            console.log("[WatchPageContent] Using CORS proxied URL for player manifest:", url);
        } catch (e) {
            console.error("[WatchPageContent] Invalid URL for proxying:", currentSource.url, e);
            // Fallback to original URL if proxying fails (e.g. due to invalid URL)
            return currentSource.url; 
        }
    } else {
        console.log("[WatchPageContent] Using direct URL for player manifest (no proxy or already proxied):", url);
    }
    return url;
  }, [currentSource]);

  useEffect(() => {
    console.log("[WatchPageContent] HLS Effect Triggered. hlsProvider:", hlsProvider, "streamingInfo.headers:", JSON.stringify(streamingInfo?.headers), "currentSource.isM3U8:", currentSource?.isM3U8);
    if (hlsProvider && streamingInfo?.headers && Object.keys(streamingInfo.headers).length > 0 && currentSource?.isM3U8) {
      const safeHeadersToSet: Record<string, string> = {};
      for (const key in streamingInfo.headers) {
        if (Object.prototype.hasOwnProperty.call(streamingInfo.headers, key)) {
          const lowerKey = key.toLowerCase();
          // Browsers block setting 'Referer' and 'User-Agent' from client-side XHR for security reasons
          // Allow other common headers, but be mindful of which ones can actually be set.
          if (lowerKey !== 'referer' && lowerKey !== 'user-agent' && streamingInfo.headers[key]) {
             safeHeadersToSet[key] = streamingInfo.headers[key] as string;
          }
        }
      }

      if (Object.keys(safeHeadersToSet).length > 0) {
        console.log('[WatchPageContent] Configuring HLS provider with custom (safe) headers:', JSON.stringify(safeHeadersToSet));
        if (!hlsProvider.config) {
          hlsProvider.config = {}; // Ensure config object exists
        }
        // Configure xhrSetup
        hlsProvider.config.xhrSetup = (xhr: XMLHttpRequest, requestUrl: string) => {
            console.log(`[WatchPageContent] HLS xhrSetup for ${requestUrl}. Applying headers:`, JSON.stringify(safeHeadersToSet));
            for (const headerKey in safeHeadersToSet) {
              xhr.setRequestHeader(headerKey, safeHeadersToSet[headerKey]);
            }
          };
      } else {
        console.log('[WatchPageContent] No safe API headers to apply to HLS config or only unsafe headers provided.');
        // Clear existing xhrSetup if no new safe headers
        if (hlsProvider.config?.xhrSetup) {
            delete hlsProvider.config.xhrSetup; 
            console.log('[WatchPageContent] Cleared existing HLS xhrSetup as no new safe headers.');
        }
      }
    } else if (hlsProvider && hlsProvider.config?.xhrSetup) {
        // Clear xhrSetup if conditions are not met (e.g., no headers, not M3U8)
        delete hlsProvider.config.xhrSetup;
        console.log('[WatchPageContent] Cleared existing HLS xhrSetup as conditions not met for applying custom headers.');
    } else if (!hlsProvider) {
        // console.log('[WatchPageContent] HLS provider instance is null, cannot configure headers.');
    }
  }, [hlsProvider, streamingInfo, currentSource]);


  const handleServerChange = (newServer: string) => {
    console.log("[WatchPageContent] Server changed to:", newServer);
    setHlsProvider(null); // Reset HLS provider when server changes
    setSelectedServer(newServer);
  };

  const navigateEpisode = (direction: 'next' | 'prev') => {
    if (!animeDetails || !animeDetails.episodes || currentEpNumber === 0) return;
    const currentIndex = animeDetails.episodes.findIndex(ep => ep.number === currentEpNumber);
    let targetEpisode;
    if (direction === 'next' && currentIndex < animeDetails.episodes.length - 1) {
      targetEpisode = animeDetails.episodes[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
      targetEpisode = animeDetails.episodes[currentIndex - 1];
    }

    if (targetEpisode) {
      setHlsProvider(null); // Reset HLS provider on navigation
      router.push(`/watch?ep=${encodeURIComponent(targetEpisode.id)}&animeId=${animeId}&epNum=${targetEpisode.number}`);
    }
  };
  
  const hasPrevEpisode = currentEpNumber > 1 && animeDetails?.episodes?.some(ep => ep.number === currentEpNumber - 1);
  const hasNextEpisode = animeDetails?.episodes?.some(ep => ep.number === currentEpNumber + 1);

  const getLangCode = (langLabel: string): string => {
    if (!langLabel) return 'und'; // Undetermined
    const lowerLangLabel = langLabel.toLowerCase().trim();
    
    // Handle complex labels like "Spanish - CR_Spanish(Latin_America)"
    const primaryLangParts = lowerLangLabel.split(/[\s-(]+/);
    const primaryLang = primaryLangParts[0];
    
    const langMap: { [key: string]: string } = {
      "english": "en", "en": "en", "eng": "en",
      "spanish": "es", "es": "es", "español": "es", "spanish - cr_spanish": "es", "spanish - cr_spanish(latin_america)": "es-LA",
      "german": "de", "de": "de", "deutsch": "de", "german - cr_german": "de",
      "french": "fr", "fr": "fr", "français": "fr", "french - cr_french": "fr",
      "portuguese": "pt", "pt": "pt", "português": "pt", "portuguese - cr_portuguese(brazil)": "pt-BR",
      "arabic": "ar", "ar": "ar", "arabic - cr_arabic": "ar",
      "russian": "ru", "ru": "ru", "russian - cr_russian": "ru",
      "italian": "it", "it": "it", "italian - cr_italian": "it",
      "japanese": "ja", "ja": "ja",
      "indonesian": "id", "id": "id",
      "thai": "th", "th": "th",
      "vietnamese": "vi", "vi": "vi",
      "malay": "ms", "ms": "ms",
      "hindi": "hi", "hi": "hi",
      // Add more mappings as needed
    };

    if (langMap[primaryLang]) return langMap[primaryLang];
    if (langMap[lowerLangLabel]) return langMap[lowerLangLabel]; // Check full label
    
    // Check for ISO 639-1 (2-letter) or ISO 639-2 (3-letter) or common variants
    if (primaryLang.length === 2 || primaryLang.length === 3 || (primaryLang.length === 5 && primaryLang[2] === '-')) {
        return primaryLang;
    }
    
    console.warn(`[WatchPageContent] Unknown langLabel for getLangCode: '${langLabel}', extracted primary: '${primaryLang}', falling back to 'und'.`);
    return 'und'; // Undetermined
  };

  const getDirectSubtitleUrl = (originalUrl: string): string => {
    // Not using proxy for subtitles based on user request.
    console.log("[WatchPageContent] Using direct URL for subtitle:", originalUrl);
    return originalUrl;
  };
  
  const defaultTrackSrcLang = useMemo(() => {
    if (!streamingInfo?.subtitles || streamingInfo.subtitles.length === 0) return null;
    
    // Prioritize API's default track if available
    const apiDefault = streamingInfo.subtitles.find(s => s.default === true);
    if (apiDefault) return getLangCode(apiDefault.lang);

    // Fallback to first English track
    const firstEnglish = streamingInfo.subtitles.find(s => getLangCode(s.lang) === 'en');
    if (firstEnglish) return getLangCode(firstEnglish.lang);
    
    // Fallback to the very first track if no default or English track
    if (streamingInfo.subtitles[0]) {
      console.log("[WatchPageContent] No default or English API-subtitle track found, defaulting to first available track's language:", streamingInfo.subtitles[0].lang);
      return getLangCode(streamingInfo.subtitles[0].lang); 
    }
    return null;
  }, [streamingInfo?.subtitles]);


  if (!episodeIdFromQuery && !isLoading) { // If no episodeId in query and not loading, show error
     return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <Alert variant="destructive" className="my-6 max-w-md">
            <Tv className="h-5 w-5" />
            <AlertTitle>Missing Episode ID</AlertTitle>
            <AlertDescription>
                The episode ID is missing from the URL. Cannot load video. 
                Please navigate from an anime details page.
                <Button asChild variant="link" className="mt-2">
                    <Link href="/">Go to Homepage</Link>
                </Button>
            </AlertDescription>
            </Alert>
        </div>
     );
  }
  
  if (isLoading && (!streamingInfo || !playerSrcUrl)) { // Show loading spinner if fetching initial data
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Loading episode data...</p>
        {animeId && <p className="text-lg mt-2">Anime ID: {animeId} - Episode {currentEpNumber || 'N/A'}</p>}
        <p className="text-sm text-muted-foreground">Server: {selectedServer}</p>
      </div>
    );
  }
  
  console.log("[WatchPageContent] About to render MediaPlayer. API-provided subtitles:", JSON.stringify(streamingInfo?.subtitles, null, 2));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        {animeId && (
          <Button variant="outline" size="sm" asChild className="mb-2 mr-2">
            <Link href={`/anime/${animeId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Anime Details
            </Link>
          </Button>
        )}
         <h1 className="text-2xl md:text-3xl font-bold truncate">
          {animeDetails?.title || 'Anime Episode'}
        </h1>
        <p className="text-lg text-muted-foreground">
          Episode {currentEpNumber || (episodeIdFromQuery ? episodeIdFromQuery.split('$episode$').pop() : '')}
        </p>
      </div>

       <div className="my-4 flex flex-col sm:flex-row justify-between items-center gap-4 p-3 bg-card border rounded-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Server:</span>
          <Select value={selectedServer} onValueChange={handleServerChange} disabled={isLoading}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Select server" />
            </SelectTrigger>
            <SelectContent>
              {availableServers.map(server => (
                <SelectItem key={server} value={server}>{server.charAt(0).toUpperCase() + server.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {streamingInfo && streamingInfo.sources.length > 0 && ( // Ensure sources exist before showing quality select
           <div className="flex items-center gap-2">
           <span className="text-sm font-medium">Quality:</span>
            <Select 
                value={selectedQuality || streamingInfo.sources[0]?.quality || 'default'} 
                onValueChange={setSelectedQuality}
                disabled={isLoading || !streamingInfo || streamingInfo.sources.length === 0}
            >
                <SelectTrigger className="w-[180px] h-9"> 
                    <SelectValue placeholder="Quality"/>
                </SelectTrigger>
                <SelectContent>
                    {streamingInfo.sources.map(source => (
                        <SelectItem key={source.quality || 'default'} value={source.quality || 'default'}>
                            {source.quality || 'Default'} {source.isM3U8 ? '(HLS)' : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            </div>
        )}
         {isLoading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
      </div>

      {error && ( 
        <Alert variant="destructive" className="my-6">
          <Tv className="h-5 w-5" />
          <AlertTitle>Error Loading Video</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && playerSrcUrl && currentSource && (
        <MediaPlayer
          key={playerSrcUrl} 
          title={`${animeDetails?.title || 'Episode'} ${currentEpNumber}`}
          src={{ src: playerSrcUrl, type: currentSource.isM3U8 ? 'application/x-mpegurl' : 'video/mp4' }}
          className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-black"
          crossOrigin // Important for HLS and potentially subtitles
          playsInline
          onProviderChange={(providerAdapter: MediaProviderAdapter | null) => {
            console.log("[WatchPageContent] onProviderChange triggered. Provider type:", providerAdapter?.type);
            if (providerAdapter?.type === 'hls') {
                console.log("[WatchPageContent] HLS provider instance obtained:", providerAdapter);
                setHlsProvider(providerAdapter as HLSProvider);
            } else {
                 console.log("[WatchPageContent] Non-HLS provider or null provider. Clearing HLS instance.");
                setHlsProvider(null);
            }
          }}
          onTextTracksChange={(tracks, event) => { 
            console.log('[Vidstack] TextTracksChange:', tracks.map(t => ({label: t.label, language: t.language, mode: t.mode, kind: t.kind, id: t.id, src: t.src ? 'src_present' : 'src_missing_or_empty' })));
          }}
          onTextTrackChange={(track, event) => { 
            console.log('[Vidstack] TextTrackChange (selected):', track ? {label: track.label, language: track.language, mode: track.mode, kind: track.kind, id: track.id, src: track.src ? 'src_present' : 'src_missing_or_empty' } : null);
          }}
        >
          <MediaProvider />
          {/* API-provided Subtitles */}
          {streamingInfo?.subtitles?.map((sub) => {
            const trackSrcLang = getLangCode(sub.lang);
            const subtitleUrl = getDirectSubtitleUrl(sub.url); // Use direct URL
            console.log(`[WatchPageContent] Rendering track: lang=${sub.lang}, srcLang=${trackSrcLang}, default=${trackSrcLang === defaultTrackSrcLang}, originalUrl=${sub.url}, directUrl=${subtitleUrl}`);
            return (
              <track
                key={sub.url} // Use URL as key, or a combination if URLs aren't unique
                src={subtitleUrl}
                kind="subtitles"
                label={sub.lang}
                srcLang={trackSrcLang}
                default={trackSrcLang === defaultTrackSrcLang}
                crossOrigin="anonymous" // Crucial for loading external VTT files
              />
            );
          })}
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      )}
      
      {!error && !playerSrcUrl && !isLoading && ( // If no error, not loading, but no playerSrcUrl (e.g. API returned no sources)
         <div className="my-6 p-6 bg-muted rounded-md text-center aspect-video flex items-center justify-center">
            <p className="text-muted-foreground">Video source not available for the selected server/quality. Please try a different option or check back later.</p>
         </div>
      )}

       {isLoading && playerSrcUrl && ( // If loading a new source (e.g., after server change) but playerSrcUrl is set from previous
         <div className="my-6 p-6 bg-black rounded-md text-center flex flex-col items-center justify-center aspect-video">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
            <p className="text-white/70">Fetching new video source...</p>
         </div>
       )}


      {animeDetails && (
        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigateEpisode('prev')} disabled={!hasPrevEpisode || isLoading}>
            <SkipBack className="w-4 h-4 mr-2" /> Previous Ep
          </Button>
          <Button variant="outline" onClick={() => navigateEpisode('next')} disabled={!hasNextEpisode || isLoading}>
            Next Ep <SkipForward className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {episodeIdFromQuery && !animeId && ( // If episodeId is present but no animeId (shouldn't happen with current nav)
          <p className="mt-4 text-sm text-muted-foreground">Additional anime details could not be loaded (animeId missing).</p>
      )}

      {/* Removed SubDL Section */}
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Loading episode information...</p>
      </div>
    }>
      <WatchPageContent />
    </Suspense>
  );
}

