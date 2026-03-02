/**
 * Phase 6.27: Dynamic viewport height.
 * Sets --dvh CSS custom property to handle mobile browser chrome.
 * Use h-[calc(var(--dvh,1vh)*100)] instead of h-screen.
 */
import { useEffect } from 'react';

export function useDynamicViewportHeight() {
  useEffect(() => {
    function setDVH() {
      const dvh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--dvh', `${dvh}px`);
    }

    setDVH();
    window.addEventListener('resize', setDVH);
    // Also handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(setDVH, 100);
    });

    return () => {
      window.removeEventListener('resize', setDVH);
    };
  }, []);
}
