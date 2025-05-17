
"use client";

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import type { HlsProvider } from '@vidstack/react/providers/hls';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { getEpisodeStreamingLinks, getAnimeInfo } from '@/services/anime-service';
import type { StreamingLinks, AnimeInfo, StreamingSource } from '@/types/anime';
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

const CORS_PROXY_URL = 'https://cors.consumet.stream/';

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
  const [hlsProviderInstance, setHlsProviderInstance] = useState<HlsProvider | null>(null);

  const availableServers = ["vidstreaming", "vidcloud", "streamsb", "streamtape"]; // Confirm these are valid for AnimePahe via Consumet

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
      setStreamingInfo(null); // Reset streaming info
      setSelectedQuality(undefined); // Reset quality
      setHlsProviderInstance(null); // Reset HLS provider instance

      try {
        const links = await getEpisodeStreamingLinks(episodeIdFromQuery, selectedServer);
        console.log("[WatchPageContent] API getEpisodeStreamingLinks response:", JSON.stringify(links, null, 2));

        if (links && links.sources && links.sources.length > 0) {
          setStreamingInfo(links);
          // Prioritize "default" or "auto" quality, then the first available.
          const defaultQualitySource = links.sources.find(s => 
            s.quality?.toLowerCase() === 'default' || 
            s.quality?.toLowerCase() === 'auto' ||
            s.quality?.toLowerCase().includes('auto') // More flexible check for "auto"
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
    if (episodeIdFromQuery) { // Only fetch if episodeId is present
        fetchData();
    } else {
        setIsLoading(false); // Not loading if no episodeId
    }
  }, [episodeIdFromQuery, animeId, selectedServer]);


  const currentSource = useMemo(() => {
    if (!streamingInfo || !streamingInfo.sources || streamingInfo.sources.length === 0) {
      console.log("[WatchPageContent] currentSource derived: undefined (no streamingInfo or sources)");
      return undefined;
    }
    // If selectedQuality is set, find it. Otherwise, default to the first source.
    const source = selectedQuality 
                 ? streamingInfo.sources.find(s => s.quality === selectedQuality) 
                 : streamingInfo.sources[0];
    
    // If selectedQuality was specific but not found, fallback to the first source
    const finalSource = source || streamingInfo.sources[0];

    console.log("[WatchPageContent] currentSource derived. Selected quality:", selectedQuality, "Found source:", JSON.stringify(finalSource, null, 2));
    return finalSource;
  }, [streamingInfo, selectedQuality]);
  
  const playerSrcUrl = useMemo(() => {
    if (!currentSource?.url) {
      console.log("[WatchPageContent] playerSrcUrl derived: undefined (no currentSource.url)");
      return undefined;
    }

    let url = currentSource.url;
    // Apply CORS proxy if it's an http/https URL and not already proxied or from our own API.
    // animefreestream.vercel.app is the API, not necessarily the video host.
    // URLs from places like vault-10.padorupado.ru should be proxied if they don't have CORS.
    if (url.startsWith('http') && !url.includes('consumet.stream/')) {
        // Avoid proxying if it's a data URI or blob URL, though unlikely from API
        if (!url.startsWith('data:') && !url.startsWith('blob:')) {
            const fullUrl = new URL(url); 
            // Check if the original host is our API host. If so, maybe don't proxy.
            // However, if the API returns an external video URL, it *should* be proxied.
            // For now, let's assume any external HTTP/HTTPS URL not already proxied might need it.
            url = `${CORS_PROXY_URL}${fullUrl.protocol}//${fullUrl.host}${fullUrl.pathname}${fullUrl.search}${fullUrl.hash}`;
            console.log("[WatchPageContent] Using CORS proxied URL for player manifest:", url);
        } else {
             console.log("[WatchPageContent] Using original URL (data/blob) for player manifest:", url);
        }
    } else {
        console.log("[WatchPageContent] Using original URL for player manifest (already proxied or not HTTP):", url);
    }
    return url;
  }, [currentSource]);


  useEffect(() => {
    console.log("[WatchPageContent] HLS Effect Triggered. hlsProviderInstance:", hlsProviderInstance ? "Exists" : "null", "streamingInfo.headers:", streamingInfo?.headers ? JSON.stringify(streamingInfo.headers) : "null", "currentSource.isM3U8:", currentSource?.isM3U8);
    if (hlsProviderInstance && streamingInfo?.headers && currentSource?.isM3U8) {
      const apiHeaders = { ...streamingInfo.headers };
      
      Object.keys(apiHeaders).forEach(key => {
        if (apiHeaders[key] == null) { // Catch null or undefined
          delete apiHeaders[key];
        }
      });

      if (Object.keys(apiHeaders).length > 0) {
        console.log('[WatchPageContent] Attempting to configure HLS provider with custom headers:', JSON.stringify(apiHeaders));
        
        // Ensure config object exists before assigning to its properties
        if (!hlsProviderInstance.config) {
          hlsProviderInstance.config = {};
        }
        
        hlsProviderInstance.config.xhrSetup = (xhr: XMLHttpRequest, requestUrl: string) => {
          console.log(`[WatchPageContent] HLS xhrSetup for URL: ${requestUrl}. Applying headers:`, JSON.stringify(apiHeaders));
          for (const headerKey in apiHeaders) {
            if (Object.prototype.hasOwnProperty.call(apiHeaders, headerKey) && apiHeaders[headerKey]) {
               xhr.setRequestHeader(headerKey, apiHeaders[headerKey] as string);
               console.log(`[WatchPageContent] HLS xhrSetup: Set header '${headerKey}': '${apiHeaders[headerKey]}'`);
            }
          }
        };
        console.log('[WatchPageContent] HLS provider xhrSetup configured.');
      } else {
        console.log('[WatchPageContent] No valid custom headers found in streamingInfo.headers to apply.');
        // If there were previous headers, we might want to clear xhrSetup
        if (hlsProviderInstance.config?.xhrSetup) {
            console.log('[WatchPageContent] Clearing previous HLS xhrSetup.');
            delete hlsProviderInstance.config.xhrSetup;
        }
      }
    } else if (hlsProviderInstance && hlsProviderInstance.config?.xhrSetup) {
        // If conditions are no longer met (e.g., not M3U8, no headers), clear existing xhrSetup
        console.log('[WatchPageContent] Conditions for HLS custom headers not met. Clearing previous HLS xhrSetup if any.');
        delete hlsProviderInstance.config.xhrSetup;
    }
  }, [hlsProviderInstance, streamingInfo, currentSource]); // Dependencies: hlsProviderInstance, streamingInfo (for headers), currentSource (for isM3U8)

  const handleServerChange = (newServer: string) => {
    console.log("[WatchPageContent] Server changed to:", newServer);
    setSelectedServer(newServer);
    // Data refetch will be triggered by useEffect due to selectedServer change
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
      router.push(`/watch?ep=${encodeURIComponent(targetEpisode.id)}&animeId=${animeId}&epNum=${targetEpisode.number}`);
    }
  };
  
  const hasPrevEpisode = currentEpNumber > 1 && animeDetails?.episodes?.some(ep => ep.number === currentEpNumber - 1);
  const hasNextEpisode = animeDetails?.episodes?.some(ep => ep.number === currentEpNumber + 1);

  if (!episodeIdFromQuery && !isLoading) { // If there's no episode ID in query and not loading something else
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
  
  // Initial loading state or when actively fetching and no data yet
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
        {streamingInfo && streamingInfo.sources.length > 0 && ( // Show quality selector only if sources exist
           <div className="flex items-center gap-2">
           <span className="text-sm font-medium">Quality:</span>
            <Select 
                value={selectedQuality || streamingInfo.sources[0]?.quality || 'default'} 
                onValueChange={setSelectedQuality}
                disabled={isLoading || !streamingInfo || streamingInfo.sources.length === 0}
            >
                <SelectTrigger className="w-[180px] h-9"> {/* Increased width for longer quality strings */}
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
          key={playerSrcUrl} // Re-mounts player when src changes, crucial for some updates
          title={`${animeDetails?.title || 'Episode'} ${currentEpNumber}`}
          src={{ src: playerSrcUrl, type: currentSource.isM3U8 ? 'application/x-mpegurl' : 'video/mp4' }}
          className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-black"
          crossOrigin // Important for fetching from different origins
          playsInline
          onProviderChange={(event) => {
            if (event && event.detail) {
              const provider = event.detail;
              if (provider?.type === 'hls') {
                console.log("[WatchPageContent] HLS provider instance obtained from onProviderChange:", provider);
                setHlsProviderInstance(provider as HlsProvider);
              } else {
                console.log("[WatchPageContent] Non-HLS provider or null from onProviderChange:", provider);
                setHlsProviderInstance(null); // Clear if not HLS or provider is removed
              }
            } else {
              console.warn("[WatchPageContent] onProviderChange event or event.detail is null/undefined.");
              setHlsProviderInstance(null);
            }
          }}
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      )}
      
      {!error && !playerSrcUrl && !isLoading && ( // No error, not loading, but no player URL (e.g. no sources)
         <div className="my-6 p-6 bg-muted rounded-md text-center aspect-video flex items-center justify-center">
            <p className="text-muted-foreground">Video source not available for the selected server/quality. Please try a different option or check back later.</p>
         </div>
      )}
      {/* This covers the case where isLoading is true, but playerSrcUrl *is* set (e.g. changing quality while playing)
          This might be redundant with the main isLoading block if playerSrcUrl is cleared during loading.
          If the player is already visible and we are just changing quality, it might show its own spinner.
      */}
       {isLoading && playerSrcUrl && ( // Loading new quality/source, but previous source was valid
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
    // Suspense boundary for useSearchParams used in WatchPageContent
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

