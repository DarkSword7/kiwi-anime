
"use client";

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { MediaPlayer, MediaProvider, type HLSProvider, type MediaProviderAdapter, Captions } from '@vidstack/react';
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
      // setHlsProvider(null); // Reset hlsProvider on new data fetch

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
    // Only proxy non-local and non-vercel app URLs for video stream if needed
    if (url.startsWith('http') && !url.includes('animefreestream.vercel.app/') && !url.includes('localhost') ) {
      // Example proxy, replace with your actual one if needed for VIDEO streams
      // url = `${CIPHERTV_CORS_PROXY_URL}${encodeURIComponent(fullUrl.toString())}`;
      // console.log("[WatchPageContent] Using CORS proxied URL for player manifest:", url);
      console.log("[WatchPageContent] Using direct URL for player manifest (no video proxy for now):", url);
    } else {
        console.log("[WatchPageContent] Using direct URL for player manifest (local or already fine):", url);
    }
    return url;
  }, [currentSource]);

  useEffect(() => {
    console.log("[WatchPageContent] HLS Header Effect Triggered. hlsProvider:", !!hlsProvider, "streamingInfo.headers:", JSON.stringify(streamingInfo?.headers), "currentSource.isM3U8:", currentSource?.isM3U8);
    if (hlsProvider && streamingInfo?.headers && Object.keys(streamingInfo.headers).length > 0 && currentSource?.isM3U8) {
      const safeHeadersToSet: Record<string, string> = {};
      for (const key in streamingInfo.headers) {
        if (Object.prototype.hasOwnProperty.call(streamingInfo.headers, key)) {
          const headerValue = streamingInfo.headers[key];
          if (headerValue) { 
             const lowerKey = key.toLowerCase();
             if (lowerKey !== 'referer' && lowerKey !== 'user-agent') { // Browsers block these
                safeHeadersToSet[key] = headerValue as string;
             } else {
                console.warn(`[WatchPageContent] Skipping setting unsafe header '${key}' in HLS xhrSetup.`);
             }
          }
        }
      }

      if (Object.keys(safeHeadersToSet).length > 0) {
        console.log('[WatchPageContent] Attempting to configure HLS provider with custom headers:', JSON.stringify(safeHeadersToSet));
        if (!hlsProvider.config) {
          hlsProvider.config = {}; 
        }
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
            console.log('[WatchPageContent] Cleared existing HLS xhrSetup as no new safe headers.');
        }
      }
    } else if (hlsProvider && hlsProvider.config?.xhrSetup) {
        delete hlsProvider.config.xhrSetup;
        console.log('[WatchPageContent] Cleared existing HLS xhrSetup as conditions not met for applying custom headers.');
    } else if (!hlsProvider) {
         console.log('[WatchPageContent] HLS provider instance is null, cannot configure headers for HLS Effect.');
    }
  }, [hlsProvider, streamingInfo, currentSource]);


  const handleServerChange = (newServer: string) => {
    console.log("[WatchPageContent] Server changed to:", newServer);
    setHlsProvider(null); // Reset HLS provider on server change
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
      setHlsProvider(null); // Reset HLS provider on episode change
      router.push(`/watch?ep=${encodeURIComponent(targetEpisode.id)}&animeId=${animeId}&epNum=${targetEpisode.number}`);
    }
  };
  
  const hasPrevEpisode = currentEpNumber > 1 && animeDetails?.episodes?.some(ep => ep.number === currentEpNumber - 1);
  const hasNextEpisode = animeDetails?.episodes?.some(ep => ep.number === currentEpNumber + 1);

  const getLangCode = (langLabel: string): string => {
    if (!langLabel) return 'und'; // undetermined
    let lowerLangLabel = langLabel.toLowerCase().trim();

    // Explicitly mark thumbnails as undetermined and skip rendering them as subtitles
    if (lowerLangLabel.includes('thumbnails')) {
        console.log(`[WatchPageContent] getLangCode: langLabel '${langLabel}' identified as 'thumbnails', returning 'und'.`);
        return 'und'; 
    }
    
    // Handle labels like "Language - CR_Language(Region)" or "Language (Region)"
    // Example: "Portuguese - Português (Brasil)" -> "pt-BR"
    // Example: "Spanish - Español (LA)" -> "es-LA"
    // Example: "Arabic - CR_Arabic" -> "ar"
    
    let mainLangPart = lowerLangLabel;
    let regionCode = '';

    const regionMatch = lowerLangLabel.match(/\(([^)]+)\)/); // e.g., (brazil), (latin_america), (la)
    if (regionMatch) {
        const region = regionMatch[1].toLowerCase();
        mainLangPart = mainLangPart.replace(regionMatch[0], '').trim(); // Remove region part
        if (region === 'brazil' || region === 'br') regionCode = 'BR';
        else if (region === 'latin_america' || region === 'la') regionCode = 'LA';
        // Add more region codes as needed
    }

    // Further clean up mainLangPart, e.g., "portuguese - português" -> "português"
    const crSplit = mainLangPart.split('cr_');
    if (crSplit.length > 1) mainLangPart = crSplit[1].trim();
    
    const langDashSplit = mainLangPart.split(' - ');
    if (langDashSplit.length > 1) mainLangPart = langDashSplit[1].trim(); // Take the part after " - "
    else mainLangPart = langDashSplit[0].trim(); // Or the original if no " - "

    const langNameMap: { [key: string]: string } = {
      "english": "en", "ingles": "en", "inglês": "en",
      "spanish": "es", "español": "es",
      "german": "de", "deutsch": "de",
      "french": "fr", "français": "fr",
      "portuguese": "pt", "português": "pt", "portugues": "pt",
      "arabic": "ar", "árabe": "ar", "العربية": "ar",
      "russian": "ru", "русский": "ru",
      "italian": "it", "italiano": "it",
      "japanese": "ja", "日本語": "ja",
      "indonesian": "id", "bahasa indonesia": "id",
      "thai": "th", "ภาษาไทย": "th",
      "vietnamese": "vi", "tiếng việt": "vi",
      "malay": "ms", "bahasa melayu": "ms",
      "hindi": "hi", "हिन्दी": "hi",
      "korean": "ko", "한국어": "ko",
      "chinese": "zh", "中文": "zh",
    };

    let code = langNameMap[mainLangPart] || 'und';

    if (code === 'pt' && regionCode === 'BR') code = 'pt-BR';
    else if (code === 'es' && regionCode === 'LA') code = 'es-LA';
    else if (code === 'und' && (mainLangPart.length === 2 || mainLangPart.length === 3) && /^[a-z]{2,3}$/.test(mainLangPart)) {
      // If mainLangPart is already a 2 or 3 letter code
      code = mainLangPart;
    }
    
    if (code === 'und' && langLabel !== 'thumbnails') { // Avoid warning for known 'thumbnails' case
        console.warn(`[WatchPageContent] Unknown langLabel for getLangCode: '${langLabel}', extracted main: '${mainLangPart}', falling back to 'und'.`);
    }
    return code;
  };

  const getDirectSubtitleUrl = (originalUrl: string): string => {
    // No proxy for subtitles, return original URL
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
    if (firstEnglish) return getLangCode(firstEnglish.lang);
    
    if (actualSubtitles[0]) {
      const firstLangCode = getLangCode(actualSubtitles[0].lang);
      if (firstLangCode !== 'und') {
          console.log("[WatchPageContent] No default or English API-subtitle track found, defaulting to first available track's language:", actualSubtitles[0].lang, "Code:", firstLangCode);
          return firstLangCode;
      }
    }
    return null;
  }, [actualSubtitles]);


  if (!episodeIdFromQuery && !isLoading) { 
     return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <Alert variant="destructive" className="my-6 max-w-md">
            <Tv className="h-5 w-5" />
            <AlertTitle>Missing Episode ID</AlertTitle>
            <AlertDescription>
                The episode ID is missing from the URL. Cannot load video. 
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
  
  console.log("[WatchPageContent] About to render MediaPlayer. streamingInfo?.subtitles:", JSON.stringify(streamingInfo?.subtitles, null, 2));
  console.log("[WatchPageContent] Filtered actualSubtitles:", JSON.stringify(actualSubtitles, null, 2));
  console.log("[WatchPageContent] Default subtitle track language determined as:", defaultTrackSrcLang);


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
          crossOrigin // Important for HLS and potentially subtitles
          playsInline
          onProviderChange={(provider: MediaProviderAdapter | null) => {
            console.log("[WatchPageContent] onProviderChange triggered. Provider type:", provider?.type);
            if (provider?.type === 'hls') {
                console.log("[WatchPageContent] HLS provider instance obtained:", provider);
                setHlsProvider(provider as HLSProvider);
            } else {
                 console.log("[WatchPageContent] Non-HLS provider or null provider. Clearing HLS instance.");
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
          <MediaProvider />
          {actualSubtitles.map((sub) => {
            const trackSrcLang = getLangCode(sub.lang);
            if (trackSrcLang === 'und') { // Do not render track if lang code is undetermined
                console.log(`[WatchPageContent] Skipping rendering track for lang: '${sub.lang}' as its code is 'und'.`);
                return null;
            }
            const subtitleUrl = getDirectSubtitleUrl(sub.url); 
            console.log(`[WatchPageContent] Rendering track: lang='${sub.lang}', srcLang='${trackSrcLang}', default=${trackSrcLang === defaultTrackSrcLang}, originalUrl='${sub.url}', directUrl='${subtitleUrl}'`);
            return (
              <track
                key={sub.url} // Use URL as key for simplicity, assuming URLs are unique per language
                src={subtitleUrl}
                kind="subtitles" 
                label={sub.lang}
                srcLang={trackSrcLang}
                default={trackSrcLang === defaultTrackSrcLang}
                crossOrigin="anonymous" // Essential for cross-origin VTT files
              />
            );
          })}
          <Captions className="vds-captions" /> 
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

