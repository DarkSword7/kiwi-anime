
"use client";

import React, { useEffect, useState, Suspense, useMemo, useRef } from 'react';
import { 
  MediaPlayer, 
  MediaProvider, 
  Track, 
  type MediaPlayerInstance, 
  type MediaProviderAdapter, 
  type HLSProvider, 
  Captions 
} from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { getEpisodeStreamingLinks, getAnimeInfo } from '@/services/anime-service';
import type { StreamingLinks, AnimeInfo, StreamingSource, SubtitleTrack, Episode } from '@/types/anime';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Tv, SkipBack, SkipForward, Settings2, ListVideo, Info } from 'lucide-react';
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
  const playerRef = useRef<MediaPlayerInstance>(null);
  
  const episodeIdFromQuery = searchParams.get('ep');
  const animeId = searchParams.get('animeId');
  const currentEpNumber = parseInt(searchParams.get('epNum') || '0', 10);

  const [streamingInfo, setStreamingInfo] = useState<StreamingLinks | null>(null);
  const [animeDetails, setAnimeDetails] = useState<AnimeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('vidstreaming'); 
  const [selectedQuality, setSelectedQuality] = useState<string | undefined>(undefined);
  const [hlsProvider, setHlsProvider] = useState<HLSProvider | null>(null);

  const availableServers = ["vidstreaming", "vidcloud", "streamsb", "streamtape", "animepahe", "zoro"]; 

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
        setIsLoadingStream(false);
        console.warn("[WatchPageContent] fetchData aborted: episodeIdFromQuery is missing.");
        return;
      }
      
      setIsLoading(true); // For overall page data (like anime details)
      setIsLoadingStream(true); // Specifically for stream links
      setError(null);
      setStreamingInfo(null); 
      setSelectedQuality(undefined);
      setHlsProvider(null);

      try {
        const linksPromise = getEpisodeStreamingLinks(episodeIdFromQuery, selectedServer);
        const detailsPromise = animeId ? getAnimeInfo(animeId) : Promise.resolve(null);

        const [links, details] = await Promise.all([linksPromise, detailsPromise]);

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
          const errorMsg = `No streaming links found for episode on server '${selectedServer}'. Try another server.`;
          setError(errorMsg);
          setStreamingInfo(null); 
          console.warn("[WatchPageContent] No streaming links found. Error set:", errorMsg);
        }

        if (details) {
          setAnimeDetails(details);
          console.log("[WatchPageContent] Fetched anime details:", details ? `Title: ${details.title}` : "Not found");
        } else if (animeId) {
          console.warn("[WatchPageContent] Could not fetch anime details for animeId:", animeId);
        }

      } catch (e: any) {
        console.error("[WatchPageContent] Error in fetchData:", e);
        setError(e.message || `Could not load video for server '${selectedServer}'. Try again or select a different server.`);
        setStreamingInfo(null); 
      } finally {
        setIsLoading(false);
        setIsLoadingStream(false);
        console.log("[WatchPageContent] fetchData finished. isLoading & isLoadingStream set to false.");
      }
    }
    if (episodeIdFromQuery) { 
        fetchData();
    } else {
        setIsLoading(false); 
        setIsLoadingStream(false);
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
    if (url.startsWith('http') && !url.includes('animefreestream.vercel.app/') && !url.includes('localhost') && !url.includes(CIPHERTV_CORS_PROXY_URL.split('?')[0])) {
        console.log("[WatchPageContent] Using CORS proxied URL for player manifest:", `${CIPHERTV_CORS_PROXY_URL}${encodeURIComponent(url)}`);
        return `${CIPHERTV_CORS_PROXY_URL}${encodeURIComponent(url)}`;
    }
    console.log("[WatchPageContent] Using direct URL for player manifest (no video proxy or already proxied/local):", url);
    return url;
  }, [currentSource]);

  useEffect(() => {
    console.log("[WatchPageContent] HLS Header Effect. Provider:", !!hlsProvider, "Headers:", JSON.stringify(streamingInfo?.headers), "M3U8:", currentSource?.isM3U8);
    if (hlsProvider && streamingInfo?.headers && Object.keys(streamingInfo.headers).length > 0 && currentSource?.isM3U8) {
      const safeHeadersToSet: Record<string, string> = {};
      for (const key in streamingInfo.headers) {
        if (Object.prototype.hasOwnProperty.call(streamingInfo.headers, key)) {
          const headerValue = streamingInfo.headers[key];
          if (headerValue && key.toLowerCase() !== 'referer') { 
             safeHeadersToSet[key] = headerValue as string;
          } else if (headerValue && key.toLowerCase() === 'referer') {
            console.warn(`[WatchPageContent] Skipping setting Referer header via xhrSetup as it's usually blocked by browsers.`);
          }
        }
      }

      if (Object.keys(safeHeadersToSet).length > 0) {
        console.log('[WatchPageContent] Attempting to configure HLS provider with custom headers (excluding Referer):', JSON.stringify(safeHeadersToSet));
        if (!hlsProvider.config) hlsProvider.config = {}; 
        const previousXhrSetup = hlsProvider.config.xhrSetup; 
        hlsProvider.config.xhrSetup = (xhr: XMLHttpRequest, requestUrl: string) => {
            if(previousXhrSetup) previousXhrSetup(xhr, requestUrl); 
            console.log(`[WatchPageContent] HLS xhrSetup for ${requestUrl}. Applying headers:`, JSON.stringify(safeHeadersToSet));
            for (const headerKey in safeHeadersToSet) {
              try {
                xhr.setRequestHeader(headerKey, safeHeadersToSet[headerKey]);
              } catch (e) {
                console.warn(`[WatchPageContent] Failed to set header '${headerKey}' for HLS request. Error:`, e);
              }
            }
          };
      } else {
        console.log('[WatchPageContent] No safe API headers to apply to HLS config.');
        if (hlsProvider.config?.xhrSetup) { 
            delete hlsProvider.config.xhrSetup; 
            console.log('[WatchPageContent] Cleared existing HLS xhrSetup.');
        }
      }
    } else if (hlsProvider && hlsProvider.config?.xhrSetup && (!streamingInfo?.headers || Object.keys(streamingInfo.headers).length === 0 || !currentSource?.isM3U8)) {
        delete hlsProvider.config.xhrSetup;
        console.log('[WatchPageContent] Cleared HLS xhrSetup as conditions not met.');
    } else if (!hlsProvider) {
         console.log('[WatchPageContent] HLS provider instance is null for HLS effect.');
    }
  }, [hlsProvider, streamingInfo, currentSource]);


  const handleServerChange = (newServer: string) => {
    console.log("[WatchPageContent] Server changed to:", newServer);
    setHlsProvider(null); 
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
      setHlsProvider(null); 
      router.push(`/watch?ep=${encodeURIComponent(targetEpisode.id)}&animeId=${animeId}&epNum=${targetEpisode.number}`);
    }
  };
  
  const hasPrevEpisode = currentEpNumber > 1 && animeDetails?.episodes?.some(ep => ep.number === currentEpNumber - 1);
  const hasNextEpisode = animeDetails?.episodes?.some(ep => ep.number === currentEpNumber + 1);

  const getLangCode = (langLabel: string): string => {
    if (!langLabel) return 'und';
    let lowerLangLabel = langLabel.toLowerCase().trim();
    
    if (lowerLangLabel.includes('thumbnails')) return 'und';

    const langMap: { [key: string]: string | undefined; regex?: RegExp }[] = [
        { regex: /english|eng/i, code: "en" },
        { regex: /spanish.*latin america|español.*la|es-la/i, code: "es-LA" },
        { regex: /spanish|español|es /i, code: "es" }, // Added space for "CR_Spanish"
        { regex: /portuguese.*brazil|português.*br|pt-br/i, code: "pt-BR" },
        { regex: /portuguese|português|pt /i, code: "pt" },
        { regex: /french|français|fr /i, code: "fr" },
        { regex: /german|deutsch|de /i, code: "de" },
        { regex: /italian|italiano|it /i, code: "it" },
        { regex: /arabic|árabe|العربية|ar /i, code: "ar" },
        { regex: /russian|русский|ru /i, code: "ru" },
        { regex: /japanese|日本語|ja/i, code: "ja" },
        { regex: /indonesian|bahasa indonesia|id/i, code: "id" },
        { regex: /thai|ภาษาไทย|th/i, code: "th" },
        { regex: /vietnamese|tiếng việt|vi/i, code: "vi" },
        { regex: /malay|bahasa melayu|ms/i, code: "ms" },
        { regex: /hindi|हिन्दी|hi/i, code: "hi" },
        { regex: /korean|한국어|ko/i, code: "ko" },
        { regex: /chinese|中文|zh/i, code: "zh" },
    ];
    
    for (const entry of langMap) {
        if (entry.regex?.test(lowerLangLabel)) {
            console.log(`[WatchPageContent] getLangCode: '${langLabel}' matched regex ${entry.regex} to '${entry.code}'.`);
            return entry.code!;
        }
    }
    
    const simpleCodeMatch = lowerLangLabel.match(/^([a-z]{2,3})(?:[^\w(]|$)/i);
    if (simpleCodeMatch) {
        console.log(`[WatchPageContent] getLangCode: '${langLabel}' matched simple code '${simpleCodeMatch[1]}'.`);
        return simpleCodeMatch[1];
    }

    console.warn(`[WatchPageContent] Unknown langLabel for getLangCode: '${langLabel}', falling back to 'und'.`);
    return 'und';
  };


  const getDirectSubtitleUrl = (originalUrl: string): string => {
    console.log("[WatchPageContent] Using direct URL for subtitle (no proxy):", originalUrl);
    return originalUrl;
  };
  
  const actualSubtitles = useMemo(() => {
    return streamingInfo?.subtitles?.filter(sub => sub.lang && !sub.lang.toLowerCase().includes('thumbnails')) || [];
  }, [streamingInfo?.subtitles]);
  
  const defaultTrackSrcLang = useMemo(() => {
    if (!actualSubtitles || actualSubtitles.length === 0) return null;
    const apiDefault = actualSubtitles.find(s => s.default === true);
    if (apiDefault) {
        const langCode = getLangCode(apiDefault.lang);
        if (langCode !== 'und') return langCode;
    }
    const firstEnglish = actualSubtitles.find(s => getLangCode(s.lang) === 'en');
    if (firstEnglish) {
      const langCode = getLangCode(firstEnglish.lang);
      if (langCode !== 'und') return langCode;
    }
    for (const sub of actualSubtitles) {
        const langCode = getLangCode(sub.lang);
        if (langCode !== 'und') {
            console.log("[WatchPageContent] No default/English API-subtitle, defaulting to first valid:", sub.lang, "Code:", langCode);
            return langCode;
        }
    }
    return null;
  }, [actualSubtitles]);


  if (isLoading && !animeDetails) { // Initial loading for anime details
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.32))] text-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <p className="text-xl text-muted-foreground">Loading episode details...</p>
        </div>
     );
  }

  if (!episodeIdFromQuery && !isLoading) { 
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.32))] text-center">
            <Alert variant="destructive" className="my-6 max-w-md bg-card border-destructive/50">
            <Tv className="h-5 w-5 text-destructive" />
            <AlertTitle>Missing Episode ID</AlertTitle>
            <AlertDescription className="text-muted-foreground">
                The episode ID is missing from the URL. Cannot load video. 
                <Button asChild variant="link" className="mt-2 text-primary">
                    <Link href="/">Go to Homepage</Link>
                </Button>
            </AlertDescription>
            </Alert>
        </div>
     );
  }
  
  console.log("[WatchPageContent] About to render MediaPlayer. streamingInfo?.subtitles:", JSON.stringify(streamingInfo?.subtitles, null, 2));
  console.log("[WatchPageContent] Filtered actualSubtitles:", JSON.stringify(actualSubtitles, null, 2));
  console.log("[WatchPageContent] Default subtitle track language determined as:", defaultTrackSrcLang);

  const coverImageUrl = animeDetails?.image || 'https://placehold.co/220x330.png?text=Cover';

  return (
    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 py-4 md:py-6 max-w-none">
      {/* Left Column: Episode List */}
      <div className="w-full md:w-1/4 lg:w-1/5">
        <Card className="h-full flex flex-col shadow-lg bg-card border-border/60">
          <CardHeader className="p-4 border-b border-border/60">
            <CardTitle className="text-lg flex items-center text-primary">
              <ListVideo className="w-5 h-5 mr-2" />
              Episodes
            </CardTitle>
            {animeDetails?.totalEpisodes && (
              <CardDescription className="text-xs">
                Total: {animeDetails.totalEpisodes}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <ScrollArea className="h-[calc(100vh-200px)] md:h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
              <div className="p-2 space-y-1">
                {animeDetails?.episodes && animeDetails.episodes.length > 0 ? (
                  animeDetails.episodes.map((episode: Episode) => (
                    <Button
                      key={episode.id}
                      variant={episode.number === currentEpNumber ? "secondary" : "ghost"}
                      className={`w-full justify-start text-left h-auto py-2.5 px-3 transition-colors duration-150 
                                  ${episode.number === currentEpNumber 
                                    ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                    : 'hover:bg-accent/50 hover:text-accent-foreground'}`}
                      asChild
                    >
                      <Link href={`/watch?ep=${encodeURIComponent(episode.id)}&animeId=${animeId}&epNum=${episode.number}`}>
                        <span className={`font-medium mr-2 min-w-[2.5rem] ${episode.number === currentEpNumber ? 'text-primary' : 'text-muted-foreground'}`}>
                          {episode.number}
                        </span>
                        <span className={`truncate flex-1 ${episode.number === currentEpNumber ? 'text-primary-foreground' : 'text-foreground/90'}`}>
                          {episode.title || `Episode ${episode.number}`}
                        </span>
                      </Link>
                    </Button>
                  ))
                ) : (
                  <p className="p-4 text-sm text-muted-foreground text-center">No episodes available.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Player and Details */}
      <div className="w-full md:w-3/4 lg:w-4/5 space-y-6">
        {/* Player Section */}
        <div className="bg-black rounded-lg shadow-2xl overflow-hidden border border-border/30">
          {isLoadingStream && (!playerSrcUrl || !currentSource) && (
             <div className="aspect-video flex flex-col items-center justify-center text-center bg-card">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground">Loading video source...</p>
             </div>
          )}
          {error && ( 
            <div className="aspect-video flex flex-col items-center justify-center text-center bg-card p-4">
              <Alert variant="destructive" className="max-w-lg">
                <Tv className="h-5 w-5" />
                <AlertTitle>Error Loading Video</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {!isLoadingStream && !error && playerSrcUrl && currentSource && (
             <MediaPlayer
              ref={playerRef}
              key={playerSrcUrl} 
              title={`${animeDetails?.title || 'Episode'} ${currentEpNumber}`}
              src={{ src: playerSrcUrl, type: currentSource.isM3U8 ? 'application/x-mpegurl' : 'video/mp4' }}
              className="w-full aspect-video" // Removed rounded-lg and shadow from here, parent has it
              crossOrigin 
              playsInline
              onProviderChange={(provider: MediaProviderAdapter | null) => {
                console.log("[WatchPageContent] onProviderChange triggered. Provider:", provider);
                if (provider?.type === 'hls') {
                    console.log("[WatchPageContent] HLS provider instance obtained via onProviderChange:", provider);
                    setHlsProvider(provider as HLSProvider);
                } else {
                     console.log("[WatchPageContent] Non-HLS provider or null. Clearing HLS instance from onProviderChange.");
                    setHlsProvider(null);
                }
              }}
              onTextTracksChange={(tracks, event) => { 
                console.log('[Vidstack] TextTracksChange:', tracks.map(t => ({label: t.label, language: t.language, mode: t.mode, kind: t.kind, id: t.id, src: t.src, type: t.type, default: t.default })));
              }}
              onTextTrackChange={(track, event) => { 
                console.log('[Vidstack] TextTrackChange (selected):', track ? {label: track.label, language: track.language, mode: track.mode, kind: track.kind, id: track.id, src: track.src, type: track.type, default: track.default } : null);
              }}
            >
              <MediaProvider>
                {actualSubtitles.map((sub) => {
                  const trackLang = getLangCode(sub.lang);
                   if (trackLang === 'und') { 
                      console.log(`[WatchPageContent] Skipping Vidstack <Track> for lang: '${sub.lang}' (code 'und'). URL: ${sub.url}`);
                      return null;
                  }
                  const subtitleUrl = getDirectSubtitleUrl(sub.url); 
                  console.log(`[WatchPageContent] Rendering Vidstack <Track>: lang='${sub.lang}', srcLang='${trackLang}', default=${trackLang === defaultTrackSrcLang}, originalUrl='${sub.url}', directUrl='${subtitleUrl}'`);
                  return (
                    <Track
                      key={subtitleUrl} 
                      src={subtitleUrl}
                      kind="subtitles" 
                      label={sub.lang} 
                      lang={trackLang}  
                      default={trackLang === defaultTrackSrcLang}
                      type="vtt" 
                      crossOrigin="anonymous"
                    />
                  );
                })}
              </MediaProvider>
              <Captions className="vds-captions font-semibold text-lg" /> 
              <DefaultVideoLayout icons={defaultLayoutIcons} className="text-foreground data-[focus]:ring-primary/80" />
            </MediaPlayer>
          )}
          {!isLoadingStream && !error && !playerSrcUrl && ( 
             <div className="aspect-video flex flex-col items-center justify-center text-center bg-card">
                <Tv className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-lg">Video source not available.</p>
                <p className="text-sm text-muted-foreground">Please try a different server or check back later.</p>
             </div>
          )}
        </div>
        
        {/* Episode Title and Server/Quality Controls */}
        <Card className="shadow-md bg-card border-border/60">
          <CardContent className="p-4 space-y-4">
            <div>
                <h1 className="text-xl md:text-2xl font-bold truncate text-foreground">
                    {animeDetails?.title || 'Anime Title'}
                </h1>
                <p className="text-md text-primary">
                    Episode {currentEpNumber || (episodeIdFromQuery ? episodeIdFromQuery.split('$episode$').pop()?.split('/')[0] : 'N/A')}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Settings2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground/90 mr-1">Server:</span>
                <Select value={selectedServer} onValueChange={handleServerChange} disabled={isLoadingStream}>
                  <SelectTrigger className="flex-grow sm:w-[150px] h-9 bg-input border-border focus:border-primary">
                    <SelectValue placeholder="Select server" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableServers.map(server => (
                      <SelectItem key={server} value={server} className="hover:bg-accent/50 focus:bg-accent/50">
                        {server.charAt(0).toUpperCase() + server.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {streamingInfo && streamingInfo.sources.length > 0 && ( 
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                 <span className="text-sm font-medium text-foreground/90 mr-1">Quality:</span>
                  <Select 
                      value={selectedQuality || streamingInfo.sources[0]?.quality || 'default'} 
                      onValueChange={setSelectedQuality}
                      disabled={isLoadingStream || !streamingInfo || streamingInfo.sources.length === 0}
                  >
                      <SelectTrigger className="flex-grow sm:w-[150px] h-9 bg-input border-border focus:border-primary"> 
                          <SelectValue placeholder="Quality"/>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                          {streamingInfo.sources.map(source => (
                              <SelectItem key={source.quality || 'default'} value={source.quality || 'default'} className="hover:bg-accent/50 focus:bg-accent/50">
                                  {source.quality || 'Default'} {source.isM3U8 ? '(HLS)' : ''}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  </div>
              )}
            </div>
            {isLoadingStream && <div className="flex justify-center"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>}
            
            {/* Episode Navigation */}
            {animeDetails && (
                <div className="mt-4 flex justify-between items-center gap-3">
                <Button variant="outline" onClick={() => navigateEpisode('prev')} disabled={!hasPrevEpisode || isLoadingStream} className="flex-1 sm:flex-initial border-primary/30 text-primary hover:bg-primary/10">
                    <SkipBack className="w-4 h-4 mr-2" /> Previous
                </Button>
                <Button variant="outline" onClick={() => navigateEpisode('next')} disabled={!hasNextEpisode || isLoadingStream} className="flex-1 sm:flex-initial border-primary/30 text-primary hover:bg-primary/10">
                    Next <SkipForward className="w-4 h-4 ml-2" />
                </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Anime Details Section (Simplified) */}
        {animeDetails && (
          <Card className="shadow-md bg-card border-border/60">
            <CardHeader className="p-4 border-b border-border/60">
              <CardTitle className="text-lg flex items-center text-primary">
                <Info className="w-5 h-5 mr-2" />
                About {animeDetails.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Image
                  src={coverImageUrl}
                  alt={`Cover for ${animeDetails.title}`}
                  width={150}
                  height={225}
                  className="rounded-md object-cover self-start"
                  data-ai-hint="anime poster portrait"
                  unoptimized={!animeDetails.image}
                />
                <div className="space-y-3">
                  {animeDetails.otherName && <p className="text-sm text-muted-foreground">Also known as: {animeDetails.otherName}</p>}
                  {animeDetails.description && (
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-5">
                      {animeDetails.description.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?i>/gi, '')}
                    </p>
                  )}
                  {animeDetails.genres && animeDetails.genres.length > 0 && (
                    <p className="text-sm">
                      <span className="font-semibold text-foreground/90">Genres: </span>
                      <span className="text-muted-foreground">{animeDetails.genres.join(', ')}</span>
                    </p>
                  )}
                   <p className="text-sm">
                      <span className="font-semibold text-foreground/90">Type: </span>
                      <span className="text-muted-foreground">{animeDetails.type || 'N/A'}</span>
                    </p>
                     <p className="text-sm">
                      <span className="font-semibold text-foreground/90">Status: </span>
                      <span className="text-muted-foreground">{animeDetails.status || 'N/A'}</span>
                    </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.32))] text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <p className="text-xl text-muted-foreground">Loading episode information...</p>
      </div>
    }>
      <WatchPageContent />
    </Suspense>
  );
}

    