
import { useEffect, useCallback } from 'react';
import { setCachedData, getCachedData, invalidateCache, clearAllCaches } from './cache-service';
import { smartFetch, simulateServerLoadBalancing } from './network-service';

/**
 * Performance monitoring and optimization service
 * Implements performance utilities, metrics, and optimizations
 */

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

// Performance metrics
interface PerformanceMetrics {
  navigationTime: number;
  domLoadTime: number;
  resourceLoadTimes: Record<string, number>;
  longTasks: number;
  memoryUsage?: number;
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
      // Use domContentLoadedEventEnd and domContentLoadedEventStart for DOM load time
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
