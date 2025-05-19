
import { getAnimeInfo } from '@/services/anime-service';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Tv, Film, Clapperboard, Info, List, ShieldQuestion } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import type { AnimeInfo, Episode } from '@/types/anime';
import { CommentsSection } from '@/components/comments/CommentsSection'; // Import CommentsSection
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'; // Import for React Query
import { AnimeDetailsPageClient } from './AnimeDetailsPageClient'; // Client component wrapper

// Create a client
const queryClient = new QueryClient();

interface AnimeDetailsPageProps {
  params: {
    id: string;
  };
}

// This main page component remains a Server Component to fetch initial data
export default async function AnimeDetailsPage({ params }: AnimeDetailsPageProps) {
  const anime: AnimeInfo | null = await getAnimeInfo(params.id);

  if (!anime) {
    notFound(); 
  }
  
  return (
    // QueryClientProvider must be at the top level for client components using useQuery
    // Since this page fetches data server-side first, and CommentsSection is client-side with its own data fetching,
    // we'll wrap CommentsSection in a client component that provides the QueryClient.
    // Or, make the whole page client-side if data fetching for anime info also needs to be client-side.
    // For now, let's make a client boundary for the comments.
     <AnimeDetailsPageClient anime={anime} />
  );
}

// We can't directly use QueryClientProvider in a server component like this if it has client components.
// We'll move the QueryClientProvider to a client component wrapper.

