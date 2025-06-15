
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

type PrefetchOptions = {
  staleTime?: number;
  enabled?: boolean;
};

export function usePrefetch() {
  const queryClient = useQueryClient();
  
  // Lightweight prefetch function
  const prefetchQuery = useCallback(
    async <T>(
      queryKey: string[],
      queryFn: () => Promise<T>,
      options: PrefetchOptions = {}
    ) => {
      // Don't prefetch if disabled
      if (options.enabled === false) return null;
      
      try {
        return await queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: options.staleTime || 60 * 1000, // 1 minute default
        });
      } catch (error) {
        console.error(`Failed to prefetch ${queryKey.join(':')}:`, error);
        return null;
      }
    },
    [queryClient]
  );

  return {
    prefetchQuery,
  };
}

// Removed automatic prefetching on mount to improve startup performance
