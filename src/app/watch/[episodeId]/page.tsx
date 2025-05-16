
"use client";

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
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

  const availableServers = ["vidstreaming", "vidcloud", "streamsb", "streamtape"]; 

  console.log(`[WatchPageContent] Initializing for episodeId: ${episodeIdFromParams}, animeId: ${animeId}`);

  useEffect(() => {
    async function fetchData() {
      console.log(`[WatchPageContent] fetchData triggered. episodeIdFromParams: ${episodeIdFromParams}, selectedServer: ${selectedServer}`);
      if (!episodeIdFromParams) {
          setError("Episode ID is missing.");
          setIsLoading(false);
          console.warn("[WatchPageContent] fetchData aborted: episodeIdFromParams is missing.");
          return;
      }
      setIsLoading(true);
      setError(null);
      setStreamingInfo(null); // Reset previous streaming info
      setSelectedQuality(undefined); // Reset previous quality

      try {
        const links = await getEpisodeStreamingLinks(episodeIdFromParams, selectedServer); 
        console.log("[WatchPageContent] API getEpisodeStreamingLinks response:", JSON.stringify(links, null, 2));

        if (links && links.sources && links.sources.length > 0) {
          setStreamingInfo(links);
          const defaultQualitySource = links.sources.find(s => s.quality === 'default' || s.quality === 'auto');
          const firstSource = links.sources[0];
          const qualityToSet = defaultQualitySource?.quality || firstSource?.quality;
          setSelectedQuality(qualityToSet);
          console.log("[WatchPageContent] Streaming links found. Sources count:", links.sources.length, "Selected quality set to:", qualityToSet);
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

  const handleServerChange = (newServer: string) => {
    console.log("[WatchPageContent] Server changed to:", newServer);
    setSelectedServer(newServer);
  };

  const currentSource = useMemo(() => {
    if (!streamingInfo || !streamingInfo.sources || streamingInfo.sources.length === 0) {
      return undefined;
    }
    const source = streamingInfo.sources.find(s => s.quality === selectedQuality) || streamingInfo.sources[0];
    console.log("[WatchPageContent] currentSource derived:", JSON.stringify(source, null, 2), "from selectedQuality:", selectedQuality);
    return source;
  }, [streamingInfo, selectedQuality]);


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


  if (isLoading) {
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
          <Select value={selectedServer} onValueChange={handleServerChange}>
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
            <Select value={selectedQuality || streamingInfo.sources[0]?.quality} onValueChange={setSelectedQuality}>
                <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Quality"/>
                </SelectTrigger>
                <SelectContent>
                    {streamingInfo.sources.map(source => (
                        <SelectItem key={source.quality || 'default'} value={source.quality || 'default'}>
                            {source.quality || 'Default'} ({source.url.includes('.m3u8') ? 'HLS' : 'MP4'})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            </div>
        )}
      </div>


      {error && ( // Display error more prominently if it exists, even if streamingInfo also exists but might be stale
        <Alert variant="destructive" className="my-6">
          <Tv className="h-5 w-5" />
          <AlertTitle>Error Loading Video</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && streamingInfo && currentSource && (
        <MediaPlayer
          key={currentSource.url} // Key to force re-mount on source change
          title={`${animeDetails?.title || 'Episode'} ${currentEpNumber}`}
          src={{ src: currentSource.url, type: currentSource.isM3U8 ? 'application/x-mpegurl' : 'video/mp4' }}
          className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-black"
          crossOrigin
          playsInline
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      )}
      
      {!error && (!streamingInfo || !currentSource) && !isLoading && (
         <div className="my-6 p-6 bg-muted rounded-md text-center">
            <p className="text-muted-foreground">Video source not available. Please try a different server or check back later.</p>
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
