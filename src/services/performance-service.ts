
import { throttle, debounce } from './performance/throttle-debounce';
import { usePerformanceMonitoring } from './performance/use-performance-monitoring';
import { 
  markPerformance, 
  measurePerformance, 
  collectPerformanceMetrics 
} from './performance/metrics-collector';

/**
 * Performance monitoring and optimization service
 * Exports utilities for performance optimization
 */

// Export performance utilities
export {
  throttle,
  debounce,
  usePerformanceMonitoring,
  markPerformance,
  measurePerformance,
  collectPerformanceMetrics
};

// Export cache and network utilities from their respective services
export { 
  setCachedData, 
  getCachedData, 
  invalidateCache, 
  clearAllCaches 
} from './cache-service';

export { 
  smartFetch, 
  simulateServerLoadBalancing 
} from './network-service';

// Default export with all utilities
const performanceService = {
  throttle,
  debounce,
  usePerformanceMonitoring,
  markPerformance,
  measurePerformance,
  collectPerformanceMetrics
};

export default performanceService;
