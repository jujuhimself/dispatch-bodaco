
import { throttle, debounce } from './performance/throttle-debounce';
import { usePerformanceMonitoring } from './performance/use-performance-monitoring';
import { markPerformance, measurePerformance, collectPerformanceMetrics } from './performance/metrics-collector';
import { setCachedData, getCachedData, invalidateCache, clearAllCaches } from './cache-service';
import { smartFetch, simulateServerLoadBalancing } from './network-service';

/**
 * Performance monitoring and optimization service
 * Exports utilities for performance optimization
 */

// Export all performance utilities
export {
  throttle,
  debounce,
  usePerformanceMonitoring,
  markPerformance,
  measurePerformance,
  collectPerformanceMetrics
};

// Export default object with all utilities
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
