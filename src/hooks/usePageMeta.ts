import { useEffect } from 'react';

/**
 * Sets document.title and meta description for SEO.
 * Bug 261: Now cleans up OG/Twitter meta tags on unmount.
 * Bug 262: Canonical URL includes query params for stateful pages.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const appName = 'GlucoForge';
    const prevTitle = document.title;
    document.title = title ? `${title} | ${appName}` : appName;

    // Track created elements for cleanup
    const createdElements: Element[] = [];

    const ensureMeta = (attr: string, key: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      const isNew = !tag;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.content = content;
      if (isNew) createdElements.push(tag);
    };

    if (description) {
      ensureMeta('name', 'description', description.slice(0, 160));
    }

    // Open Graph
    ensureMeta('property', 'og:title', title ? `${title} | GlucoForge` : 'GlucoForge');
    if (description) ensureMeta('property', 'og:description', description.slice(0, 200));
    ensureMeta('property', 'og:type', 'website');

    // Twitter Card
    ensureMeta('name', 'twitter:card', 'summary');
    ensureMeta('name', 'twitter:title', title ? `${title} | GlucoForge` : 'GlucoForge');
    if (description) ensureMeta('name', 'twitter:description', description.slice(0, 200));

    // Canonical URL — include full path + search params
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const isNewCanonical = !canonical;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname + window.location.search;
    if (isNewCanonical) createdElements.push(canonical);

    return () => {
      document.title = prevTitle;
      // Remove tags we created (don't remove pre-existing ones)
      createdElements.forEach(el => el.parentNode?.removeChild(el));
    };
  }, [title, description]);
}
