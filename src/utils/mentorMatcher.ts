/**
 * Domain 4.4: Mentor/Mentee Matching Algorithm
 * Scores compatibility based on device overlap, experience, specialties.
 */

export interface MentorProfile {
  userId: string;
  yearsWithT1d: number;
  devicesUsed: string[]; // e.g. ['Dexcom G7', 'Tandem t:slim X2']
  specialties: string[]; // e.g. ['pregnancy', 'athletics', 'pumping']
  maxMentees: number;
  currentMenteeCount: number;
}

export interface MenteePreferences {
  currentDevices: string[];
  desiredSpecialties: string[];
  yearsWithT1d: number;
}

export interface MatchResult {
  mentorUserId: string;
  score: number; // 0-100
  breakdown: {
    deviceOverlap: number;
    specialtyOverlap: number;
    experienceBonus: number;
    availabilityBonus: number;
  };
}

/**
 * Score mentor-mentee compatibility.
 */
export function scoreMentorMatch(
  mentor: MentorProfile,
  mentee: MenteePreferences
): MatchResult {
  // Device overlap (0-40 points)
  const deviceMatches = mentee.currentDevices.filter((d) =>
    mentor.devicesUsed.some((md) => md.toLowerCase() === d.toLowerCase())
  ).length;
  const deviceOverlap = Math.min(40, (deviceMatches / Math.max(mentee.currentDevices.length, 1)) * 40);

  // Specialty overlap (0-30 points)
  const specialtyMatches = mentee.desiredSpecialties.filter((s) =>
    mentor.specialties.some((ms) => ms.toLowerCase() === s.toLowerCase())
  ).length;
  const specialtyOverlap = Math.min(30, (specialtyMatches / Math.max(mentee.desiredSpecialties.length, 1)) * 30);

  // Experience bonus (0-20 points) - more experienced mentors score higher
  const experienceGap = mentor.yearsWithT1d - mentee.yearsWithT1d;
  const experienceBonus = experienceGap >= 5 ? 20 : experienceGap >= 2 ? 15 : experienceGap >= 0 ? 10 : 5;

  // Availability bonus (0-10 points)
  const slotsAvailable = mentor.maxMentees - mentor.currentMenteeCount;
  const availabilityBonus = slotsAvailable >= 3 ? 10 : slotsAvailable >= 1 ? 5 : 0;

  const score = Math.round(deviceOverlap + specialtyOverlap + experienceBonus + availabilityBonus);

  return {
    mentorUserId: mentor.userId,
    score: Math.min(100, score),
    breakdown: {
      deviceOverlap: Math.round(deviceOverlap),
      specialtyOverlap: Math.round(specialtyOverlap),
      experienceBonus,
      availabilityBonus,
    },
  };
}

/**
 * Rank mentors by compatibility score.
 */
export function rankMentors(
  mentors: MentorProfile[],
  mentee: MenteePreferences,
  limit = 10
): MatchResult[] {
  return mentors
    .filter((m) => m.currentMenteeCount < m.maxMentees)
    .map((m) => scoreMentorMatch(m, mentee))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
