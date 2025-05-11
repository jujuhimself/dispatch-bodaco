
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { withCache, CacheStrategy, createCacheKey } from '@/services/cache-middleware';
import { useCallback } from 'react';

/**
 * Custom hook for data fetching with integrated caching
 * Combines React Query with our custom cache middleware
 */
export function useCachedQuery<TData = unknown, TError = unknown>(
  queryKey: unknown[],
  fetcher: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError> & {
    cacheStrategy?: CacheStrategy;
    cacheTTL?: number;
    cacheGroup?: string;
    maxEntries?: number;
  }
) {
  const {
    cacheStrategy,
    cacheTTL,
    cacheGroup,
    maxEntries,
    ...queryOptions
  } = options || {};
  
  // Create a cache key from the query key
  const cacheKey = createCacheKey(`query:${queryKey[0]}`, queryKey[1] as Record<string, any>);
  
  // Create wrapped fetcher with caching
  const wrappedFetcher = useCallback(async () => {
    return withCache(fetcher, cacheKey, {
      strategy: cacheStrategy || CacheStrategy.NetworkFirst,
      ttl: cacheTTL,
      cacheGroup,
      maxEntries
    });
  }, [fetcher, cacheKey, cacheStrategy, cacheTTL, cacheGroup, maxEntries]);
  
  // Use React Query with our wrapped fetcher
  return useQuery<TData, TError>({
    queryKey,
    queryFn: wrappedFetcher,
    ...queryOptions
  });
}

/**
 * Custom hook for mutations with cache invalidation
 */
export function useCachedMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext> & {
    invalidateQueries?: unknown[][];
    invalidateCacheGroups?: string[];
  }
) {
  const {
    invalidateQueries,
    invalidateCacheGroups,
    ...mutationOptions
  } = options || {};
  
  // Use standard React Query mutation
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...mutationOptions,
    // Add cache invalidation on success
    onSuccess: async (data, variables, context) => {
      // Call original onSuccess if provided
      if (mutationOptions?.onSuccess) {
        await mutationOptions.onSuccess(data, variables, context);
      }
      
      // Invalidate specified cache groups if any
      if (invalidateCacheGroups?.length) {
        for (const group of invalidateCacheGroups) {
          const { clearCacheGroup } = await import('@/services/cache-middleware');
          clearCacheGroup(group);
        }
      }
    }
  });
}
