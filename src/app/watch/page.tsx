
"use client";

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { MediaPlayer, MediaProvider, type MediaProviderAdapter } from '@vidstack/react';
import { type HLSProvider } from '@vidstack/react/providers/hls';
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

// const CIPHERTV_CORS_PROXY_URL = 'https://proxys.ciphertv.dev/proxy?url='; // Keep for video if needed

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
            console.log("[WatchPageContent] Subtitles received from API:", JSON.stringify(links.subtitles));
          } else {
            console.log("[WatchPageContent] No subtitles received from API.");
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
    // No proxy for manifest for now, relying on kwikie.ru to have open CORS for manifest if possible
    // If video segments need proxy, HLS config will handle that.
    // If manifest itself needs proxy and current one fails, a different proxy solution is needed.
    console.log("[WatchPageContent] Using direct URL for player manifest (no proxy):", url);
    return url;
  }, [currentSource]);


  const hlsConfig = useMemo(() => {
    if (currentSource?.isM3U8 && streamingInfo?.headers && Object.keys(streamingInfo.headers).length > 0) {
      const apiHeaders = { ...streamingInfo.headers };
      Object.keys(apiHeaders).forEach((key) => {
        if (apiHeaders[key] == null || apiHeaders[key] === '') delete apiHeaders[key];
      });

      if (Object.keys(apiHeaders).length > 0) {
        console.log('[WatchPageContent] Preparing HLS config with custom headers:', JSON.stringify(apiHeaders));
        return {
          xhrSetup: (xhr: XMLHttpRequest, requestUrl: string) => {
            console.log(`[HLS xhrSetup via hlsConfig prop for ${requestUrl}] Applying headers:`, JSON.stringify(apiHeaders));
            for (const headerKey in apiHeaders) {
              if (Object.prototype.hasOwnProperty.call(apiHeaders, headerKey) && apiHeaders[headerKey]) {
                xhr.setRequestHeader(headerKey, apiHeaders[headerKey] as string);
              }
            }
          }
        };
      }
    }
    console.log('[WatchPageContent] No custom HLS config prepared (no headers or not M3U8).');
    return undefined; // Return undefined if no custom config is needed
  }, [streamingInfo, currentSource]);


  const handleServerChange = (newServer: string) => {
    console.log("[WatchPageContent] Server changed to:", newServer);
    setHlsProvider(null); // Reset HLS provider to ensure re-initialization if necessary
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
      setHlsProvider(null); // Reset HLS provider
      router.push(`/watch?ep=${encodeURIComponent(targetEpisode.id)}&animeId=${animeId}&epNum=${targetEpisode.number}`);
    }
  };
  
  const hasPrevEpisode = currentEpNumber > 1 && animeDetails?.episodes?.some(ep => ep.number === currentEpNumber - 1);
  const hasNextEpisode = animeDetails?.episodes?.some(ep => ep.number === currentEpNumber + 1);

  const getLangCode = (langLabel: string): string => {
    if (!langLabel) return 'und'; 
    const lowerLangLabel = langLabel.toLowerCase().trim();
    const langMap: { [key: string]: string } = {
      "english": "en", "spanish": "es", "español": "es",
      "german": "de", "deutsch": "de",
      "french": "fr", "français": "fr",
      "portuguese (brazilian)": "pt-BR", "portuguese": "pt", "português": "pt",
      "arabic": "ar", "russian": "ru", "italian": "it",
      "japanese": "ja", "default": "en",
      // Add more mappings as needed
    };
    if (langMap[lowerLangLabel]) return langMap[lowerLangLabel];
    if (lowerLangLabel.length === 2 || (lowerLangLabel.length === 5 && lowerLangLabel[2] === '-')) return lowerLangLabel; 
    console.warn(`[WatchPageContent] Unknown langLabel for getLangCode: '${langLabel}', falling back to 'und'.`);
    return 'und'; // Undetermined
  };

  // Attempting direct load for subtitles; proxying VTTs can be problematic.
  // The VTT server (e.g., s.megastatics.com) needs to have correct CORS headers.
  const getSubtitleUrl = (originalUrl: string): string => {
    console.log("[WatchPageContent] Using direct URL for subtitle:", originalUrl);
    return originalUrl;
  };
  
  const defaultTrackSrcLang = useMemo(() => {
    if (!streamingInfo?.subtitles || streamingInfo.subtitles.length === 0) return null;
    
    const apiDefault = streamingInfo.subtitles.find(s => s.default === true);
    if (apiDefault) return getLangCode(apiDefault.lang);

    const firstEnglish = streamingInfo.subtitles.find(s => s.lang.toLowerCase().includes('english'));
    if (firstEnglish) return getLangCode(firstEnglish.lang);
    
    console.log("[WatchPageContent] No default or English subtitle track found, defaulting to first available track's language:", streamingInfo.subtitles[0].lang);
    return getLangCode(streamingInfo.subtitles[0].lang); 
  }, [streamingInfo?.subtitles]);


  if (!episodeIdFromQuery && !isLoading) { 
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
  
  if (isLoading && (!streamingInfo || !playerSrcUrl)) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Loading episode data...</p>
        {animeId && <p className="text-lg mt-2">Anime ID: {animeId} - Episode {currentEpNumber || 'N/A'}</p>}
        <p className="text-sm text-muted-foreground">Server: {selectedServer}</p>
      </div>
    );
  }
  
  console.log("[WatchPageContent] About to render MediaPlayer. streamingInfo?.subtitles:", streamingInfo?.subtitles);

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
          Episode {currentEpNumber || (episodeIdFromQuery ? episodeIdFromQuery.split('-').pop() : '')}
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
        {streamingInfo && streamingInfo.sources.length > 0 && ( 
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
          crossOrigin // For video if needed, and also for text tracks if loaded from different origin
          playsInline
          hlsConfig={hlsConfig} // Apply HLS config directly
          onTextTracksChange={(tracks, event) => { // Vidstack event for when text tracks change
            console.log('[Vidstack] TextTracksChange:', tracks.map(t => ({label: t.label, language: t.language, mode: t.mode, kind: t.kind, id: t.id, src: t.src })));
          }}
          onTextTrackChange={(track, event) => { // Vidstack event for when the selected text track changes
            console.log('[Vidstack] TextTrackChange (selected):', track ? {label: track.label, language: track.language, mode: track.mode, kind: track.kind, id: track.id, src: track.src } : null);
          }}
        >
          <MediaProvider />
          {streamingInfo?.subtitles?.map((sub) => {
            const trackSrcLang = getLangCode(sub.lang);
            const subtitleUrl = getSubtitleUrl(sub.url); // Get direct URL
            console.log(`[WatchPageContent] Rendering track: lang=${sub.lang}, srcLang=${trackSrcLang}, default=${trackSrcLang === defaultTrackSrcLang}, url=${subtitleUrl}`);
            return (
              <track
                key={subtitleUrl + sub.lang} 
                src={subtitleUrl}
                kind="subtitles"
                label={sub.lang}
                srcLang={trackSrcLang}
                default={trackSrcLang === defaultTrackSrcLang}
                crossOrigin="anonymous" // Important for fetching VTT from different origins
              />
            );
          })}
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      )}
      
      {!error && !playerSrcUrl && !isLoading && ( 
         <div className="my-6 p-6 bg-muted rounded-md text-center aspect-video flex items-center justify-center">
            <p className="text-muted-foreground">Video source not available for the selected server/quality. Please try a different option or check back later.</p>
         </div>
      )}
       {isLoading && playerSrcUrl && ( 
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

      {episodeIdFromQuery && !animeId && ( 
          <p className="mt-4 text-sm text-muted-foreground">Additional anime details could not be loaded (animeId missing).</p>
      )}
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

