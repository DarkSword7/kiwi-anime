
"use client";

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { MediaPlayer, MediaProvider, type MediaProviderAdapter } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import type { HlsProvider } from '@vidstack/react/providers/hls'; // Import HlsProvider type
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
} from "@/components/ui/select"

// Props for the default export (Page component)
interface WatchPageServerProps {
  params: {
    episodeId: string;
  };
}

// Props for the client component WatchPageContent
interface WatchPageContentProps {
  episodeId: string; 
}

const CORS_PROXY_URL = 'https://cors.consumet.stream/';

// Helper to manage Suspense for searchParams
function WatchPageContent({ episodeId: episodeIdFromParams }: WatchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const animeId = searchParams.get('animeId');
  const currentEpNumber = parseInt(searchParams.get('epNum') || '0', 10);

  const [streamingInfo, setStreamingInfo] = useState<StreamingLinks | null>(null);
  const [animeDetails, setAnimeDetails] = useState<AnimeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<string>('vidstreaming'); 
  const [selectedQuality, setSelectedQuality] = useState<string | undefined>(undefined);
  const [hlsProviderInstance, setHlsProviderInstance] = useState<HlsProvider | null>(null);


  const availableServers = ["vidstreaming", "vidcloud", "streamsb", "streamtape"]; 

  console.log(`[WatchPageContent] Initializing for episodeId: ${episodeIdFromParams}, animeId: ${animeId}`);
   if (!episodeIdFromParams) {
      console.warn("[WatchPageContent] Initialization aborted: episodeIdFromParams is missing.");
  }

  useEffect(() => {
    async function fetchData() {
      console.log(`[WatchPageContent] fetchData triggered. episodeId: ${episodeIdFromParams}, selectedServer: ${selectedServer}`);
      if (!episodeIdFromParams) {
          setError("Episode ID is missing.");
          setIsLoading(false);
          console.warn("[WatchPageContent] fetchData aborted: episodeIdFromParams is missing.");
          return;
      }
      setIsLoading(true);
      setError(null);
      setStreamingInfo(null); 
      setSelectedQuality(undefined); 

      try {
        const links = await getEpisodeStreamingLinks(episodeIdFromParams, selectedServer); 
        console.log("[WatchPageContent] API getEpisodeStreamingLinks response:", JSON.stringify(links, null, 2));

        if (links && links.sources && links.sources.length > 0) {
          setStreamingInfo(links);
          const defaultQualitySource = links.sources.find(s => s.quality?.toLowerCase() === 'default' || s.quality?.toLowerCase() === 'auto' || s.quality?.toLowerCase().includes('auto'));
          const firstSource = links.sources[0];
          const qualityToSet = defaultQualitySource?.quality || firstSource?.quality;
          setSelectedQuality(qualityToSet);
          console.log("[WatchPageContent] Streaming links found. Sources count:", links.sources.length, "Selected quality set to:", qualityToSet);
          if (links.headers) {
            console.log("[WatchPageContent] Headers received from API:", links.headers);
          }
        } else {
          const errorMsg = `No streaming links found for this episode on server '${selectedServer}'. This could be due to the episode not being available, or an API issue. Try another server.`;
          setError(errorMsg);
          setStreamingInfo(null);
          console.warn("[WatchPageContent] No streaming links found or sources array is empty. Error set:", errorMsg);
        }

        if (animeId) {
          console.log("[WatchPageContent] Fetching anime details for animeId:", animeId);
          const details = await getAnimeInfo(animeId);
          setAnimeDetails(details);
          console.log("[WatchPageContent] Fetched anime details:", JSON.stringify(details, null, 2));
        }

      } catch (e: any) {
        console.error("[WatchPageContent] Error in fetchData:", e);
        setError(e.message || "Could not load video information. Please try again or select a different server.");
        setStreamingInfo(null);
      } finally {
        setIsLoading(false);
        console.log("[WatchPageContent] fetchData finished. isLoading set to false.");
      }
    }
    fetchData();
  }, [episodeIdFromParams, animeId, selectedServer]); 

  const currentSource = useMemo(() => {
    if (!streamingInfo || !streamingInfo.sources || streamingInfo.sources.length === 0) {
      return undefined;
    }
    const source = streamingInfo.sources.find(s => s.quality === selectedQuality) || streamingInfo.sources[0];
    console.log("[WatchPageContent] currentSource derived:", JSON.stringify(source, null, 2), "from selectedQuality:", selectedQuality);
    return source;
  }, [streamingInfo, selectedQuality]);

  const playerSrcUrl = useMemo(() => {
    if (!currentSource?.url) return undefined;

    let url = currentSource.url;
    // Apply CORS proxy if it's an http/https URL and not already proxied or from a known-good local/API domain
    if (url.startsWith('http') && !url.includes('consumet.stream/') && !url.includes('animefreestream.vercel.app/')) {
        const fullUrl = new URL(url); 
        url = `${CORS_PROXY_URL}${fullUrl.protocol}//${fullUrl.host}${fullUrl.pathname}${fullUrl.search}${fullUrl.hash}`;
        console.log("[WatchPageContent] Using CORS proxied URL for player manifest:", url);
    } else {
        console.log("[WatchPageContent] Using original URL for player manifest (not proxying):", url);
    }
    return url;
  }, [currentSource]);

  useEffect(() => {
    if (hlsProviderInstance && streamingInfo?.headers && currentSource?.isM3U8) {
      const apiHeaders = { ...streamingInfo.headers };
      // Remove null/undefined headers and filter for common ones if necessary
      Object.keys(apiHeaders).forEach(key => {
        if (apiHeaders[key] == null) {
          delete apiHeaders[key];
        }
      });

      if (Object.keys(apiHeaders).length > 0) {
        console.log('[WatchPageContent] Configuring HLS provider with custom headers:', apiHeaders);
        hlsProviderInstance.config = {
          ...hlsProviderInstance.config, // Preserve existing HLS config
          xhrSetup: (xhr: XMLHttpRequest, url: string) => {
            console.log(`[WatchPageContent] HLS xhrSetup for ${url}. Applying headers:`, apiHeaders);
            for (const headerKey in apiHeaders) {
              // Ensure headerKey is a valid property of apiHeaders
              if (Object.prototype.hasOwnProperty.call(apiHeaders, headerKey) && apiHeaders[headerKey]) {
                 xhr.setRequestHeader(headerKey, apiHeaders[headerKey] as string);
              }
            }
          }
        };
      }
    }
  }, [hlsProviderInstance, streamingInfo, currentSource]);


  const handleServerChange = (newServer: string) => {
    console.log("[WatchPageContent] Server changed to:", newServer);
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
      router.push(`/watch/${targetEpisode.id}?animeId=${animeId}&epNum=${targetEpisode.number}`);
    }
  };
  
  const hasPrevEpisode = currentEpNumber > 1 && animeDetails?.episodes?.some(ep => ep.number === currentEpNumber - 1);
  const hasNextEpisode = animeDetails?.episodes?.some(ep => ep.number === currentEpNumber + 1);


  if (isLoading && !streamingInfo) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Loading episode...</p>
        {animeDetails && <p className="text-lg mt-2">{animeDetails.title} - Episode {currentEpNumber}</p>}
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
          Episode {currentEpNumber || (episodeIdFromParams ? episodeIdFromParams.split('-').pop() : '')}
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
        {streamingInfo && streamingInfo.sources.length > 1 && (
           <div className="flex items-center gap-2">
           <span className="text-sm font-medium">Quality:</span>
            <Select 
                value={selectedQuality || streamingInfo.sources[0]?.quality || 'default'} 
                onValueChange={setSelectedQuality}
                disabled={isLoading || !streamingInfo || streamingInfo.sources.length === 0}
            >
                <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Quality"/>
                </SelectTrigger>
                <SelectContent>
                    {streamingInfo.sources.map(source => (
                        <SelectItem key={source.quality || 'default'} value={source.quality || 'default'}>
                            {source.quality || 'Default'} {source.isM3U8 ? '(HLS)' : '(MP4)'}
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
          crossOrigin
          playsInline
          onProviderChange={(event) => {
            const provider = event.detail;
            if (provider?.type === 'hls') {
              console.log("[WatchPageContent] HLS provider initialized/changed.");
              setHlsProviderInstance(provider as HlsProvider);
            } else {
              setHlsProviderInstance(null);
            }
          }}
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      )}
      
      {!error && !playerSrcUrl && !isLoading && (
         <div className="my-6 p-6 bg-muted rounded-md text-center">
            <p className="text-muted-foreground">Video source not available. Please try a different server or check back later.</p>
         </div>
      )}
       {isLoading && !playerSrcUrl && !streamingInfo && !error && ( 
         <div className="my-6 p-6 bg-muted rounded-md text-center flex flex-col items-center justify-center aspect-video">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
            <p className="text-muted-foreground">Fetching new video source...</p>
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

      {episodeIdFromParams && !animeId && ( 
          <p className="mt-4 text-sm text-muted-foreground">Additional anime details could not be loaded.</p>
      )}
    </div>
  );
}


export default function WatchPage({ params }: WatchPageServerProps) {
  const episodeIdFromRoute = params.episodeId;
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Loading episode information...</p>
      </div>
    }>
      <WatchPageContent episodeId={episodeIdFromRoute} />
    </Suspense>
  );
}

