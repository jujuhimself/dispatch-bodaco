
import { throttle, debounce } from './performance/throttle-debounce';

/**
 * Lightweight performance service - critical utilities only
 */

// Export only essential performance utilities
export {
  throttle,
  debounce
};

// Simple cache utilities (no heavy IndexedDB on startup)
const memoryCache = new Map<string, { data: any; expiry: number }>();

export function setCachedData<T>(key: string, data: T, ttlSeconds: number = 300): void {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
}

export function getCachedData<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (!cached || cached.expiry < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return cached.data;
}

export function invalidateCache(key: string): void {
  memoryCache.delete(key);
}

export function clearAllCaches(): void {
  memoryCache.clear();
}

// Simple fetch with minimal overhead
export async function smartFetch(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// Default export with essential utilities only
const performanceService = {
  throttle,
  debounce,
  setCachedData,
  getCachedData,
  invalidateCache,
  clearAllCaches,
  smartFetch
};

export default performanceService;
