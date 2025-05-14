
/**
 * Performance metrics collection and monitoring
 */

// Performance metrics interface
export interface PerformanceMetrics {
  navigationTime: number;
  domLoadTime: number;
  resourceLoadTimes: Record<string, number>;
  longTasks: number;
  memoryUsage?: number;
}

// Collect current performance metrics
export function collectPerformanceMetrics(): PerformanceMetrics | null {
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
    const longTaskEntries = performance.getEntriesByType('longtask');
    metrics.longTasks = longTaskEntries.length;
  }
  
  // Memory usage (Chrome only)
  if ((performance as any).memory) {
    metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 
                         (performance as any).memory.totalJSHeapSize;
  }
  
  return metrics;
}

// Mark a performance event
export function markPerformance(name: string): void {
  if (window.performance) {
    performance.mark(name);
  }
}

// Measure between two performance marks
export function measurePerformance(name: string, startMark: string, endMark: string): number | null {
  if (!window.performance) return null;
  
  try {
    performance.measure(name, startMark, endMark);
    const measures = performance.getEntriesByName(name, 'measure');
    return measures[0]?.duration || null;
  } catch (e) {
    console.error('Error measuring performance:', e);
    return null;
  }
}
