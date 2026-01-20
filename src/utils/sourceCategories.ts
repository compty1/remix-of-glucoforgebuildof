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
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    sources: ['r/dexcom', 'r/DexcomG7', 'r/Libre', 'r/cgm', 'r/freestyle'],
  },
  Pumps: {
    label: 'Pumps',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    sources: ['r/Omnipod', 'r/insulinpump', 'r/TandemDiabetes', 'r/medtronic', 'r/OmnipodDash', 'r/OmnipodG6'],
  },
  Lifestyle: {
    label: 'Lifestyle',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    sources: ['r/diabetes_t1', 'r/T1D', 'r/diabeats', 'r/diabetes', 'r/DiabetesRecipes', 'r/diabeticfitness'],
  },
  Parents: {
    label: 'Parents',
    color: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    sources: ['r/T1Dparents', 'r/Parents_of_T1D', 'r/T1Dkids', 'r/diabetesparents'],
  },
  Tech: {
    label: 'Tech/DIY',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    sources: ['r/loopkit', 'r/OpenAPS', 'r/AndroidAPS', 'r/Nightscout', 'r/LoopDIY'],
  },
  General: {
    label: 'General',
    color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
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
