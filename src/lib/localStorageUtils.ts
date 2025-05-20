
import type { ContinueWatchingItem, AnimeInfo, Episode } from '@/types/anime';

const CONTINUE_WATCHING_KEY = 'kiwiAnimeContinueWatching';
const MAX_CONTINUE_WATCHING_ITEMS = 10;

export function getContinueWatchingList(): ContinueWatchingItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedList = localStorage.getItem(CONTINUE_WATCHING_KEY);
    return storedList ? JSON.parse(storedList) : [];
  } catch (error) {
    console.error("Error reading continue watching list from localStorage:", error);
    return [];
  }
}

export function addOrUpdateContinueWatchingItem(
  animeInfo: AnimeInfo,
  episode: Episode
): void {
  if (typeof window === 'undefined' || !animeInfo || !episode) {
    return;
  }

  try {
    const currentList = getContinueWatchingList();

    const newItem: ContinueWatchingItem = {
      animeId: animeInfo.id,
      animeTitle: animeInfo.title,
      animeImage: animeInfo.image,
      animeType: animeInfo.type,
      episodeId: episode.id,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
      lastWatchedTimestamp: Date.now(),
      totalEpisodes: animeInfo.totalEpisodes,
    };

    // Remove existing item if it's the same anime to move it to the top
    const filteredList = currentList.filter(item => item.animeId !== newItem.animeId);
    
    // Add new item to the beginning
    const updatedList = [newItem, ...filteredList];

    // Ensure the list doesn't exceed max size
    const finalList = updatedList.slice(0, MAX_CONTINUE_WATCHING_ITEMS);

    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(finalList));
  } catch (error) {
    console.error("Error saving to continue watching list in localStorage:", error);
  }
}

// Optional: function to remove an item (e.g., if user finishes an anime)
export function removeContinueWatchingItem(animeId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const currentList = getContinueWatchingList();
    const updatedList = currentList.filter(item => item.animeId !== animeId);
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error("Error removing from continue watching list in localStorage:", error);
  }
}
