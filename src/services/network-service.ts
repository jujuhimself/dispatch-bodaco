
import { getCachedData, setCachedData } from './cache-service';

/**
 * Network service for optimized data fetching
 */

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
    if ((error as any).name === 'AbortError' && cacheOptions?.useCache) {
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
