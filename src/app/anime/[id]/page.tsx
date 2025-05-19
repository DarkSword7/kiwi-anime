
import { getAnimeInfo } from '@/services/anime-service';
import { notFound } from 'next/navigation';
import type { AnimeInfo } from '@/types/anime';
import { AnimeDetailsPageClient } from './AnimeDetailsPageClient';

interface AnimeDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function AnimeDetailsPage({ params }: AnimeDetailsPageProps) {
  const anime: AnimeInfo | null = await getAnimeInfo(params.id);

  if (!anime) {
    notFound(); 
  }
  
  // AnimeDetailsPageClient will handle the presentation logic.
  // CommentsSection is no longer part of this page.
  return <AnimeDetailsPageClient anime={anime} />;
}
