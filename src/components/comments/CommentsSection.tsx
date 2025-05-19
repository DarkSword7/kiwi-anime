
"use client";

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { CommentForm } from './CommentForm';
import { CommentsList } from './CommentsList';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal'; // Assuming you want to trigger this

interface CommentsSectionProps {
  animeId: string;
}

export function CommentsSection({ animeId }: CommentsSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const handleCommentPosted = () => {
    // Invalidate queries to refetch comments
    queryClient.invalidateQueries({ queryKey: ['comments', animeId, 'topLevel'] });
    // Potentially invalidate all reply queries too if needed, or manage more granularly
    queryClient.invalidateQueries({ queryKey: ['comments', animeId, 'replies'] });
  };

  return (
    <section aria-labelledby="comments-heading" className="py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h2 id="comments-heading" className="text-2xl md:text-3xl font-bold text-primary mb-6">
          Comments
        </h2>

        <div className="bg-card/50 border border-border/50 rounded-lg p-4 md:p-6 shadow-lg"
             style={{
                backgroundColor: 'hsl(270 40% 18%)', // Dark purple background from image
             }}
        >
          {user ? (
            <CommentForm animeId={animeId} onCommentPosted={handleCommentPosted} />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">You need to be logged in to post a comment.</p>
              <Button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Log In / Sign Up
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8">
          <CommentsList animeId={animeId} onCommentPosted={handleCommentPosted} />
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </section>
  );
}
