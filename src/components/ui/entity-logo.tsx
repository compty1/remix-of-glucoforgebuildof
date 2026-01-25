import React, { useState, useMemo } from 'react';
import { Building2, Pill, Cpu, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntityLogoProps {
  type: 'company' | 'medication' | 'device' | 'organization';
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
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

// Extract domain from company name for Clearbit fallback
function extractDomainFromName(name: string): string | null {
  const domainMappings: Record<string, string> = {
    // Device Manufacturers
    'dexcom': 'dexcom.com',
    'abbott': 'abbott.com',
    'freestyle': 'abbott.com', // FreeStyle Libre is Abbott product
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
    'gan & lee': 'ganlee.com', // Correct domain
    'gan lee': 'ganlee.com',
    'tonghua': 'dongbaotech.com',
    'provention': 'sanofi.com', // Provention Bio was acquired by Sanofi in 2023
    'tzield': 'sanofi.com', // Tzield (teplizumab) now marketed by Sanofi
    'diamyd': 'diamyd.com',
    'amgen': 'amgen.com',
    'teva': 'tevapharm.com', // Correct domain is tevapharm.com
    
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
    
    // Technology & Digital Health
    'tidepool': 'tidepool.org',
    'glooko': 'glooko.com',
    'livongo': 'livongo.com',
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
  };

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

export function EntityLogo({ 
  type, 
  name, 
  logoUrl, 
  size = 'md',
  className 
}: EntityLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [clearbitError, setClearbitError] = useState(false);

  const clearbitUrl = useMemo(() => {
    const domain = extractDomainFromName(name);
    return domain ? `https://logo.clearbit.com/${domain}` : null;
  }, [name]);

  const displayUrl = logoUrl || (!clearbitError ? clearbitUrl : null);
  const showFallback = !displayUrl || imageError;

  const handleImageError = () => {
    if (displayUrl === logoUrl && clearbitUrl) {
      // Try clearbit as fallback
      setImageError(true);
    } else {
      setClearbitError(true);
      setImageError(true);
    }
  };

  return (
    <div 
      className={cn(
        'rounded-lg bg-white dark:bg-muted border flex items-center justify-center overflow-hidden flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {showFallback ? (
        <div className="flex items-center justify-center w-full h-full bg-primary/10">
          <FallbackIcon type={type} size={size} />
        </div>
      ) : (
        <img
          src={imageError && clearbitUrl ? clearbitUrl : displayUrl!}
          alt={`${name} logo`}
          className="w-full h-full object-contain p-1"
          onError={handleImageError}
          loading="lazy"
        />
      )}
    </div>
  );
}

export default EntityLogo;
