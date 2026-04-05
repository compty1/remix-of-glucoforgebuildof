import { useEffect } from 'react';

/**
 * Sets document.title and meta description for SEO (Issue 227, 231).
 * Falls back gracefully if meta tag doesn't exist.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const appName = 'GlucoForge';
    document.title = title ? `${title} | ${appName}` : appName;

    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description.slice(0, 160);
    }

    // Open Graph tags (Issue 228)
    const setOG = (property: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setOG('og:title', title ? `${title} | GlucoForge` : 'GlucoForge');
    if (description) setOG('og:description', description.slice(0, 200));
    setOG('og:type', 'website');

    // Twitter Card tags
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', title ? `${title} | GlucoForge` : 'GlucoForge');
    if (description) setMeta('twitter:description', description.slice(0, 200));

    // Canonical URL
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;

    return () => {
      document.title = appName;
    };
  }, [title, description]);
}
