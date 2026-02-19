import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStreaks } from '@/hooks/useStreaks';
import { useAchievements } from '@/hooks/useAchievements';

/**
 * Hook to track user engagement automatically
 * - Records daily platform visits
 * - Updates streaks on login
 * - Checks for achievement triggers
 */
export function useEngagementTracking() {
  const { user } = useAuthStore();
  const { recordVisit } = useStreaks();
  const { checkTrigger } = useAchievements();
  const hasTrackedToday = useRef(false);
  const lastTrackedDate = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      hasTrackedToday.current = false;
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Only track once per day per session
    if (lastTrackedDate.current === today) {
      return;
    }

    const trackEngagement = async () => {
      try {
        // Record the platform visit streak
        await recordVisit();
        
        // Track the visit for explorer achievement
        await checkTrigger('visit_section', 1);
        
        lastTrackedDate.current = today;
        hasTrackedToday.current = true;
        
      } catch {
        // Silently fail - don't disrupt user experience
      }
    };

    // Small delay to ensure auth is fully established
    const timer = setTimeout(trackEngagement, 2000);
    
    return () => clearTimeout(timer);
  }, [user, recordVisit, checkTrigger]);

  return;
}

/**
 * Hook to track specific user actions for achievements
 */
export function useActionTracking() {
  const { checkTrigger, awardAchievement } = useAchievements();

  const trackUpload = async () => {
    await awardAchievement('first_upload');
  };

  const trackSurveyCompletion = async () => {
    await checkTrigger('complete_survey', 1);
  };

  const trackComment = async () => {
    await checkTrigger('post_comment', 1);
  };

  const trackStoryShare = async () => {
    await checkTrigger('share_story', 1);
  };

  const trackArticleRead = async () => {
    await checkTrigger('read_article', 1);
  };

  const trackTherapyFollow = async () => {
    await checkTrigger('follow_therapy', 1);
  };

  const trackDeviceReview = async () => {
    await checkTrigger('review_device', 1);
  };

  const trackMedicationReview = async () => {
    await checkTrigger('review_medication', 1);
  };

  const trackBookmark = async () => {
    await checkTrigger('bookmark_item', 1);
  };

  return {
    trackUpload,
    trackSurveyCompletion,
    trackComment,
    trackStoryShare,
    trackArticleRead,
    trackTherapyFollow,
    trackDeviceReview,
    trackMedicationReview,
    trackBookmark,
  };
}
