// Source category mapping for community posts
export type SourceCategory = 'CGM' | 'Pumps' | 'Lifestyle' | 'Parents' | 'Tech' | 'General';

interface CategoryConfig {
  label: string;
  color: string;
  sources: string[];
}

export const SOURCE_CATEGORIES: Record<SourceCategory, CategoryConfig> = {
  CGM: {
    label: 'CGM',
    color: 'bg-primary/10 text-primary border-primary/20',
    sources: ['r/dexcom', 'r/DexcomG7', 'r/Libre', 'r/cgm', 'r/freestyle'],
  },
  Pumps: {
    label: 'Pumps',
    color: 'bg-accent/10 text-accent-foreground border-accent/20',
    sources: ['r/Omnipod', 'r/insulinpump', 'r/TandemDiabetes', 'r/medtronic', 'r/OmnipodDash', 'r/OmnipodG6'],
  },
  Lifestyle: {
    label: 'Lifestyle',
    color: 'bg-success/10 text-success border-success/20',
    sources: ['r/diabetes_t1', 'r/T1D', 'r/diabeats', 'r/diabetes', 'r/DiabetesRecipes', 'r/diabeticfitness'],
  },
  Parents: {
    label: 'Parents',
    color: 'bg-brand-red/10 text-brand-red border-brand-red/20',
    sources: ['r/T1Dparents', 'r/Parents_of_T1D', 'r/T1Dkids', 'r/diabetesparents'],
  },
  Tech: {
    label: 'Tech/DIY',
    color: 'bg-warning/10 text-warning border-warning/20',
    sources: ['r/loopkit', 'r/OpenAPS', 'r/AndroidAPS', 'r/Nightscout', 'r/LoopDIY'],
  },
  General: {
    label: 'General',
    color: 'bg-muted text-muted-foreground border-border',
    sources: [],
  },
};

export function getSourceCategory(source: string): SourceCategory {
  for (const [category, config] of Object.entries(SOURCE_CATEGORIES)) {
    if (config.sources.some(s => source.toLowerCase().includes(s.toLowerCase().replace('r/', '')))) {
      return category as SourceCategory;
    }
  }
  return 'General';
}

export function getCategoryConfig(category: SourceCategory): CategoryConfig {
  return SOURCE_CATEGORIES[category];
}

export function getCategoryBadgeColor(source: string): string {
  const category = getSourceCategory(source);
  return SOURCE_CATEGORIES[category].color;
}
