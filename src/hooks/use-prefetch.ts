
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useNetworkStatus } from '@/services/network/network-status';
import { getCachedData } from '@/services/cache-service';

type PrefetchOptions = {
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  enabled?: boolean;
};

export function usePrefetch() {
  const queryClient = useQueryClient();
  const { online } = useNetworkStatus();
  
  // Prefetch data for a specific query
  const prefetchQuery = useCallback(
    async <T>(
      queryKey: string[],
      queryFn: () => Promise<T>,
      options: PrefetchOptions = {}
    ) => {
      // Don't prefetch if offline
      if (!online) return null;
      
      try {
        return await queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes by default
          gcTime: options.cacheTime || 15 * 60 * 1000, // 15 minutes by default
        });
      } catch (error) {
        console.error(`Failed to prefetch ${queryKey.join(':')}:`, error);
        return null;
      }
    },
    [queryClient, online]
  );

  // Prefetch data based on navigation prediction
  const prefetchNavigation = useCallback(
    async (routes: string[]) => {
      // Example prefetch strategy for common paths
      for (const route of routes) {
        switch (route) {
          case '/emergencies':
            await prefetchQuery(['emergencies'], () => 
              import('@/services/emergency-service').then(m => m.fetchEmergencies())
            );
            break;
          case '/responders':
            await prefetchQuery(['responders'], () => 
              import('@/services/responder-service').then(m => m.fetchResponders())
            );
            break;
          case '/hospitals':
            await prefetchQuery(['hospitals'], () => 
              import('@/services/hospital-service').then(m => m.fetchHospitals())
            );
            break;
          case '/iot':
            await prefetchQuery(['iotDevices'], () => 
              import('@/services/iot-service').then(m => m.fetchIoTDevices())
            );
            break;
          default:
            break;
        }
      }
    },
    [prefetchQuery]
  );

  return {
    prefetchQuery,
    prefetchNavigation,
  };
}

// Hook for prefetching on component mount
export function usePrefetchOnMount(queryKeys: string[][]) {
  const queryClient = useQueryClient();
  const { online } = useNetworkStatus();
  
  useEffect(() => {
    if (!online) return;
    
    // Prefetch each query when component mounts
    queryKeys.forEach(queryKey => {
      if (getCachedData(queryKey.join(':'))) {
        queryClient.invalidateQueries({ queryKey });
      }
    });
  }, [queryClient, queryKeys, online]);
}
