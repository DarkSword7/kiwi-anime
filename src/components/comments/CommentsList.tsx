
"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCommentsForAnime, getRepliesForComment } from '@/services/comments-service';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface CommentsListProps {
  animeId: string;
  parentId?: string | null;
  onCommentPosted: () => void; // To trigger refetch
  isNested?: boolean;
}

export function CommentsList({ animeId, parentId = null, onCommentPosted, isNested = false }: CommentsListProps) {
  const queryKey = parentId ? ['comments', animeId, 'replies', parentId] : ['comments', animeId, 'topLevel'];
  
  const fetchFn = parentId 
    ? () => getRepliesForComment(parentId) 
    : () => getCommentsForAnime(animeId);

  const { data: comments, isLoading, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: fetchFn,
    // staleTime: 1000 * 60 * 5, // 5 minutes
    // refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className={`space-y-4 ${isNested ? 'pl-6 md:pl-10' : ''}`}>
        {[...Array(isNested ? 1 : 3)].map((_, i) => (
          <div key={i} className="flex space-x-3 py-4">
            <Skeleton className="h-10 w-10 rounded-full bg-muted/70" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4 bg-muted/70" />
              <Skeleton className="h-4 w-3/4 bg-muted/60" />
              <Skeleton className="h-4 w-1/2 bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-destructive text-center">Error loading comments: {error?.message}</div>;
  }

  if (!comments || comments.length === 0) {
    return !isNested ? <p className="py-4 text-sm text-muted-foreground text-center">No comments yet. Be the first to comment!</p> : null;
  }

  return (
    <div className={`space-y-0 divide-y divide-border/30 ${isNested && comments.length > 0 ? 'border-l-2 border-border/20 pl-3 md:pl-4' : ''}`}>
      {comments.map((comment) => (
        <CommentItem 
            key={comment.id} 
            comment={comment} 
            animeId={animeId} 
            onCommentPosted={onCommentPosted}
            isNested={isNested}
        />
      ))}
    </div>
  );
}
