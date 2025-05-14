
/**
 * Cache service for data storage and retrieval
 */

// Cache storage
const CACHE_VERSION = 'v1';
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

// Cache management
export function setCachedData(key: string, data: any, ttl: number = CACHE_TTL): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now() + ttl
  });
  
  // Also persist to localStorage if possible
  try {
    localStorage.setItem(
      `${CACHE_VERSION}:${key}`,
      JSON.stringify({
        data,
        timestamp: Date.now() + ttl
      })
    );
  } catch (e) {
    console.warn('Failed to persist cache to localStorage:', e);
  }
}

export function getCachedData<T>(key: string): T | null {
  // Try memory cache first
  const memoryItem = memoryCache.get(key);
  if (memoryItem && memoryItem.timestamp > Date.now()) {
    return memoryItem.data as T;
  }
  
  // Try localStorage next
  try {
    const storedItem = localStorage.getItem(`${CACHE_VERSION}:${key}`);
    if (storedItem) {
      const parsed = JSON.parse(storedItem);
      if (parsed.timestamp > Date.now()) {
        // Refresh memory cache
        memoryCache.set(key, parsed);
        return parsed.data as T;
      } else {
        // Clean up expired cache
        localStorage.removeItem(`${CACHE_VERSION}:${key}`);
      }
    }
  } catch (e) {
    console.warn('Failed to retrieve cache from localStorage:', e);
  }
  
  return null;
}

export function invalidateCache(key: string): void {
  memoryCache.delete(key);
  try {
    localStorage.removeItem(`${CACHE_VERSION}:${key}`);
  } catch (e) {
    console.warn('Failed to invalidate localStorage cache:', e);
  }
}

export function clearAllCaches(): void {
  memoryCache.clear();
  
  try {
    // Clear only our cache version
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${CACHE_VERSION}:`)) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Failed to clear localStorage cache:', e);
  }
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
