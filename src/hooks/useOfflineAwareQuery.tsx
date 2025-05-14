
import { useQuery, UseQueryOptions, QueryFunction, QueryKey } from '@tanstack/react-query';
import { useNetworkStatus } from '@/services/network/network-status';
import { getCachedResponse, cacheResponse } from '@/services/indexed-db-service';
import { toast } from 'sonner';

/**
 * A wrapper around React Query's useQuery hook that's aware of offline status
 * It attempts to use cached data when offline and updates the cache when online
 */
export function useOfflineAwareQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'> & {
    offlineMessage?: string;
    cacheExpiry?: number;
  }
) {
  const { online } = useNetworkStatus();
  const { 
    offlineMessage = "Using cached data while offline",
    cacheExpiry = 3600, // 1 hour default
    ...queryOptions 
  } = options || {};
  
  // Custom query function that handles offline mode
  const offlineAwareQueryFn = async ({ queryKey }: { queryKey: TQueryKey }): Promise<TQueryFnData> => {
    // Generate a cache key from the query key
    const cacheKey = `query_${JSON.stringify(queryKey)}`;
    
    try {
      // If online, execute the normal query function
      if (online) {
        const result = await queryFn({ queryKey } as any);
        
        // Cache the successful result for offline use
        await cacheResponse(cacheKey, result, cacheExpiry);
        
        return result;
      } else {
        // If offline, try to get from cache
        const cachedData = await getCachedResponse<TQueryFnData>(cacheKey);
        
        if (cachedData) {
          // Let the user know we're using cached data
          toast.info(offlineMessage, { id: `offline-${cacheKey}` });
          return cachedData;
        }
        
        // If no cached data, throw error
        throw new Error('No cached data available while offline');
      }
    } catch (error) {
      // Try to get from cache as fallback
      const cachedData = await getCachedResponse<TQueryFnData>(cacheKey);
      
      if (cachedData) {
        toast.info('Using cached data due to error', { id: `error-${cacheKey}` });
        return cachedData;
      }
      
      // Re-throw if no cache available
      throw error;
    }
  };
  
  // Use React Query with our custom query function
  return useQuery({
    queryKey,
    queryFn: offlineAwareQueryFn as any,
    // Don't refetch when offline
    refetchOnWindowFocus: online,
    refetchOnReconnect: online,
    ...queryOptions
  });
}

export default useOfflineAwareQuery;
