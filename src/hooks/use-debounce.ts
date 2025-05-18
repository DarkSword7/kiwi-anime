
import { useEffect, useState } from 'react';

// Custom hook for debouncing
export function useDebounce(
  callback: () => void,
  delay: number,
  dependencies: React.DependencyList
) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      callback();
    }, delay);
    setTimeoutId(newTimeoutId);

    // Cleanup function
    return () => {
      if (newTimeoutId) {
        clearTimeout(newTimeoutId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, delay]); // Re-run effect if dependencies or delay change
}
