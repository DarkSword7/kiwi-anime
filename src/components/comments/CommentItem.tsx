
"use client";

import React, { useState } from 'react';
import type { CommentDocument } from '@/types/comment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ShieldAlert } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { CommentsList } from './CommentsList'; 
import { useAuth } from '@/hooks/useAuth';

interface CommentItemProps {
  comment: CommentDocument;
  episodeId: string; // Changed from animeId
  onCommentPosted: () => void; 
  isNested?: boolean;
}

export function CommentItem({ comment, episodeId, onCommentPosted, isNested = false }: CommentItemProps) {
  const { user } = useAuth();
  const [isSpoilerVisible, setIsSpoilerVisible] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formattedDate = comment.createdAt
    ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })
    : 'Just now';

  const toggleSpoiler = () => setIsSpoilerVisible(!isSpoilerVisible);
  const toggleReplyForm = () => setShowReplyForm(!showReplyForm);

  const handleReplyPosted = () => {
    setShowReplyForm(false);
    onCommentPosted(); 
  }

  return (
    <div className={`flex space-x-3 py-4 ${isNested ? 'ml-6 md:ml-10' : ''}`}>
      <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-border/50">
        <AvatarImage src={comment.userPhotoURL || undefined} alt={comment.userDisplayName || 'User'} />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          {getInitials(comment.userDisplayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-foreground">{comment.userDisplayName || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        
        {comment.isSpoiler && !isSpoilerVisible ? (
          <div 
            className="p-3 rounded-md bg-muted/50 hover:bg-muted/70 cursor-pointer"
            onClick={toggleSpoiler}
          >
            <p className="text-sm text-muted-foreground italic flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />
              This comment contains spoilers. Click to reveal.
            </p>
          </div>
        ) : (
          <p className="text-sm text-foreground/90 whitespace-pre-line break-words">{comment.text}</p>
        )}

        <div className="flex items-center space-x-2 pt-1">
          {user && (
            <Button variant="ghost" size="sm" onClick={toggleReplyForm} className="text-xs text-muted-foreground hover:text-primary p-1 h-auto">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Reply
            </Button>
          )}
        </div>

        {showReplyForm && user && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <CommentForm
              episodeId={episodeId} // Pass episodeId
              parentId={comment.id}
              onCommentPosted={handleReplyPosted}
              placeholder={`Replying to ${comment.userDisplayName || 'User'}...`}
              buttonText="Post Reply"
              showCancelButton={true}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}

        {(comment.replyCount ?? 0) > 0 && (
           <div className={`mt-3 pt-3 ${!isNested || (isNested && showReplyForm) ? 'border-t border-border/30' : ''}`}>
            <CommentsList 
                episodeId={episodeId} // Pass episodeId
                parentId={comment.id} 
                onCommentPosted={onCommentPosted} 
                isNested={true}
            />
           </div>
        )}
      </div>
    </div>
  );
}
