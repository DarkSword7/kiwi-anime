
"use client";

import React, { useEffect, useState, Suspense, useMemo, useRef } from 'react';
import { 
  MediaPlayer, 
  MediaProvider, 
  Track, 
  type MediaPlayerInstance, 
  type MediaProviderAdapter,
  Captions 
} from '@vidstack/react';
import type { HLSProviderObject } from '@vidstack/react/providers/hls';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { getEpisodeStreamingLinks, getAnimeInfo } from '@/services/anime-service';
import type { StreamingLinks, AnimeInfo, StreamingSource, SubtitleTrack, Episode } from '@/types/anime';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeft, Tv, SkipBack, SkipForward, Settings2, ListVideo, Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { addOrUpdateContinueWatchingItem } from '@/lib/localStorageUtils';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs'; // Import Breadcrumbs

const CIPHERTV_CORS_PROXY_URL = 'https://proxys.ciphertv.dev/proxy?url=';

interface WatchPageContentProps {}

const queryClient = new QueryClient();

function WatchPageContent({}: WatchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerRef = useRef<MediaPlayerInstance>(null);
  
  const episodeIdFromQuery = searchParams.get('ep');
  const animeId = searchParams.get('animeId');
  const currentEpNumberParam = searchParams.get('epNum');
  const currentEpNumber = currentEpNumberParam ? parseInt(currentEpNumberParam, 10) : 0;


  const [streamingInfo, setStreamingInfo] = useState<StreamingLinks | null>(null);
  const [animeDetails, setAnimeDetails] = useState<AnimeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('vidstreaming'); 
  const [selectedQuality, setSelectedQuality] = useState<string | undefined>(undefined);
  const [hlsProvider, setHlsProvider] = useState<HLSProviderObject | null>(null);

  const availableServers = ["vidstreaming", "vidcloud", "streamsb", "streamtape", "animepahe", "zoro"]; 

  useEffect(() => {
    async function fetchData() {
      if (!episodeIdFromQuery) {
        setError("Episode ID is missing from URL.");
        setIsLoading(false);
        setIsLoadingStream(false);
        return;
      }
      
      setIsLoading(true); 
      setIsLoadingStream(true); 
      setError(null);
      setStreamingInfo(null); 
      setSelectedQuality(undefined);

      try {
        const linksPromise = getEpisodeStreamingLinks(episodeIdFromQuery, selectedServer);
        const detailsPromise = animeId ? getAnimeInfo(animeId) : Promise.resolve(null);

        const [links, details] = await Promise.all([linksPromise, detailsPromise]);

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
        } else {
          const errorMsg = `No streaming links found for episode on server '${selectedServer}'. Try another server.`;
          setError(errorMsg);
          setStreamingInfo(null); 
        }

        if (details) {
          setAnimeDetails(details);
           const currentEpisode = details.episodes?.find(ep => ep.id === episodeIdFromQuery || ep.number === currentEpNumber);
           if (currentEpisode) {
             addOrUpdateContinueWatchingItem(details, currentEpisode);
           }
        } else if (animeId) {
          console.warn("[WatchPageContent] Could not fetch anime details for animeId:", animeId);
        }

      } catch (e: any) {
        setError(e.message || `Could not load video for server '${selectedServer}'. Try again or select a different server.`);
        setStreamingInfo(null); 
      } finally {
        setIsLoading(false);
        setIsLoadingStream(false);
      }
    }
    if (episodeIdFromQuery) { 
        fetchData();
    } else {
        setIsLoading(false); 
        setIsLoadingStream(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeIdFromQuery, animeId, selectedServer]); 


  const currentSource = useMemo(() => {
    if (!streamingInfo || !streamingInfo.sources || streamingInfo.sources.length === 0) return undefined;
    const sourceByQuality = selectedQuality ? streamingInfo.sources.find(s => s.quality === selectedQuality) : undefined;
    const defaultSource = streamingInfo.sources.find(s => s.quality?.toLowerCase() === 'default' || s.quality?.toLowerCase() === 'auto') || streamingInfo.sources[0];
    return sourceByQuality || defaultSource;
  }, [streamingInfo, selectedQuality]);
  
  const playerSrcUrl = useMemo(() => {
    if (!currentSource?.url) return undefined;
    let url = currentSource.url;
    if (url.startsWith('http') && !url.includes('animefreestream.vercel.app/') && !url.includes('localhost') && !url.includes(CIPHERTV_CORS_PROXY_URL.split('?')[0])) {
        return `${CIPHERTV_CORS_PROXY_URL}${encodeURIComponent(url)}`;
    }
    return url;
  }, [currentSource]);

   useEffect(() => {
    if (hlsProvider && streamingInfo?.headers && Object.keys(streamingInfo.headers).length > 0 && currentSource?.isM3U8) {
      const safeHeadersToSet: Record<string, string> = {};
      for (const key in streamingInfo.headers) {
        if (Object.prototype.hasOwnProperty.call(streamingInfo.headers, key)) {
          const headerValue = streamingInfo.headers[key as keyof typeof streamingInfo.headers];
          if (headerValue && key.toLowerCase() !== 'referer') { // Exclude Referer
             safeHeadersToSet[key] = headerValue as string;
          }
        }
      }

      if (Object.keys(safeHeadersToSet).length > 0) {
        if (!hlsProvider.config) hlsProvider.config = {}; 
        const previousXhrSetup = hlsProvider.config.xhrSetup; 
        hlsProvider.config.xhrSetup = (xhr: XMLHttpRequest, requestUrl: string) => {
            if(previousXhrSetup) previousXhrSetup(xhr, requestUrl); 
            for (const headerKey in safeHeadersToSet) {
              try {
                xhr.setRequestHeader(headerKey, safeHeadersToSet[headerKey]);
              } catch (e) {
                console.warn(`[WatchPageContent] Failed to set header '${headerKey}' for HLS request. Error:`, e);
              }
            }
          };
      } else {
        if (hlsProvider.config?.xhrSetup) { 
            delete hlsProvider.config.xhrSetup; 
        }
      }
    } else if (hlsProvider && hlsProvider.config?.xhrSetup && (!streamingInfo?.headers || Object.keys(streamingInfo.headers).length === 0 || !currentSource?.isM3U8)) {
        delete hlsProvider.config.xhrSetup;
    }
  }, [hlsProvider, streamingInfo, currentSource]);


  const handleServerChange = (newServer: string) => {
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

  const getLangCode = (langLabel: string | null | undefined): string => {
    if (!langLabel) return 'und';
    let lowerLangLabel = langLabel.toLowerCase().trim();

    if (lowerLangLabel.includes('thumbnails')) return 'und';

    const langMap: { regex: RegExp; code: string }[] = [
        { regex: /english|eng(?:[^a-zA-Z]|$)/i, code: "en" },
        { regex: /spanish.*latin america|español.*am(?:é|e)rica latina|es-la|spanish \(la\)/i, code: "es-LA" },
        { regex: /spanish|español|es(?:[^a-zA-Z]|$)/i, code: "es" },
        { regex: /portuguese.*brazil|português.*brasil|pt-br|portuguese \(brazil\)|português \(brasil\)/i, code: "pt-BR" },
        { regex: /portuguese|português|pt(?:[^a-zA-Z]|$)/i, code: "pt" },
        { regex: /french|français|fr(?:[^a-zA-Z]|$)/i, code: "fr" },
        { regex: /german|deutsch|de(?:[^a-zA-Z]|$)/i, code: "de" },
        { regex: /italian|italiano|it(?:[^a-zA-Z]|$)/i, code: "it" },
        { regex: /arabic|العربية|ar(?:[^a-zA-Z]|$)/i, code: "ar" },
        { regex: /russian|русский|ru(?:[^a-zA-Z]|$)/i, code: "ru" },
        { regex: /japanese|日本語|ja(?:[^a-zA-Z]|$)/i, code: "ja" },
        { regex: /indonesian|bahasa indonesia|id(?:[^a-zA-Z]|$)/i, code: "id" },
        { regex: /thai|ภาษาไทย|th(?:[^a-zA-Z]|$)/i, code: "th" },
        { regex: /vietnamese|tiếng việt|vi(?:[^a-zA-Z]|$)/i, code: "vi" },
        { regex: /malay|bahasa melayu|ms(?:[^a-zA-Z]|$)/i, code: "ms" },
        { regex: /hindi|हिन्दी|hi(?:[^a-zA-Z]|$)/i, code: "hi" },
        { regex: /korean|한국어|ko(?:[^a-zA-Z]|$)/i, code: "ko" },
        { regex: /chinese|中文|zh(?:[^a-zA-Z]|$)/i, code: "zh" },
    ];
    
    for (const entry of langMap) {
        if (entry.regex.test(lowerLangLabel)) return entry.code;
    }
    
    const crMatch = lowerLangLabel.match(/^([a-z\s]+)\s*-\s*cr_[a-z]+/i);
    if (crMatch && crMatch[1]) {
        const firstPart = crMatch[1].trim();
        for (const entry of langMap) {
            if (entry.regex.test(firstPart)) return entry.code;
        }
    }

    const mainLangPart = lowerLangLabel.split(/[-_\s(]/)[0];
    if (/^[a-z]{2,3}$/.test(mainLangPart)) return mainLangPart;
    
    return 'und';
  };

  const getDirectSubtitleUrl = (originalUrl: string): string => {
    return originalUrl;
  };
  
  const actualSubtitles = useMemo(() => {
    const subs = streamingInfo?.subtitles?.filter(sub => sub.lang && !sub.lang.toLowerCase().includes('thumbnails')) || [];
    return subs;
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
        if (langCode !== 'und') return langCode;
    }
    return null;
  }, [actualSubtitles]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: animeDetails?.title || "Anime", href: animeId ? `/anime/${animeId}` : "/catalogue" },
    { label: `Episode ${currentEpNumber || 'N/A'}` }
  ];

  if (isLoading && !animeDetails) { 
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.32))] text-center">
          <Breadcrumbs items={[{label: "Home", href: "/"}, {label: "Watch"}]} className="self-start w-full max-w-7xl mx-auto px-4" />
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <p className="text-xl text-muted-foreground">Loading episode details...</p>
        </div>
     );
  }

  if (!episodeIdFromQuery && !isLoading) { 
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.32))] text-center">
            <Breadcrumbs items={[{label: "Home", href: "/"}, {label: "Error"}]} className="self-start w-full max-w-7xl mx-auto px-4" />
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
  
  const coverImageUrl = animeDetails?.image || 'https://placehold.co/220x330.png?text=Cover';

  return (
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex flex-col md:flex-row gap-4 lg:gap-6 max-w-none">
        {/* Left Column: Episode List (Desktop) */}
        <div className="w-full md:w-1/4 lg:w-1/5 hidden md:block">
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
              <ScrollArea className="h-[calc(100vh-200px)] md:h-[calc(100vh-150px)]">
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
                className="w-full aspect-video"
                crossOrigin 
                playsInline
                onProviderChange={(provider) => {
                  if (provider?.type === 'hls') {
                      setHlsProvider(provider as HLSProviderObject);
                  } else {
                      if(hlsProvider) setHlsProvider(null);
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
                    const trackSrcLang = getLangCode(sub.lang);
                     if (trackSrcLang === 'und') return null;
                    const subtitleUrl = getDirectSubtitleUrl(sub.url); 
                    return (
                      <Track
                        key={sub.url} 
                        src={subtitleUrl}
                        kind="subtitles" 
                        label={sub.lang} 
                        lang={trackSrcLang}  
                        default={trackSrcLang === defaultTrackSrcLang}
                        type="vtt" 
                        crossOrigin="anonymous"
                      />
                    );
                  })}
                </MediaProvider>
                <Captions className="vds-captions font-semibold text-lg sm:text-xl md:text-2xl [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]" /> 
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
          
          <div className="block md:hidden mt-4">
              <Card className="bg-card border-border/60">
                  <CardHeader className="p-3 border-b border-border/60">
                      <CardTitle className="text-md flex items-center text-primary">
                          <ListVideo className="w-4 h-4 mr-2" />
                          Episodes
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                      <ScrollArea className="w-full whitespace-nowrap">
                          <div className="flex space-x-2 pb-2">
                          {animeDetails?.episodes && animeDetails.episodes.length > 0 ? (
                              animeDetails.episodes.map((episode: Episode) => (
                              <Link 
                                  key={`mob-${episode.id}`}
                                  href={`/watch?ep=${encodeURIComponent(episode.id)}&animeId=${animeId}&epNum=${episode.number}`}
                                  passHref
                              >
                                  <Button
                                  variant={episode.number === currentEpNumber ? "default" : "outline"}
                                  size="sm"
                                  className={`h-9 w-12 text-xs flex-shrink-0
                                              ${episode.number === currentEpNumber 
                                                  ? 'bg-primary text-primary-foreground' 
                                                  : 'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-foreground'}`}
                                  >
                                  {episode.number}
                                  </Button>
                              </Link>
                              ))
                          ) : (
                              <p className="p-2 text-xs text-muted-foreground">No episodes.</p>
                          )}
                          </div>
                          <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                  </CardContent>
              </Card>
          </div>

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

          {episodeIdFromQuery && (
             <CommentsSection episodeId={episodeIdFromQuery} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.32))] text-center">
        <Breadcrumbs items={[{label: "Home", href: "/"}, {label: "Watch"}]} className="self-start w-full max-w-7xl mx-auto px-4" />
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4 mt-8" /> {/* Added mt-8 for spacing */}
        <p className="text-xl text-muted-foreground">Loading episode information...</p>
      </div>
    }>
      <QueryClientProvider client={queryClient}>
        <WatchPageContent />
      </QueryClientProvider>
    </Suspense>
  );
}
