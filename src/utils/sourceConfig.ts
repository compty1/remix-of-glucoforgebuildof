// Unified source configuration for device and medication reviews
// Addresses C13-C20, N51, N91-N94

export interface SourceConfig {
  displayName: string;
  domain: string;
  isOfficial: boolean;
  badgeColor: string;
}

const SOURCE_CONFIG: Record<string, SourceConfig> = {
  // Official consumer review sources
  'drugs.com': { displayName: 'Drugs.com', domain: 'drugs.com', isOfficial: true, badgeColor: 'bg-chart-5/10 text-chart-5 border-chart-5/20' },
  'webmd': { displayName: 'WebMD', domain: 'webmd.com', isOfficial: true, badgeColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20' },
  'healthline': { displayName: 'Healthline', domain: 'healthline.com', isOfficial: true, badgeColor: 'bg-success/10 text-success border-success/20' },
  'google': { displayName: 'Google', domain: 'google.com', isOfficial: true, badgeColor: 'bg-success/10 text-success border-success/20' },
  'pubmed': { displayName: 'PubMed', domain: 'pubmed.ncbi.nlm.nih.gov', isOfficial: true, badgeColor: 'bg-chart-2/10 text-chart-2 border-chart-2/20' },
  'fda': { displayName: 'FDA', domain: 'fda.gov', isOfficial: true, badgeColor: 'bg-destructive/10 text-destructive border-destructive/20' },
  'consumerguide': { displayName: 'ADA Consumer Guide', domain: 'diabetes.org', isOfficial: true, badgeColor: 'bg-primary/10 text-primary border-primary/20' },
  'amazon': { displayName: 'Amazon', domain: 'amazon.com', isOfficial: true, badgeColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
  'trustpilot': { displayName: 'Trustpilot', domain: 'trustpilot.com', isOfficial: true, badgeColor: 'bg-success/10 text-success border-success/20' },
  'dom-pubs': { displayName: 'Diabetes & Obesity Journal', domain: 'dom-pubs.org', isOfficial: true, badgeColor: 'bg-chart-5/10 text-chart-5 border-chart-5/20' },
  'embs': { displayName: 'IEEE EMBS', domain: 'embs.org', isOfficial: true, badgeColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20' },
  'cnbc': { displayName: 'CNBC', domain: 'cnbc.com', isOfficial: true, badgeColor: 'bg-primary/10 text-primary border-primary/20' },
  'npr': { displayName: 'NPR', domain: 'npr.org', isOfficial: true, badgeColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
  'cbc': { displayName: 'CBC News', domain: 'cbc.ca', isOfficial: true, badgeColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
  'pmc': { displayName: 'PubMed Central', domain: 'ncbi.nlm.nih.gov', isOfficial: true, badgeColor: 'bg-chart-2/10 text-chart-2 border-chart-2/20' },

  // Device manufacturer sources (official)
  'omnipod': { displayName: 'Omnipod', domain: 'omnipod.com', isOfficial: true, badgeColor: 'bg-primary/10 text-primary border-primary/20' },
  'dexcom': { displayName: 'Dexcom', domain: 'dexcom.com', isOfficial: true, badgeColor: 'bg-chart-2/10 text-chart-2 border-chart-2/20' },
  'tandem': { displayName: 'Tandem', domain: 'tandemdiabetes.com', isOfficial: true, badgeColor: 'bg-accent text-accent-foreground border-border' },

  // Community / diabetes-specific sites (official content)
  'diabetesdaily': { displayName: 'Diabetes Daily', domain: 'diabetesdaily.com', isOfficial: true, badgeColor: 'bg-primary/10 text-primary border-primary/20' },
  'beyond type 1': { displayName: 'Beyond Type 1', domain: 'beyondtype1.org', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'beyondtype1': { displayName: 'Beyond Type 1', domain: 'beyondtype1.org', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'diatribe': { displayName: 'DiaTribe', domain: 'diatribe.org', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'integrated diabetes': { displayName: 'Integrated Diabetes', domain: 'integrateddiabetes.com', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'the diabetes link': { displayName: 'The Diabetes Link', domain: 'thediabeteslink.org', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'thediabeteslink': { displayName: 'The Diabetes Link', domain: 'thediabeteslink.org', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'diabetech': { displayName: 'Diabetech', domain: 'diabetech.com', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'a sweet life': { displayName: 'A Sweet Life', domain: 'asweetlife.org', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'mysugr': { displayName: 'mySugr', domain: 'mysugr.com', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'lovemylibre': { displayName: 'Love My Libre', domain: 'lovemylibre.com', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'gluroo': { displayName: 'Gluroo', domain: 'gluroo.com', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'shericolberg': { displayName: 'Sheri Colberg', domain: 'shericolberg.com', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'type1support': { displayName: 'Type 1 Support', domain: 'type1support.com', isOfficial: true, badgeColor: 'bg-success/10 text-success border-success/20' },
  'childrenwithdiabetes': { displayName: 'Children With Diabetes', domain: 'childrenwithdiabetes.com', isOfficial: true, badgeColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
  'gdi-pc': { displayName: 'GDI PC', domain: 'gdi-pc.com', isOfficial: true, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'news': { displayName: 'News', domain: 'news.google.com', isOfficial: true, badgeColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },

  // Social / community sources
  'reddit': { displayName: 'Reddit', domain: 'reddit.com', isOfficial: false, badgeColor: 'bg-warning/10 text-warning border-warning/20' },
  'twitter': { displayName: 'Twitter/X', domain: 'twitter.com', isOfficial: false, badgeColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20' },
  'facebook': { displayName: 'Facebook', domain: 'facebook.com', isOfficial: false, badgeColor: 'bg-primary/10 text-primary border-primary/20' },
  'youtube': { displayName: 'YouTube', domain: 'youtube.com', isOfficial: false, badgeColor: 'bg-destructive/10 text-destructive border-destructive/20' },
  'medium': { displayName: 'Medium', domain: 'medium.com', isOfficial: false, badgeColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  'forum': { displayName: 'Forum', domain: 'forum.com', isOfficial: false, badgeColor: 'bg-muted text-muted-foreground border-border' },
  'podcasts': { displayName: 'Podcasts', domain: 'podcasts.apple.com', isOfficial: false, badgeColor: 'bg-chart-5/10 text-chart-5 border-chart-5/20' },
  'community': { displayName: 'Community', domain: '', isOfficial: false, badgeColor: 'bg-muted text-muted-foreground border-border' },
};

// Extract domain from URL for "web" source reviews (C14)
function extractDomainFromUrl(url: string): string | null {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return null;
  }
}

/**
 * Get display name for a source. Handles "web" sources by extracting domain from URL.
 * Single source of truth — replaces 3+ duplicated functions. (C18, C19)
 */
export function getSourceDisplayName(source: string, url?: string | null): string {
  const key = source.toLowerCase();
  const config = SOURCE_CONFIG[key];
  if (config) return config.displayName;

  // Handle "web" source: extract meaningful domain from URL (C14)
  if ((key === 'web' || !source) && url) {
    const domain = extractDomainFromUrl(url);
    if (domain) {
      const domainKey = domain.split('.')[0];
      if (domainKey.length > 2) {
        return domainKey.charAt(0).toUpperCase() + domainKey.slice(1);
      }
    }
  }

  return source.charAt(0).toUpperCase() + source.slice(1).replace(/-/g, ' ');
}

/**
 * Get badge color classes for a source. (C20)
 */
export function getSourceBadgeColor(source: string): string {
  const key = source.toLowerCase();
  return SOURCE_CONFIG[key]?.badgeColor || 'bg-muted text-muted-foreground border-border';
}

/**
 * Get favicon URL for a source using DuckDuckGo icons API. (C13, N51)
 */
export function getSourceLogo(source: string, url?: string | null): string | null {
  const key = source.toLowerCase();
  const config = SOURCE_CONFIG[key];
  
  let domain = config?.domain;
  
  // For "web" source or unknown, try extracting domain from URL
  if (!domain && url) {
    domain = extractDomainFromUrl(url) || undefined;
  }
  
  if (!domain) return null;
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

/**
 * Check if a source is an official/consumer review source (not social). (C16, C17)
 */
export function isOfficialSource(source: string): boolean {
  const key = source.toLowerCase();
  return SOURCE_CONFIG[key]?.isOfficial ?? true; // default to official for unknown sources
}

/**
 * Check if a source is a social/community source. (C17)
 */
export function isSocialSource(source: string): boolean {
  const key = source.toLowerCase();
  const config = SOURCE_CONFIG[key];
  if (config) return !config.isOfficial;
  // Unknown sources default to official
  return false;
}

/**
 * Get the full config for a source
 */
export function getSourceConfig(source: string): SourceConfig | null {
  return SOURCE_CONFIG[source.toLowerCase()] || null;
}
