
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useNetworkStatus } from '@/services/network/network-status';

type PrefetchOptions = {
  staleTime?: number;
  enabled?: boolean;
};

export function usePrefetch() {
  const queryClient = useQueryClient();
  const { online } = useNetworkStatus();
  
  // Simple prefetch function
  const prefetchQuery = useCallback(
    async <T>(
      queryKey: string[],
      queryFn: () => Promise<T>,
      options: PrefetchOptions = {}
    ) => {
      // Don't prefetch if offline or disabled
      if (!online || options.enabled === false) return null;
      
      try {
        return await queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: options.staleTime || 2 * 60 * 1000, // 2 minutes default (reduced)
        });
      } catch (error) {
        console.error(`Failed to prefetch ${queryKey.join(':')}:`, error);
        return null;
      }
    },
    [queryClient, online]
  );

  return {
    prefetchQuery,
  };
}

// Simplified hook for essential prefetching only
export function usePrefetchOnMount(queryKeys: string[][]) {
  const queryClient = useQueryClient();
  const { online } = useNetworkStatus();
  
  useEffect(() => {
    if (!online) return;
    
    // Only prefetch critical queries after a delay to avoid blocking initial render
    const timer = setTimeout(() => {
      queryKeys.forEach(queryKey => {
        queryClient.prefetchQuery({ 
          queryKey,
          queryFn: () => Promise.resolve([]), // Empty fallback
          staleTime: 2 * 60 * 1000
        });
      });
    }, 1000); // Delay prefetching by 1 second
    
    return () => clearTimeout(timer);
  }, [queryClient, queryKeys, online]);
}
