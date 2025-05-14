
/**
 * Performance utilities for throttling and debouncing function calls
 */

// Throttle utility - limits how often a function can be called
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

// Debounce utility - delays function execution until after a wait period
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
