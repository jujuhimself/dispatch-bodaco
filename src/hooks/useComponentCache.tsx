
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for caching component render results for better performance
 * Useful for expensive components that should only re-render when their data changes
 */
export function useComponentCache<T>(
  key: string, 
  data: T, 
  expiryTime: number = 60000
) {
  // Store rendered components in memory
  const [cache, setCache] = useState<Record<string, {
    component: React.ReactNode;
    timestamp: number;
    data: T;
  }>>({});
  
  // Clear expired cache entries
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    setCache(prevCache => {
      const newCache = { ...prevCache };
      
      Object.keys(newCache).forEach(cacheKey => {
        if (now - newCache[cacheKey].timestamp > expiryTime) {
          delete newCache[cacheKey];
        }
      });
      
      return newCache;
    });
  }, [expiryTime]);
  
  // Clear cache on unmount and periodically
  useEffect(() => {
    // Set up periodic cleanup
    const interval = setInterval(cleanupCache, expiryTime);
    
    return () => {
      clearInterval(interval);
    };
  }, [cleanupCache, expiryTime]);
  
  // Update cache with rendered component
  const updateCache = useCallback((component: React.ReactNode) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        component,
        timestamp: Date.now(),
        data
      }
    }));
  }, [key, data]);
  
  // Check if we have a valid cached version
  const cachedEntry = cache[key];
  const isCacheValid = cachedEntry && 
    JSON.stringify(cachedEntry.data) === JSON.stringify(data) &&
    Date.now() - cachedEntry.timestamp < expiryTime;
  
  return {
    cachedComponent: isCacheValid ? cachedEntry.component : null,
    updateCache,
    isCacheValid
  };
}

export default useComponentCache;
