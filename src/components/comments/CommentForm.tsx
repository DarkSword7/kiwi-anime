
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addComment } from '@/services/comments-service';
import { Loader2 } from 'lucide-react';

interface CommentFormProps {
  episodeId: string; // Changed from animeId
  parentId?: string | null;
  onCommentPosted?: () => void;
  placeholder?: string;
  buttonText?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export function CommentForm({
  episodeId,
  parentId = null,
  onCommentPosted,
  placeholder = "Add a comment...",
  buttonText = "Post Comment",
  showCancelButton = false,
  onCancel
}: CommentFormProps) {
  const { user, loading: authLoading } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You need to be logged in to post a comment.",
      });
      return;
    }
    if (commentText.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Comment",
        description: "Comment cannot be empty.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newCommentId = await addComment(
        episodeId, // Use episodeId here
        commentText.trim(),
        isSpoiler,
        user.uid,
        user.displayName,
        user.photoURL,
        parentId
      );

      if (newCommentId) {
        toast({ title: "Comment Posted!" });
        setCommentText('');
        setIsSpoiler(false);
        onCommentPosted?.();
      } else {
        throw new Error("Failed to post comment.");
      }
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        variant: "destructive",
        title: "Error Posting Comment",
        description: error.message || "Could not post your comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <Textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder={placeholder}
        className="bg-card/60 border-border/70 focus:border-primary min-h-[80px] text-foreground placeholder:text-muted-foreground"
        rows={3}
        disabled={isSubmitting || !user}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`spoiler-${parentId || 'top'}-${episodeId}`} // Added episodeId for unique ID
            checked={isSpoiler}
            onCheckedChange={(checked) => setIsSpoiler(Boolean(checked))}
            disabled={isSubmitting || !user}
            className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor={`spoiler-${parentId || 'top'}-${episodeId}`} className="text-sm text-muted-foreground">
            Mark as Spoiler
          </Label>
        </div>
        <div className="flex items-center gap-2">
          {showCancelButton && onCancel && (
             <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !user || commentText.trim().length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
            size="sm"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </div>
      </div>
      {!user && (
        <p className="text-sm text-center text-muted-foreground">
          Please <button type="button" onClick={() => {/* Consider triggering AuthModal here if available globally */} } className="text-primary hover:underline">log in</button> to comment.
        </p>
      )}
    </form>
  );
}
