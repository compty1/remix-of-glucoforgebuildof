import { useEffect } from 'react';
import { injectJsonLd, removeJsonLd, getOrganizationJsonLd } from '@/utils/structuredData';

/**
 * Hook to inject JSON-LD structured data into the page head.
 * Cleans up on unmount.
 */
export function useStructuredData(
  id: string,
  data: Record<string, unknown> | null,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || !data) return;

    injectJsonLd(data, id);

    return () => {
      removeJsonLd(id);
    };
  }, [id, data, enabled]);
}

/**
 * Inject the global Organization schema on the homepage.
 */
export function useOrganizationSchema() {
  useStructuredData('org-jsonld', getOrganizationJsonLd());
}
