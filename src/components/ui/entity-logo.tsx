import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Pill, Cpu, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { getCachedImageStatus, setCachedImageStatus } from '@/lib/imageCache';

interface EntityLogoProps {
  type: 'company' | 'medication' | 'device' | 'organization';
  name: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-5 w-5',
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-48 w-48',
};

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-16 w-16',
};

const FallbackIcon = ({ type, size }: { type: EntityLogoProps['type']; size: EntityLogoProps['size'] }) => {
  const iconClass = iconSizes[size || 'md'];
  
  switch (type) {
    case 'company':
    case 'organization':
      return <Building2 className={cn(iconClass, 'text-primary')} />;
    case 'medication':
      return <Pill className={cn(iconClass, 'text-primary')} />;
    case 'device':
      return <Cpu className={cn(iconClass, 'text-primary')} />;
    default:
      return <Heart className={cn(iconClass, 'text-primary')} />;
  }
};

// Domain mappings for company name to domain
const domainMappings: Record<string, string> = {
  // Device Manufacturers
  'dexcom': 'dexcom.com',
  'abbott': 'abbott.com',
  'freestyle': 'abbott.com',
  'libre': 'abbott.com',
  'freestyle libre': 'abbott.com',
  'medtronic': 'medtronic.com',
  'tandem': 'tandemdiabetes.com',
  'insulet': 'omnipod.com',
  'omnipod': 'omnipod.com',
  'beta bionics': 'betabionics.com',
  'ilet': 'betabionics.com',
  'senseonics': 'senseonics.com',
  'eversense': 'senseonics.com',
  'ypsomed': 'ypsomed.com',
  'roche': 'roche.com',
  'ascensia': 'ascensia.com',
  'lifescan': 'lifescan.com',
  'bayer': 'bayer.com',
  'agamatrix': 'agamatrix.com',
  'bigfoot': 'bigfootbiomedical.com',
  'diabeloop': 'diabeloop.com',
  'eoflow': 'eoflow.co.kr',
  
  // Pharmaceutical Companies
  'novo nordisk': 'novonordisk.com',
  'eli lilly': 'lilly.com',
  'lilly': 'lilly.com',
  'sanofi': 'sanofi.com',
  'vertex': 'vrtx.com',
  'astrazeneca': 'astrazeneca.com',
  'boehringer': 'boehringer-ingelheim.com',
  'merck': 'merck.com',
  'janssen': 'janssen.com',
  'johnson': 'jnj.com',
  'takeda': 'takeda.com',
  'mannkind': 'mannkind.com',
  'afrezza': 'mannkind.com',
  'xeris': 'xerispharma.com',
  'zealand': 'zealandpharma.com',
  'mylan': 'viatris.com',
  'viatris': 'viatris.com',
  'biocon': 'biocon.com',
  'wockhardt': 'wockhardt.com',
  'gan & lee': 'ganlee.com',
  'gan lee': 'ganlee.com',
  'tonghua': 'dongbaotech.com',
  'provention': 'sanofi.com',
  'tzield': 'sanofi.com',
  'diamyd': 'diamyd.com',
  'amgen': 'amgen.com',
  'teva': 'tevapharm.com',
  'semma': 'vrtx.com',
  
  // Advocacy & Research Organizations
  'jdrf': 'jdrf.org',
  'breakthrough t1d': 'breakthrought1d.org',
  'american diabetes': 'diabetes.org',
  'diabetes uk': 'diabetes.org.uk',
  'beyond type 1': 'beyondtype1.org',
  'diatribe': 'diatribe.org',
  'diabetesmine': 'diabetesmine.com',
  'college diabetes': 'collegediabetesnetwork.org',
  'children with diabetes': 'childrenwithdiabetes.com',
  'diabetes research institute': 'diabetesresearch.org',
  'helmsley': 'helmsleytrust.org',
  'joslin': 'joslin.org',
  't1d exchange': 't1dexchange.org',
  'diabetessisters': 'diabetessisters.org',
  'diabetes sisters': 'diabetessisters.org',
  'international diabetes federation': 'idf.org',
  'idf': 'idf.org',
  
  // Technology & Digital Health
  'tidepool': 'tidepool.org',
  'glooko': 'glooko.com',
  'livongo': 'teladoc.com',
  'one drop': 'onedrop.today',
  'mysugr': 'mysugr.com',
  'virta': 'virtahealth.com',
  'omada': 'omadahealth.com',
  'dariohealth': 'dariohealth.com',
  'companion medical': 'companionmedical.com',
  'verily': 'verily.com',
  'onduo': 'onduo.com',
  'cequr': 'cequr.com',
  'typezero': 'typezero.com',
  'know labs': 'knowlabs.co',
  'noom': 'noom.com',
  'teladoc': 'teladoc.com',
  'cecelia health': 'ceceliahealth.com',
  'lark': 'lark.com',
  'podimetrics': 'podimetrics.com',
  'sugarmate': 'sugarmate.io',
  'nightscout': 'nightscout.info',
  'xdrip': 'github.com/NightscoutFoundation',
  'loop': 'loopkit.github.io',
  'androidaps': 'androidaps.readthedocs.io',
  'aaps': 'androidaps.readthedocs.io',
  'calorie king': 'calorieking.com',
  'diabits': 'diabits.com',
  'glucose buddy': 'glucosebuddy.com',
  'diabetes:m': 'diabetes-m.com',
  
  // Biotech & Research
  'crispr': 'crisprtx.com',
  'viacyte': 'viacyte.com',
  'sigilon': 'sigilon.com',
  'sernova': 'sernova.com',
  'imcyse': 'imcyse.com',
  'precigen': 'precigen.com',
  'oramed': 'oramed.com',
  'encellin': 'encellin.com',
  'insitro': 'insitro.com',
  
  // Research Institutions & Universities
  'nih': 'nih.gov',
  'niaid': 'niaid.nih.gov',
  'national institutes': 'nih.gov',
  'stanford': 'stanford.edu',
  'harvard': 'harvard.edu',
  'yale': 'yale.edu',
  'university of florida': 'ufl.edu',
  'university of miami': 'miami.edu',
  'barbara davis': 'barbaradaviscenter.org',
  'ucsd': 'ucsd.edu',
  'university of alberta': 'ualberta.ca',
  'karolinska': 'ki.se',
  'university of chicago': 'uchicago.edu',
  'emory': 'emory.edu',
  'mayo clinic': 'mayoclinic.org',
  'cleveland clinic': 'clevelandclinic.org',
  'johns hopkins': 'jhu.edu',
  'columbia': 'columbia.edu',
  'massachusetts general': 'massgeneral.org',
  'children\'s hospital': 'childrenshospital.org',
  'boston children': 'childrenshospital.org',
};

// Extract domain from company name for logo lookup
function extractDomainFromName(name: string): string | null {
  const lowerName = name.toLowerCase();
  
  for (const [key, domain] of Object.entries(domainMappings)) {
    if (lowerName.includes(key)) {
      return domain;
    }
  }

  // Try to extract domain from name directly
  const cleanName = lowerName
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 20);
  
  if (cleanName.length > 2) {
    return `${cleanName}.com`;
  }

  return null;
}

// Extract domain from a full URL
function extractDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

export function EntityLogo({ 
  type, 
  name, 
  logoUrl, 
  websiteUrl,
  size = 'md',
  className 
}: EntityLogoProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedCache, setCheckedCache] = useState(false);

  // Build list of logo sources to try in order
  const logoSources = useMemo(() => {
    const sources: string[] = [];
    const domain = extractDomainFromName(name);
    const websiteDomain = websiteUrl ? extractDomainFromUrl(websiteUrl) : null;
    
    // 1. Database URL (if provided)
    if (logoUrl) {
      sources.push(logoUrl);
    }
    
    // 2. Clearbit URL (derived from name mapping)
    if (domain) {
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      if (!sources.includes(clearbitUrl)) {
        sources.push(clearbitUrl);
      }
    }
    
    // 3. Clearbit from website URL domain
    if (websiteDomain) {
      const clearbitFromWebsite = `https://logo.clearbit.com/${websiteDomain}`;
      if (!sources.includes(clearbitFromWebsite)) {
        sources.push(clearbitFromWebsite);
      }
    }
    
    // 4. Google S2 Favicon (high-res) - from mapped domain
    if (domain) {
      sources.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    }
    
    // 5. Google S2 Favicon from website URL
    if (websiteDomain && websiteDomain !== domain) {
      sources.push(`https://www.google.com/s2/favicons?domain=${websiteDomain}&sz=128`);
    }
    
    return sources;
  }, [logoUrl, websiteUrl, name]);

  const currentSource = logoSources[currentSourceIndex];

  // Check cache for current source and skip failed URLs
  useEffect(() => {
    const checkCacheAndAdvance = async () => {
      if (!currentSource || checkedCache) return;
      
      const status = await getCachedImageStatus(currentSource);
      
      if (status === 'failed') {
        // Skip this source, try next
        if (currentSourceIndex < logoSources.length - 1) {
          setCurrentSourceIndex(prev => prev + 1);
        } else {
          setShowFallback(true);
          setIsLoading(false);
        }
      } else {
        setCheckedCache(true);
        setIsLoading(true);
      }
    };

    checkCacheAndAdvance();
  }, [currentSource, currentSourceIndex, logoSources.length, checkedCache]);

  const handleImageLoad = async () => {
    setIsLoading(false);
    if (currentSource) {
      await setCachedImageStatus(currentSource, 'valid');
    }
  };

  const handleImageError = async () => {
    if (currentSource) {
      await setCachedImageStatus(currentSource, 'failed');
    }
    
    if (currentSourceIndex < logoSources.length - 1) {
      // Try next source
      setCurrentSourceIndex(prev => prev + 1);
      setCheckedCache(false);
      setIsLoading(true);
    } else {
      // All sources exhausted, show fallback
      setShowFallback(true);
      setIsLoading(false);
    }
  };

  // Reset state when props change
  useEffect(() => {
    setCurrentSourceIndex(0);
    setShowFallback(false);
    setIsLoading(true);
    setCheckedCache(false);
  }, [logoUrl, websiteUrl, name]);

  const shouldShowFallback = showFallback || logoSources.length === 0;

  return (
    <div 
      className={cn(
        'rounded-lg bg-white dark:bg-muted border flex items-center justify-center overflow-hidden flex-shrink-0 relative',
        sizeClasses[size],
        className
      )}
    >
      {shouldShowFallback ? (
        <div className="flex items-center justify-center w-full h-full bg-primary/10">
          <FallbackIcon type={type} size={size} />
        </div>
      ) : (
        <>
          {isLoading && (
            <Skeleton className="absolute inset-0 rounded-lg" />
          )}
          <img
            key={currentSource} // Force re-mount on source change
            src={currentSource}
            alt={`${name} logo`}
            className={cn(
              "w-full h-full object-contain p-1 transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </>
      )}
    </div>
  );
}

export default EntityLogo;
