
import { useEffect, useCallback } from 'react';
import { collectPerformanceMetrics, markPerformance, measurePerformance } from './metrics-collector';

/**
 * React hook for monitoring and tracking performance metrics
 */
export function usePerformanceMonitoring() {
  const getMetrics = useCallback(collectPerformanceMetrics, []);

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
        const metrics = getMetrics();
        console.log('Page load performance metrics:', metrics);
      }, 1000);
    }, { once: true });
    
    // Cleanup
    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [getMetrics]);
  
  return {
    markPerformance,
    measurePerformance,
    getMetrics
  };
}
