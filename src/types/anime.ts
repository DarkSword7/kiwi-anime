
// Base structure for an anime item, typically from search results
export interface AnimeSearchResult {
  id: string; // Identifier for fetching detailed info, e.g., "spy-x-family.6ll19"
  title: string;
  image: string; // URL for cover image
  releaseDate?: string | null; // Can be year "2023" or full date "YYYY-MM-DD"
  subOrDub?: "sub" | "dub";
  type?: string; // E.g., "TV", "Movie", "OVA" - often present in search results too
  // Other fields like 'url' to the anime page on the source might be present
}

// Detailed information for a specific anime
export interface AnimeInfo extends AnimeSearchResult {
  url?: string; // URL to the anime's page on the source site
  description?: string | null;
  genres?: string[];
  // type?: string | null; // E.g., "TV", "Movie" // Already in AnimeSearchResult
  status?: string; // E.g., "Ongoing", "Completed"
  otherName?: string | null;
  totalEpisodes?: number;
  episodes?: Episode[];
}

// Represents a single episode
export interface Episode {
  id: string; // Episode ID, used for fetching streaming links, e.g., "159332"
  number: number; // Episode number
  title?: string; // Optional: API might provide title, or we can generate "Episode X"
  url?: string; // URL to the episode's page on the source site
  isFiller?: boolean; // Optional: some APIs might provide this
}

// Represents streaming source details
export interface StreamingSource {
  url: string; // Direct streamable URL (e.g., .m3u8, .mp4)
  quality?: string; // E.g., "default", "720p", "1080p"
  isM3U8?: boolean;
}

// Represents a subtitle track
export interface SubtitleTrack {
  url: string; // URL to the VTT subtitle file
  lang: string; // Language label, e.g., "English", "Spanish"
  default?: boolean; // Optional: whether this is the default subtitle track
}

export interface StreamingLinks {
  headers?: {
    Referer?: string;
    watchsb?: string | null;
    "User-Agent"?: string | null;
  };
  sources: StreamingSource[];
  subtitles?: SubtitleTrack[]; 
  download?: string; // Optional download link
}

// Unified Anime type for internal use, especially for components like AnimeCard
// This can be expanded as needed.
export type Anime = AnimeSearchResult & Partial<Pick<AnimeInfo, 'genres' | 'status' | 'description' | 'totalEpisodes'>>;

export interface PaginatedAnimeResults {
  currentPage: number;
  hasNextPage: boolean;
  results: AnimeSearchResult[];
}

export interface Genre {
  id: string;
  title: string;
}
