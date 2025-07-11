
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  serverTimestamp,
  doc,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CommentData, CommentDocument } from '@/types/comment';

if (!db) {
  console.warn("Firestore (db) is not initialized. Commenting features will not work.");
}

const COMMENTS_COLLECTION = 'comments';

// Function to add a new comment or reply
export async function addComment(
  episodeId: string,
  text: string,
  isSpoiler: boolean,
  userId: string,
  userDisplayName: string | null,
  userPhotoURL: string | null,
  parentId: string | null = null
): Promise<string | null> {
  if (!db) throw new Error("Firestore not initialized.");
  try {
    const commentData: Omit<CommentData, 'createdAt' | 'updatedAt' | 'replyCount'> & { createdAt: Timestamp, updatedAt: Timestamp, replyCount: number } = {
      episodeId,
      text,
      userId,
      userDisplayName,
      userPhotoURL,
      isSpoiler,
      parentId,
      createdAt: serverTimestamp() as Timestamp, 
      updatedAt: serverTimestamp() as Timestamp,
      replyCount: 0,
    };

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);
    
    if (parentId) {
      const parentCommentRef = doc(db, COMMENTS_COLLECTION, parentId);
      await runTransaction(db, async (transaction) => {
        const parentDoc = await transaction.get(parentCommentRef);
        if (!parentDoc.exists()) {
          throw "Parent comment does not exist.";
        }
        transaction.update(parentCommentRef, { replyCount: increment(1) });
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding comment: ", error);
    return null;
  }
}

// Function to get top-level comments for an episode
export async function getCommentsForEpisode(episodeId: string): Promise<CommentDocument[]> {
  if (!db) {
    console.warn("Firestore not initialized, returning empty comments array.");
    return [];
  }
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("episodeId", "==", episodeId),
      where("parentId", "==", null), 
      orderBy("createdAt", "desc") 
    );
    const querySnapshot = await getDocs(q);
    const comments: CommentDocument[] = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() } as CommentDocument);
    });
    return comments;
  } catch (error) {
    console.error("Error getting comments for episode: ", error);
    return [];
  }
}

// Function to get replies for a specific comment
export async function getRepliesForComment(commentId: string): Promise<CommentDocument[]> {
   if (!db) {
    console.warn("Firestore not initialized, returning empty replies array.");
    return [];
  }
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("parentId", "==", commentId),
      orderBy("createdAt", "asc") 
    );
    const querySnapshot = await getDocs(q);
    const replies: CommentDocument[] = [];
    querySnapshot.forEach((doc) => {
      replies.push({ id: doc.id, ...doc.data() } as CommentDocument);
    });
    return replies;
  } catch (error) {
    console.error("Error getting replies for comment: ", error);
    return [];
  }
}
