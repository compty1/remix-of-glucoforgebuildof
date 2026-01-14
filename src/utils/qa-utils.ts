import { useEffect } from 'react';

// Accessibility audit utility
export const useAccessibilityAudit = () => {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === 'development') {
      import('axe-core').then((axe) => {
        axe.default.run().then((results) => {
          if (results.violations.length > 0) {
            console.group('🚨 Accessibility Violations Found');
            results.violations.forEach((violation) => {
              console.warn(`${violation.id}: ${violation.description}`);
              violation.nodes.forEach((node) => {
                console.log('Element:', node.target);
                console.log('Fix:', node.failureSummary);
              });
            });
            console.groupEnd();
          } else {
            console.log('✅ No accessibility violations found');
          }
        });
      });
    }
  }, []);
};

// Performance monitoring utility
export const usePerformanceMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor page load performance
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        console.group('📊 Performance Metrics');
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
        console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
        
        paintEntries.forEach((entry) => {
          console.log(`${entry.name}:`, entry.startTime, 'ms');
        });
        
        // Check Core Web Vitals
        if ('web-vitals' in window) {
          console.log('Consider implementing Core Web Vitals monitoring');
        }
        console.groupEnd();
      });
    }
  }, []);
};