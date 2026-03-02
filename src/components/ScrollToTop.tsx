import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Fix 8.33: Don't scroll to top if URL has a hash anchor
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};