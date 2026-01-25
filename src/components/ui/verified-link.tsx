import React from 'react';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedLinkProps {
  href: string | null | undefined;
  fallbackHref?: string;
  isVerified?: boolean;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  showVerificationBadge?: boolean;
}

/**
 * A link component that handles external links with fallback support
 * and optional verification status display.
 */
export function VerifiedLink({
  href,
  fallbackHref,
  isVerified,
  children,
  className,
  showIcon = true,
  showVerificationBadge = false
}: VerifiedLinkProps) {
  // Determine the final URL to use
  const finalHref = href || fallbackHref;

  // Don't render if no valid URL
  if (!finalHref) {
    return <span className={cn("text-muted-foreground", className)}>{children}</span>;
  }

  // Ensure URL has protocol
  const normalizedHref = finalHref.startsWith('http') 
    ? finalHref 
    : finalHref.startsWith('//')
      ? `https:${finalHref}`
      : `https://${finalHref}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If primary link fails, try fallback
    if (!href && fallbackHref) {
      // Already using fallback, proceed normally
      return;
    }
  };

  return (
    <a
      href={normalizedHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline transition-colors",
        className
      )}
    >
      {children}
      {showIcon && <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />}
      {showVerificationBadge && isVerified !== undefined && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="ml-0.5">
              {isVerified ? (
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {isVerified ? 'Link verified' : 'Link not verified'}
          </TooltipContent>
        </Tooltip>
      )}
    </a>
  );
}

/**
 * Common fallback URL patterns for known sources
 */
export const linkFallbacks = {
  clinicalTrials: (nctId: string) => `https://clinicaltrials.gov/study/${nctId}`,
  pubmed: (pmid: string) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
  doi: (doi: string) => `https://doi.org/${doi}`,
  googlePatents: (patentId: string) => `https://patents.google.com/patent/${patentId}`,
  reddit: (permalink: string) => {
    if (permalink.startsWith('http')) return permalink;
    return `https://www.reddit.com${permalink.startsWith('/') ? '' : '/'}${permalink}`;
  },
  fdaMaude: () => 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfMAUDE/search.cfm',
  semanticScholar: (paperId: string) => `https://www.semanticscholar.org/paper/${paperId}`,
  crunchbase: (slug: string) => `https://www.crunchbase.com/organization/${slug}`,
  linkedin: (slug: string) => `https://www.linkedin.com/company/${slug}`,
  openAlex: (id: string) => `https://openalex.org/works/${id}`,
  googleScholar: (title: string) => `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`,
  waybackMachine: (url: string) => `https://web.archive.org/web/${url}`,
  pmc: (pmcId: string) => `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}`,
  biorxiv: (doi: string) => `https://www.biorxiv.org/content/${doi}`,
  medrxiv: (doi: string) => `https://www.medrxiv.org/content/${doi}`,
};

/**
 * Try to construct a fallback URL from identifiers in the data
 */
export function getFallbackUrl(data: {
  doi?: string | null;
  pubmed_id?: string | null;
  pmc_id?: string | null;
  nct_id?: string | null;
  patent_id?: string | null;
  title?: string | null;
  original_url?: string | null;
}): string | null {
  if (data.doi) return linkFallbacks.doi(data.doi);
  if (data.pubmed_id) return linkFallbacks.pubmed(data.pubmed_id);
  if (data.pmc_id) return linkFallbacks.pmc(data.pmc_id);
  if (data.nct_id) return linkFallbacks.clinicalTrials(data.nct_id);
  if (data.patent_id) return linkFallbacks.googlePatents(data.patent_id);
  if (data.title) return linkFallbacks.googleScholar(data.title);
  if (data.original_url) return linkFallbacks.waybackMachine(data.original_url);
  return null;
}

/**
 * Normalizes and validates a URL, returning null if invalid
 */
export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    // Handle URLs without protocol
    const withProtocol = url.startsWith('http') 
      ? url 
      : url.startsWith('//')
        ? `https:${url}`
        : `https://${url}`;
    
    new URL(withProtocol);
    return withProtocol;
  } catch {
    return null;
  }
}
