// Diabetes-themed nickname generator for auto-assigning usernames

const adjectives = [
  'Brave', 'Bold', 'Swift', 'Clever', 'Mighty', 'Noble', 'Steady', 'Fierce',
  'Calm', 'Quick', 'Sharp', 'Wise', 'Keen', 'Strong', 'Agile', 'Resilient',
  'Dynamic', 'Epic', 'Cosmic', 'Stellar', 'Thunder', 'Phoenix', 'Crystal', 
  'Turbo', 'Ultra', 'Mega', 'Super', 'Hyper', 'Power', 'Prime'
];

const diabetesTerms = [
  'Glucose', 'Insulin', 'Bolus', 'Basal', 'CGM', 'Dexcom', 'Loop',
  'Sensor', 'Pump', 'Beta', 'Islet', 'Pancreas', 'Sugar', 'Carb',
  'Glucagon', 'A1C', 'TIR', 'Range', 'Spike', 'Stable'
];

const warriorWords = [
  'Warrior', 'Guardian', 'Champion', 'Hero', 'Knight', 'Ranger', 'Scout',
  'Pioneer', 'Maverick', 'Legend', 'Phoenix', 'Tiger', 'Eagle', 'Dragon',
  'Wolf', 'Bear', 'Lion', 'Falcon', 'Hawk', 'Panther', 'Ninja', 'Samurai'
];

const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomNumber = (min: number = 1, max: number = 99): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateNickname = (): string => {
  const patterns = [
    // Pattern 1: Adjective + DiabetesTerm + Number
    () => `${getRandomElement(adjectives)}${getRandomElement(diabetesTerms)}${getRandomNumber()}`,
    
    // Pattern 2: DiabetesTerm + Warrior + Number
    () => `${getRandomElement(diabetesTerms)}${getRandomElement(warriorWords)}${getRandomNumber()}`,
    
    // Pattern 3: Adjective + Warrior + Number
    () => `${getRandomElement(adjectives)}${getRandomElement(warriorWords)}${getRandomNumber()}`,
    
    // Pattern 4: The + DiabetesTerm + Warrior
    () => `The${getRandomElement(diabetesTerms)}${getRandomElement(warriorWords)}`,
    
    // Pattern 5: DiabetesTerm + Number + Warrior
    () => `${getRandomElement(diabetesTerms)}${getRandomNumber()}${getRandomElement(warriorWords)}`,
  ];

  const pattern = getRandomElement(patterns);
  return pattern();
};

export const generateMultipleNicknames = (count: number = 5): string[] => {
  const nicknames: string[] = [];
  const usedNicknames = new Set<string>();

  while (nicknames.length < count) {
    const nickname = generateNickname();
    if (!usedNicknames.has(nickname)) {
      usedNicknames.add(nickname);
      nicknames.push(nickname);
    }
  }

  return nicknames;
};

// Pre-defined avatar styles for users to choose from
export const avatarStyles = [
  { id: 'default', name: 'Default', icon: '👤' },
  { id: 'warrior', name: 'Warrior', icon: '⚔️' },
  { id: 'scientist', name: 'Scientist', icon: '🔬' },
  { id: 'superhero', name: 'Superhero', icon: '🦸' },
  { id: 'robot', name: 'Robot', icon: '🤖' },
  { id: 'unicorn', name: 'Unicorn', icon: '🦄' },
  { id: 'dragon', name: 'Dragon', icon: '🐉' },
  { id: 'phoenix', name: 'Phoenix', icon: '🔥' },
  { id: 'panda', name: 'Panda', icon: '🐼' },
  { id: 'owl', name: 'Owl', icon: '🦉' },
  { id: 'wolf', name: 'Wolf', icon: '🐺' },
  { id: 'eagle', name: 'Eagle', icon: '🦅' },
];

// Generate avatar URL based on style and nickname
export const getAvatarUrl = (nickname: string, style: string = 'default'): string => {
  // Using DiceBear API for avatar generation
  const seed = encodeURIComponent(nickname);
  const styles: Record<string, string> = {
    default: 'avataaars',
    warrior: 'adventurer',
    scientist: 'bottts',
    superhero: 'adventurer-neutral',
    robot: 'bottts',
    unicorn: 'fun-emoji',
    dragon: 'adventurer',
    phoenix: 'adventurer',
    panda: 'fun-emoji',
    owl: 'fun-emoji',
    wolf: 'adventurer',
    eagle: 'adventurer',
  };

  const avatarStyle = styles[style] || 'avataaars';
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}`;
};
