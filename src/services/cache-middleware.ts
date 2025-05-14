
import { getCachedData, setCachedData } from './cache-service';

/**
 * Cache middleware for API requests
 * Implements various caching strategies
 */

export enum CacheStrategy {
  NetworkOnly = 'network-only',     // Always fetch from network
  CacheFirst = 'cache-first',       // Try cache first, then network
  NetworkFirst = 'network-first',   // Try network first, fall back to cache
  StaleWhileRevalidate = 'stale-while-revalidate' // Use cache immediately while fetching updated data
}

interface CacheOptions {
  strategy?: CacheStrategy;
  ttl?: number;           // Time to live in milliseconds
  maxEntries?: number;    // Maximum entries in cache group
  cacheGroup?: string;    // Group name for cache management
  conditions?: {          // Conditional caching
    saveWhen?: (response: Response) => boolean;
    useWhen?: () => boolean;
  };
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  strategy: CacheStrategy.NetworkFirst,
  ttl: 5 * 60 * 1000, // 5 minutes
  cacheGroup: 'default'
};

// Store of cache groups and their entries
const cacheRegistry: Record<string, Set<string>> = {};

// Cache middleware function
export async function withCache<T>(
  fetcher: () => Promise<T>,
  key: string,
  options: CacheOptions = {}
): Promise<T> {
  const {
    strategy,
    ttl,
    maxEntries,
    cacheGroup,
    conditions
  } = { ...DEFAULT_CACHE_OPTIONS, ...options };

  // Register key in cache group for management
  if (cacheGroup) {
    if (!cacheRegistry[cacheGroup]) {
      cacheRegistry[cacheGroup] = new Set();
    }
    cacheRegistry[cacheGroup].add(key);
    
    // Enforce max entries if specified
    if (maxEntries && cacheRegistry[cacheGroup].size > maxEntries) {
      // Remove oldest entry (first in the set)
      const oldestKey = cacheRegistry[cacheGroup].values().next().value;
      cacheRegistry[cacheGroup].delete(oldestKey);
    }
  }
  
  // Check if we should use cache based on conditions
  const shouldUseCache = !conditions?.useWhen || conditions.useWhen();
  
  // Implement different caching strategies
  switch (strategy) {
    case CacheStrategy.NetworkOnly:
      return fetchFromNetwork();
      
    case CacheStrategy.CacheFirst:
      if (shouldUseCache) {
        const cachedData = getCachedData<T>(key);
        if (cachedData !== null) {
          return cachedData;
        }
      }
      return fetchFromNetwork();
      
    case CacheStrategy.StaleWhileRevalidate:
      if (shouldUseCache) {
        const cachedData = getCachedData<T>(key);
        if (cachedData !== null) {
          // Start network fetch in background
          fetchFromNetwork().catch(console.error);
          return cachedData;
        }
      }
      return fetchFromNetwork();
      
    case CacheStrategy.NetworkFirst:
    default:
      try {
        return await fetchFromNetwork();
      } catch (error) {
        if (shouldUseCache) {
          const cachedData = getCachedData<T>(key);
          if (cachedData !== null) {
            console.log('Network request failed, using cached data', key);
            return cachedData;
          }
        }
        throw error;
      }
  }
  
  async function fetchFromNetwork(): Promise<T> {
    try {
      const response = await fetcher();
      
      // Check if we should cache based on conditions
      const shouldCache = !conditions?.saveWhen || conditions.saveWhen(response as unknown as Response);
      
      if (shouldCache) {
        setCachedData(key, response, ttl);
      }
      
      return response;
    } catch (error) {
      console.error('Network fetch failed:', error);
      throw error;
    }
  }
}

// Helper to clear a specific cache group
export function clearCacheGroup(groupName: string): void {
  if (!cacheRegistry[groupName]) return;
  
  for (const key of cacheRegistry[groupName]) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to clear cache entry', key, e);
    }
  }
  
  cacheRegistry[groupName] = new Set();
}

// Helper for creating cache keys
export function createCacheKey(baseKey: string, params?: Record<string, any>): string {
  if (!params) return baseKey;
  
  // Sort params for consistent cache keys regardless of object property order
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key];
      }
      return acc;
    }, {} as Record<string, any>);
  
  return `${baseKey}:${JSON.stringify(sortedParams)}`;
}
