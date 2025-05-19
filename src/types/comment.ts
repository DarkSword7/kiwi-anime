
import type { Timestamp } from 'firebase/firestore';

export interface CommentData {
  animeId: string;
  text: string;
  userId: string;
  userDisplayName: string | null;
  userPhotoURL: string | null;
  isSpoiler: boolean;
  parentId: string | null; // ID of the parent comment, null for top-level
  createdAt: Timestamp;
  updatedAt?: Timestamp; // For future edit functionality
  replyCount?: number; // Optional: for denormalization
  // Add likesCount or other fields as needed in the future
}

export interface CommentDocument extends CommentData {
  id: string; // Firestore document ID
}
