import { useEffect, useCallback } from 'react';

/**
 * Performance monitoring and optimization service
 * Implements caching strategies, load management, and performance metrics
 */

// Cache storage
const CACHE_VERSION = 'v1';
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

// Throttle and debounce utilities
export function throttle<F extends (...args: any[]) => any>(
  func: F, 
  limit: number
): (...args: Parameters<F>) => ReturnType<F> | undefined {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<F>;
  
  return function(this: any, ...args: Parameters<F>): ReturnType<F> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
}

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<F>): void {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

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

// Performance metrics
interface PerformanceMetrics {
  navigationTime: number;
  domLoadTime: number;
  resourceLoadTimes: Record<string, number>;
  longTasks: number;
  memoryUsage?: number;
}

// Connection-aware fetching
export async function smartFetch(
  url: string,
  options?: RequestInit,
  cacheOptions?: {
    useCache: boolean;
    cacheTTL?: number;
    cacheKey?: string;
  }
): Promise<Response> {
  const cacheKey = cacheOptions?.cacheKey || url;
  
  // Check online status
  if (!navigator.onLine) {
    const cachedData = getCachedData<Response>(cacheKey);
    if (cachedData) {
      // Return cached data when offline
      return Promise.resolve(new Response(JSON.stringify(cachedData), {
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    throw new Error('You are offline and no cached data is available');
  }
  
  // Check if we should use cache
  if (cacheOptions?.useCache) {
    const cachedData = getCachedData<any>(cacheKey);
    if (cachedData) {
      return Promise.resolve(new Response(JSON.stringify(cachedData), {
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  }
  
  // Use network info API if available to adjust fetch behavior
  const connectionType = (navigator as any).connection?.type;
  const saveData = (navigator as any).connection?.saveData;
  
  // Adjust fetch options based on connection
  const adjustedOptions = { ...options };
  
  if (saveData || connectionType === 'slow-2g' || connectionType === '2g') {
    // For slow connections, prioritize smaller payloads
    adjustedOptions.headers = {
      ...adjustedOptions.headers,
      'Accept': 'application/json;minimal=true',
    };
  }
  
  // Perform fetch with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const response = await fetch(url, {
      ...adjustedOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Cache the successful response if needed
    if (cacheOptions?.useCache) {
      const clonedResponse = response.clone();
      const responseData = await clonedResponse.json();
      setCachedData(cacheKey, responseData, cacheOptions.cacheTTL);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeout);
    
    // If abort error and we have cache, use it
    if (error.name === 'AbortError' && cacheOptions?.useCache) {
      const cachedData = getCachedData<any>(cacheKey);
      if (cachedData) {
        console.warn('Request timed out, using cached data');
        return Promise.resolve(new Response(JSON.stringify(cachedData), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    }
    
    throw error;
  }
}

// React hook for monitoring performance
export function usePerformanceMonitoring() {
  const collectPerformanceMetrics = useCallback((): PerformanceMetrics | null => {
    if (!window.performance) return null;
    
    const metrics: PerformanceMetrics = {
      navigationTime: 0,
      domLoadTime: 0,
      resourceLoadTimes: {},
      longTasks: 0
    };
    
    // Navigation timing
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      metrics.navigationTime = navEntry.responseEnd - navEntry.requestStart;
      // Fix: Use domContentLoadedEventEnd and domContentLoadedEventStart for DOM load time
      metrics.domLoadTime = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
    }
    
    // Resource timing
    const resourceEntries = performance.getEntriesByType('resource');
    resourceEntries.forEach((entry) => {
      const name = entry.name.split('/').pop() || entry.name;
      metrics.resourceLoadTimes[name] = entry.duration;
    });
    
    // Long tasks (if supported)
    if ('PerformanceLongTaskTiming' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        metrics.longTasks += list.getEntries().length;
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
    
    // Memory usage (Chrome only)
    if ((performance as any).memory) {
      metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 
                           (performance as any).memory.totalJSHeapSize;
    }
    
    return metrics;
  }, []);

  useEffect(() => {
    // Setup performance observers
    if (!window.performance || !PerformanceObserver) return;
    
    // Clear old entries
    performance.clearMarks();
    performance.clearMeasures();
    performance.clearResourceTimings();
    
    // Set up observers for different performance entry types
    const observers: PerformanceObserver[] = [];
    
    try {
      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Log slow resource loads (over 2 seconds)
          if (entry.duration > 2000) {
            console.warn('Slow resource load:', entry.name, entry.duration.toFixed(2) + 'ms');
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      observers.push(resourceObserver);
      
      // Paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(`${entry.name}:`, entry.startTime.toFixed(2) + 'ms');
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      observers.push(paintObserver);
      
      // Long tasks
      if ('PerformanceLongTaskTiming' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn('Long task detected:', entry.duration.toFixed(2) + 'ms');
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        observers.push(longTaskObserver);
      }
    } catch (e) {
      console.error('Error setting up performance observers:', e);
    }
    
    // Record initial load metrics after page is fully loaded
    window.addEventListener('load', () => {
      // Wait a bit for things to settle
      setTimeout(() => {
        const metrics = collectPerformanceMetrics();
        console.log('Page load performance metrics:', metrics);
      }, 1000);
    }, { once: true });
    
    // Cleanup
    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [collectPerformanceMetrics]);
  
  return {
    markPerformance: (name: string) => {
      performance.mark(name);
    },
    measurePerformance: (name: string, startMark: string, endMark: string) => {
      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name, 'measure');
        return measures[0]?.duration;
      } catch (e) {
        console.error('Error measuring performance:', e);
        return null;
      }
    },
    getMetrics: collectPerformanceMetrics
  };
}

// Load balancing simulation for high-traffic scenarios
export function simulateServerLoadBalancing() {
  // This is a client-side simulation of server load balancing
  // In a real system, this would be handled by infrastructure
  
  const serverPool = [
    { endpoint: 'api-1', load: 0, maxLoad: 100 },
    { endpoint: 'api-2', load: 0, maxLoad: 100 },
    { endpoint: 'api-3', load: 0, maxLoad: 100 }
  ];
  
  // Select server with least load
  const selectServer = () => {
    return serverPool.reduce((prev, current) => 
      (prev.load / prev.maxLoad) < (current.load / current.maxLoad) ? prev : current
    );
  };
  
  // Simulate request to chosen server
  const makeBalancedRequest = async (path: string, options?: RequestInit) => {
    const server = selectServer();
    server.load += 1;
    
    try {
      // In a real app, the actual endpoint would be used here
      // For this simulation, we'll just use the original path
      const response = await fetch(path, options);
      return response;
    } finally {
      // Decrease load after request completes
      setTimeout(() => {
        server.load -= 1;
      }, 100);
    }
  };
  
  return { makeBalancedRequest };
}

// Export optimization utilities
export default {
  throttle,
  debounce,
  setCachedData,
  getCachedData,
  invalidateCache,
  clearAllCaches,
  smartFetch,
  usePerformanceMonitoring,
  simulateServerLoadBalancing
};
